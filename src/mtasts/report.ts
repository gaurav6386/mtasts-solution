import { AllowedRecordTypes, AllowedStsReportVersion, IGeneratedRecord, IGenratorError, RecordTagSchema, RecordTypes, STSReportRecord, STSReportUriSchemes, ValidationResponse } from "../types";
import { validateEmail, validateRecord, validateURL } from "../utils/validator";
import dns from 'dns';

export class STSReport {
  public static type: AllowedRecordTypes = RecordTypes.STSREPORT
  constructor(public domainName: string) { }

  /** Generate TLSRPT policy report */
  static async generate(scheme: STSReportUriSchemes, uri: string): Promise<IGeneratedRecord> {
    let errors: IGenratorError[] = [];
    let modURI = '';
    switch(scheme){
      case 'mailto': {
        const isValidEmail = await validateEmail(uri);
        if(!isValidEmail) errors.push({ message: 'Invalid email specified'});
        else modURI = uri;
        break;
      }
      case 'https': {
        const isValidURL = await validateURL(uri);
        if(!isValidURL) errors.push({ message: 'Invalid URL specified' });
        else modURI = `//${uri}`
        break;
      }
    }
    
    if(errors.length) return { record: '', errors }
    
    const stsReportRecord: STSReportRecord = `v=${AllowedStsReportVersion.TLSRPTv1}; rua=${scheme}:${modURI}`
    return { record: stsReportRecord, errors }
  }

  /** Validate the specified TLSRPT record */
  static validate(record: STSReportRecord): Promise<ValidationResponse> {
    return new Promise((resolve, reject) => {
      try {
        if(!record) throw new Error('Please supply sts-report record for validation!');
        const validatedRecord = validateRecord(this.type, record)
        if(!validatedRecord.valid) reject(validatedRecord.errors);
        resolve({ valid: validatedRecord.valid, tags: validatedRecord.tags })
      } catch(err) {
        reject(err)
      }
    })
  }

  /** Parse the specified TLSRPT record */
  static parse(record: STSReportRecord): Promise<RecordTagSchema> {
    return new Promise((resolve, reject) => {
      this.validate(record).then(r => resolve(r.tags))
      .catch(err => reject(err))
    })
  }

  /** Fetch currently hosted TLSRPT policy record on DNS */
  fetch(): Promise<{ record: string }> {
    return new Promise((resolve, reject) => {
      dns.resolveTxt(`_smtp._tls.${this.domainName}`, (err, tlsReport) => {
        if (err) {
          if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
            return reject(new Error('MTASTS SMTP Record is not found'));
          return reject(err.message);
        }
        var record: string = '';
        for (var i = 0; i < tlsReport.length; i++) {
          for (var j = 0; j < tlsReport[i].length; j++) {
            if (tlsReport[i][j].startsWith('v=TLSRPT')) {
              record = tlsReport[i][j];
              break;
            }
          }
          if (record && tlsReport[i].length > 0) record = tlsReport[i].join("")
          if (record != null) break;
        }
        return resolve({ record: !!record ? record: '' });
      })
    })
  }
}