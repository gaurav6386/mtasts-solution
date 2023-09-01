import { AllowedRecordTypes, AllowedStsReportVersion, IGeneratedRecord, IValidationRecord, RecordTypes, STSReportRecord, ValidSTSRua } from "../types";
import { validateRecord } from "../utils/validator";
import dns from 'dns';

export class STSReport {
  public type: AllowedRecordTypes = RecordTypes.STSREPORT
  constructor(public domainName: string) { }

  generate(rua: ValidSTSRua): IGeneratedRecord {
    const stsReportRecord: STSReportRecord = `v=${AllowedStsReportVersion.TLSRPTv1}; rua=${rua}`
    return { record: stsReportRecord, errors: [] }
  }

  validate(record: STSReportRecord): Promise<IValidationRecord> {
    return new Promise((resolve, reject) => {
      try {
        const validatedRecord = validateRecord(this.type, record)
        resolve(validatedRecord)
      } catch(err) {
        reject(err)
      }
    })
  }

  fetch(): Promise<string> {
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
        if (record == null) return reject(new Error('MTASTS SMTP Record is not set.'));
        return resolve(record);
      })
    })
  }
}