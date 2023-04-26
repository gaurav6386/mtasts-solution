import { AllStsRecordSchema } from '../types';
/**
 * Fetch the asked DNS record and check if it is valid or not
 *
 * @param domainName string
 * @param recordType string
 * @returns
 */
export declare function fetcher(domainName: string, recordType: string): Promise<string | AllStsRecordSchema>;
