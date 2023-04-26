import { fetcher } from "./actions/fetcher";
import { parser } from "./actions/parser";
import { RecordType, Record_Types } from "./types";

export { Record_Types }

/**
 * 
 * @param record 
 * @param recordType ENUM ['stspolicy', 'stsreport']
 */
export function recordParser(record: string, recordType: RecordType) {
    return new Promise((resolve, reject) => {
        parser(record, recordType).then(parsedData => {
            if(parsedData?.messages && parsedData.messages.length) return reject(parsedData.messages);
            resolve(parsedData?.tags);
        }).catch(err => {
            reject(err);
        })
    })
}

export function recordFetcher(domainName: string, recordType:RecordType = Record_Types.MTASTS) {
    return new Promise((resolve, reject) => {
        fetcher(domainName, recordType).then(records => {
            if(typeof records == 'string') return recordParser(records, recordType).then(r => resolve({ record: records, tags: r }))
            if(records.stsPolicyRecord.data) return recordParser(records.stsPolicyRecord.data, Record_Types.STSPOLICY)
                .then(stsPolicyTag => {
                    if(records.stsSmtpRecord.data) return recordParser(records.stsSmtpRecord.data, Record_Types.STSREPORT).then(stsReportTag => resolve({record: records, tags: { stsReportTag, stsPolicyTag }})).catch(err => reject(err));
                }).catch(err => reject(err));
        }).catch(err => {
            reject(err);
        })
    })
}