"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetcher = void 0;
const dns_1 = __importDefault(require("dns"));
const types_1 = require("../types");
function fetchAllStsRecord(domainName) {
    return new Promise((resolve, reject) => {
        dns_1.default.resolveTxt(`_mta-sts.${domainName}`, (err, stsPolicyRecord) => {
            const record = {
                stsPolicyRecord: { exists: false, data: null },
                stsSmtpRecord: { exists: false, data: null }
            };
            if (err) {
                if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
                    return reject(new Error('MTASTS Policy Record is not found'));
                return reject(err.message);
            }
            else {
                for (var i = 0; i < stsPolicyRecord.length; i++) {
                    for (var j = 0; j < stsPolicyRecord[i].length; j++) {
                        // console.log("STS RECORD INSIDE LOOP = ", stsPolicyRecord[i][j]);
                        if (stsPolicyRecord[i][j].startsWith('v=STSv1')) {
                            record.stsPolicyRecord.data = stsPolicyRecord[i][j];
                            record.stsPolicyRecord.exists = true;
                            break;
                        }
                    }
                    if (record.stsPolicyRecord.data && stsPolicyRecord[i].length > 0)
                        record.stsPolicyRecord.data = stsPolicyRecord[i].join("");
                    if (record.stsPolicyRecord.data != null)
                        break;
                }
                if (record.stsPolicyRecord.data == null)
                    return reject(new Error('MTA-STS Record not available'));
            }
            // (Optional)
            dns_1.default.resolveTxt(`_smtp._tls.${domainName}`, (err, tlsReport) => {
                // console.log("TLS Report Validation = ", tlsReport);
                if (err) {
                    if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
                        return resolve(record);
                    return reject(err.message);
                }
                for (var i = 0; i < tlsReport.length; i++) {
                    for (var j = 0; j < tlsReport[i].length; j++) {
                        if (tlsReport[i][j].startsWith('v=TLSRPT')) {
                            record.stsSmtpRecord.data = tlsReport[i][j];
                            record.stsSmtpRecord.exists = true;
                            break;
                        }
                    }
                    if (record.stsSmtpRecord && tlsReport[i].length > 0)
                        record.stsSmtpRecord.data = tlsReport[i].join("");
                    if (record.stsSmtpRecord.data != null)
                        break;
                }
                // if (record.tlsReport.data == null) return reject(new Error('MTA-STS Record not available')); 
                return resolve(record);
            });
        });
    });
}
function fetchStsPolicyRecord(domainName) {
    return new Promise((resolve, reject) => {
        dns_1.default.resolveTxt(`_mta-sts.${domainName}`, (err, stsPolicyRecord) => {
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
                if (record && stsPolicyRecord[i].length > 0)
                    record = stsPolicyRecord[i].join("");
                if (record != null)
                    break;
            }
            if (record == null)
                return reject(new Error('STS Policy Record not available'));
            return resolve(record);
        });
    });
}
function fetchStsReportRecord(domainName) {
    return new Promise((resolve, reject) => {
        dns_1.default.resolveTxt(`_smtp._tls.${domainName}`, (err, tlsReport) => {
            if (err) {
                if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
                    return reject(new Error('MTASTS SMTP Record is not found'));
                return reject(err.message);
            }
            var record = '';
            for (var i = 0; i < tlsReport.length; i++) {
                for (var j = 0; j < tlsReport[i].length; j++) {
                    if (tlsReport[i][j].startsWith('v=TLSRPT')) {
                        record = tlsReport[i][j];
                        break;
                    }
                }
                if (record && tlsReport[i].length > 0)
                    record = tlsReport[i].join("");
                if (record != null)
                    break;
            }
            if (record == null)
                return reject(new Error('MTASTS SMTP Record is not set.'));
            return resolve(record);
        });
    });
}
/**
 * Fetch the asked DNS record and check if it is valid or not
 *
 * @param domainName string
 * @param recordType string
 * @returns
 */
function fetcher(domainName, recordType) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (recordType) {
            // case "dmarc": {
            // 	const record = await dmarcFetcher(domainName);
            // 	return record;
            // 	break;
            // }
            case types_1.Record_Types.MTASTS: {
                const record = yield fetchAllStsRecord(domainName);
                return record;
                break;
            }
            case types_1.Record_Types.STSPOLICY: {
                const record = yield fetchStsPolicyRecord(domainName);
                return record;
            }
            case types_1.Record_Types.STSREPORT: {
                const record = yield fetchStsReportRecord(domainName);
                return record;
            }
            default: {
                throw new Error("No Record available for given auth type");
            }
        }
    });
}
exports.fetcher = fetcher;
;
