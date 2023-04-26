import { RecordType } from "./types";
/**
 *
 * @param record
 * @param recordType ENUM ['stspolicy', 'stsreport']
 */
export declare function recordParser(record: string, recordType: RecordType): Promise<unknown>;
export declare function recordFetcher(domainName: string, recordType?: RecordType): Promise<unknown>;