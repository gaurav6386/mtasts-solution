import { AllowedRecordTypes, AllowedSTSPolicyKey, AllowedSTSPolicyMode, AllowedStsPolicyVersion, IGeneratedRecord, IPolicyValidationError, IPolicyValidationResponse, ValidationResponse, PolicyFileFormat, RecordTypes, STSPolicyMode, STSPolicyRecord, STSPolicyVersion, RecordTagSchema } from "../types"
import { hasValidPolicyKeys, hasValidPolicyMode } from "../types/guard";
import { validateRecord } from "../utils/validator";
import dns from 'dns';

export class STSPolicy {
  public type: AllowedRecordTypes = RecordTypes.STSPOLICY
  constructor(
    public domainName: string,
  ) {
    if(!domainName) throw new Error("Domain name is required!");
  }

  /** Generate new MTA-STS Policy Record  */
  generate(): IGeneratedRecord {
    const policyRecord: STSPolicyRecord = `v=${AllowedStsPolicyVersion.STSv1}; id=${Date.now()}`        
    return { record: policyRecord }
  }

  #parsePolicyFileContent(text: string): Promise<IPolicyValidationResponse> {
    return new Promise((resolve, reject) => {
      if(!text) reject('No content found!');
      let parsedData: PolicyFileFormat = {
        version: '', mode: '', mx: [], max_age: 0 
      };
      let errors: IPolicyValidationError[] = [];
      text.split('\n').forEach(line => {
        const [key, value] = line.trim()?.split(':').map(r => r?.trim());
        if(key === AllowedSTSPolicyKey.MODE && !hasValidPolicyMode(value))
          errors.push({ found: value, expected: Object.values(AllowedSTSPolicyMode), message: 'Incorrect mode exists on the hosted policy file' })
        switch(key) {
          case AllowedSTSPolicyKey.MODE:
            parsedData[key] = value as STSPolicyMode;  break;
          case AllowedSTSPolicyKey.VERSION:
            parsedData[key] = value as STSPolicyVersion;  break;
          case AllowedSTSPolicyKey.MX: parsedData[key].push(value); break;
          case AllowedSTSPolicyKey.MAXAGE: parsedData[key] = Number(value);
          if(!hasValidPolicyKeys(key)) errors.push({ found: key, expected: Object.values(AllowedSTSPolicyKey), message: 'Incorrect key found in hosted policy file'})
        }
      })
      if(errors.length) resolve({ valid: false, data: parsedData, errors })
      else resolve({ valid: true, data: parsedData, errors })
    })
  }

  /** Check if policy file exist for a domain */
  checkPolicyFile(): Promise<IPolicyValidationResponse> {
    return new Promise((resolve, reject) => {
      const policyUri = `https://mta-sts.${this.domainName}/.well-known/mta-sts.txt`;
      
      fetch(policyUri)
      .then(r => r.text())
      .then(r => this.#parsePolicyFileContent(r))
      .then(r => resolve(r))
      .catch(err => {
        switch(err.cause?.code) {
          case 'ENOTFOUND': return reject(new Error(`MTA-STS policy file not hosted on ${policyUri}`)); 
          default: reject(err)
        }
      })
    })
  }

  /** Validate the MTA-STS Policy record */
  validate(record: STSPolicyRecord): Promise<ValidationResponse> {
    return new Promise((resolve, reject) => {
      try {
        if(!record) throw new Error('Please supply sts-policy record for validation!');
        const validatedRecord = validateRecord(this.type, record);
        if(!validatedRecord.valid) reject(validatedRecord.errors);
        else resolve({ valid: validatedRecord.valid, tags: validatedRecord.tags });
      } catch(err: any) {
        reject(err.message)
      }
    })
  }

  /** Parse the specified Policy TXT record */
  parse(record: STSPolicyRecord): Promise<RecordTagSchema> {
    return new Promise((resolve, reject) => {
      this.validate(record).then(r => resolve(r.tags))
      .catch(err => reject(err))
    })
  }

  /** Fetch existing MTA-STS policy record from DNS */
  fetch(): Promise<{ record: string }> {
    return new Promise((resolve, reject) => {
      if(!this.domainName) reject("Domain name is required!");
      dns.resolveTxt(`_mta-sts.${this.domainName}`, (err, stsPolicyRecord) => {
        if (err) {
          if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
            return reject(new Error('MTASTS Policy Record is not found'));
          return reject(err.message);
        }
        var record = null;
        for (var i = 0; i < stsPolicyRecord.length; i++) {
          for (var j = 0; j < stsPolicyRecord[i].length; j++) {
            if (stsPolicyRecord[i][j] && stsPolicyRecord[i][j].trim().startsWith('v=STS')) {
              record = stsPolicyRecord[i][j];
              break;
            }
          }
          if (record && stsPolicyRecord[i].length > 0) record = stsPolicyRecord[i].join("")
          if (record != null) break;
        }

        return resolve({ record: !!record ? record: '' });
      })
    })
  }
}