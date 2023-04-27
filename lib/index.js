"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRecord = exports.parseRecord = exports.Record_Types = void 0;
const fetcher_1 = require("./actions/fetcher");
const parser_1 = require("./actions/parser");
const types_1 = require("./types");
Object.defineProperty(exports, "Record_Types", { enumerable: true, get: function () { return types_1.Record_Types; } });
/**
 *
 * @param record
 * @param recordType ENUM ['stspolicy', 'stsreport']
 */
function parseRecord(record, recordType) {
    return new Promise((resolve, reject) => {
        (0, parser_1.parser)(record, recordType).then(parsedData => {
            let defaultTags = {};
            if (parsedData) {
                if (parsedData.messages && parsedData.messages.length)
                    return reject(parsedData.messages);
                resolve(parsedData === null || parsedData === void 0 ? void 0 : parsedData.tags);
            }
            else
                resolve(defaultTags);
        }).catch(err => {
            reject(err);
        });
    });
}
exports.parseRecord = parseRecord;
function fetchRecord(domainName, recordType = types_1.Record_Types.MTASTS) {
    return new Promise((resolve, reject) => {
        (0, fetcher_1.fetcher)(domainName, recordType).then(records => {
            if (typeof records == 'string')
                return parseRecord(records, recordType).then(r => {
                    const parsedData = { record: records, tags: {} };
                    switch (recordType) {
                        case types_1.Record_Types.STSPOLICY:
                            parsedData.tags = { stspolicy: r };
                            break;
                        case types_1.Record_Types.STSREPORT:
                            parsedData.tags = { stsreport: r };
                            break;
                    }
                    resolve(parsedData);
                });
            else if (records.stsPolicyRecord.data)
                return parseRecord(records.stsPolicyRecord.data, types_1.Record_Types.STSPOLICY)
                    .then(stsPolicyTag => {
                    if (records.stsSmtpRecord.data)
                        return parseRecord(records.stsSmtpRecord.data, types_1.Record_Types.STSREPORT).then(stsReportTag => {
                            const parsedData = { record: records, tags: { stspolicy: stsPolicyTag, stsreport: stsReportTag } };
                            resolve(parsedData);
                        }).catch(err => reject(err));
                }).catch(err => reject(err));
        }).catch(err => {
            reject(err);
        });
    });
}
exports.fetchRecord = fetchRecord;
