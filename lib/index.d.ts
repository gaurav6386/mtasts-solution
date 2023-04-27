import { FetchResponseSchema, RecordTagSchema, RecordType, Record_Types } from "./types";
export { Record_Types };
/**
 *
 * @param record
 * @param recordType ENUM ['stspolicy', 'stsreport']
 */
export declare function parseRecord(record: string, recordType: RecordType): Promise<RecordTagSchema>;
export declare function fetchRecord(domainName: string, recordType?: RecordType): Promise<FetchResponseSchema>;
