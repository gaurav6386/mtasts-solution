import { fetcher } from "./actions/fetcher";
import { parser } from "./actions/parser";
import { FetchResponseSchema, RecordTagSchema, RecordType, Record_Types } from "./types";

export { Record_Types }

/**
 * 
 * @param record 
 * @param recordType ENUM ['stspolicy', 'stsreport']
 */
export function parseRecord(record: string, recordType: RecordType): Promise<RecordTagSchema> {
    return new Promise((resolve, reject) => {
        parser(record, recordType).then(parsedData => { 
            let defaultTags: RecordTagSchema = {};
            if(parsedData){
                if(parsedData.messages && parsedData.messages.length) return reject(parsedData.messages);
                resolve(parsedData?.tags);
            }else resolve(defaultTags);
        }).catch(err => {
            reject(err);
        })
    })
}

export function fetchRecord(domainName: string, recordType:RecordType = Record_Types.MTASTS): Promise<FetchResponseSchema> {
    return new Promise((resolve, reject) => {
        fetcher(domainName, recordType).then(records => {
            if(typeof records == 'string') return parseRecord(records, recordType).then(r => {
                const parsedData: FetchResponseSchema = { record: records, tags: {  } };
                switch(recordType) {
                    case Record_Types.STSPOLICY: parsedData.tags = { stspolicy: r }; break;
                    case Record_Types.STSREPORT: parsedData.tags = { stsreport: r }; break;
                }
                resolve(parsedData);
            })
            else if(records.stsPolicyRecord.data) return parseRecord(records.stsPolicyRecord.data, Record_Types.STSPOLICY)
                .then(stsPolicyTag => {
                    if(records.stsSmtpRecord.data) return parseRecord(records.stsSmtpRecord.data, Record_Types.STSREPORT).then(stsReportTag => {
                        const parsedData: FetchResponseSchema = { record: records, tags: { stspolicy: stsPolicyTag, stsreport: stsReportTag } };
                        resolve(parsedData)
                    }).catch(err => reject(err));
                }).catch(err => reject(err));
        }).catch(err => {
            reject(err);
        })
    })
}