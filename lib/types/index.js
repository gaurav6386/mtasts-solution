"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllKeysValidationSchema = exports.AllowedUriEnum = exports.AllowedStsReportVersion = exports.AllowedStsPolicyVersion = exports.Record_Types = void 0;
var Record_Types;
(function (Record_Types) {
    Record_Types["DMARC"] = "dmarc";
    Record_Types["MTASTS"] = "mtasts";
    Record_Types["STSPOLICY"] = "stspolicy";
    Record_Types["STSREPORT"] = "stsreport";
})(Record_Types = exports.Record_Types || (exports.Record_Types = {}));
// New versions will be added in future
var AllowedStsPolicyVersion;
(function (AllowedStsPolicyVersion) {
    AllowedStsPolicyVersion["STSv1"] = "STSv1";
})(AllowedStsPolicyVersion = exports.AllowedStsPolicyVersion || (exports.AllowedStsPolicyVersion = {}));
// New versions will be added in future
var AllowedStsReportVersion;
(function (AllowedStsReportVersion) {
    AllowedStsReportVersion["TLSRPTv1"] = "TLSRPTv1";
})(AllowedStsReportVersion = exports.AllowedStsReportVersion || (exports.AllowedStsReportVersion = {}));
// export enum AllowedUriEnum {
//     MAILTO = 'mailto',
//     HTTPS = 'https'
// }
var AllowedUriEnum;
(function (AllowedUriEnum) {
    AllowedUriEnum["MAILTO"] = "mailto";
    AllowedUriEnum["HTTPS"] = "https";
})(AllowedUriEnum = exports.AllowedUriEnum || (exports.AllowedUriEnum = {}));
;
/** Includes all keys that exists in the Dmarc & MtaSts Record */
var AllKeysValidationSchema;
(function (AllKeysValidationSchema) {
    AllKeysValidationSchema["v"] = "v";
    AllKeysValidationSchema["id"] = "id";
    AllKeysValidationSchema["rua"] = "rua";
})(AllKeysValidationSchema = exports.AllKeysValidationSchema || (exports.AllKeysValidationSchema = {}));
