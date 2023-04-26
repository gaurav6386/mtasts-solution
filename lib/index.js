"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordFetcher = exports.recordParser = void 0;
const fetcher_1 = require("./actions/fetcher");
const parser_1 = require("./actions/parser");
const types_1 = require("./types");
/**
 *
 * @param record
 * @param recordType ENUM ['stspolicy', 'stsreport']
 */
function recordParser(record, recordType) {
    return new Promise((resolve, reject) => {
        (0, parser_1.parser)(record, recordType).then(parsedData => {
            if ((parsedData === null || parsedData === void 0 ? void 0 : parsedData.messages) && parsedData.messages.length)
                return reject(parsedData.messages);
            resolve(parsedData === null || parsedData === void 0 ? void 0 : parsedData.tags);
        }).catch(err => {
            reject(err);
        });
    });
}
exports.recordParser = recordParser;
function recordFetcher(domainName, recordType = types_1.Record_Types.MTASTS) {
    return new Promise((resolve, reject) => {
        (0, fetcher_1.fetcher)(domainName, recordType).then(records => {
            console.log({ records, recordType, typeOfRecords: typeof records });
            if (typeof records == 'string')
                return recordParser(records, recordType).then(r => resolve({ record: records, tags: r }));
            if (records.stsPolicyRecord.data)
                return recordParser(records.stsPolicyRecord.data, types_1.Record_Types.STSPOLICY)
                    .then(stsPolicyTag => {
                    console.log({ stsPolicyTag });
                    if (records.stsSmtpRecord.data)
                        return recordParser(records.stsSmtpRecord.data, types_1.Record_Types.STSREPORT).then(stsReportTag => resolve({ record: records, tags: { stsReportTag, stsPolicyTag } })).catch(err => reject(err));
                }).catch(err => reject(err));
        }).catch(err => {
            reject(err);
        });
    });
}
exports.recordFetcher = recordFetcher;
