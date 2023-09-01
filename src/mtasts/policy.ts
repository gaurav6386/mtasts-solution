import { AllowedRecordTypes, AllowedStsPolicyVersion, IGeneratedRecord, IValidationRecord, RecordTypes, STSPolicyRecord } from "../types"
import { validateRecord } from "../utils/validator";
import dns from 'dns';

export class STSPolicy {
  public type: AllowedRecordTypes = RecordTypes.STSPOLICY
  constructor(
    public domainName: string,
  ) {
    if(!domainName) throw new Error("Domain name is required!");
  }

  generate(): IGeneratedRecord {
    const policyRecord: STSPolicyRecord = `v=${AllowedStsPolicyVersion.STSv1}; id=${Date.now()}`        
    return { record: policyRecord, errors: [] }
  }

  validate(record: STSPolicyRecord): Promise<IValidationRecord> {
    return new Promise((resolve, reject) => {
      try {
        const validatedRecord = validateRecord(this.type, record);
        resolve(validatedRecord);
      } catch(err: any) {
        reject(err.message)
      }
    })
  }

  fetch(): Promise<string> {
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
            if (stsPolicyRecord[i][j].startsWith('v=STS')) {
              record = stsPolicyRecord[i][j];
              break;
            }
          }
          if (record && stsPolicyRecord[i].length > 0) record = stsPolicyRecord[i].join("")
          if (record != null) break;
        }
        
        if (record == null) return reject(new Error('STS Policy Record not available'));
        return resolve(record);
      })
    })
  }
}