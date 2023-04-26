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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = void 0;
const types_1 = require("../types");
const validator_1 = require("./validator");
function validateRecord(record, validator) {
    var _a, _b, _c, _d;
    let terms = record.split(/;/)
        .map(t => t.trim()) // Trim surrounding whitespace
        .filter(x => x !== ''); // Ignore empty tags
    let rules = terms.map(x => x.split(/[=]/).map(p => p.trim()));
    let retVal = {
        tags: {},
        messages: []
    };
    // Make sure `v` is the first tag
    if (!/^v$/i.test(rules[0][0])) {
        (_a = retVal.messages) === null || _a === void 0 ? void 0 : _a.push(`First tag in a MTASTS policy must be 'v', but found: '${rules[0][0]}'`);
        return retVal;
    }
    for (let rule of rules) {
        let term = rule[0];
        let value = rule[1];
        let found = false;
        for (let validatorTerm of Object.keys(validator)) {
            let settings = validator[validatorTerm];
            // Term matches validaor
            let termRegex = new RegExp(`^${validatorTerm}$`, 'i');
            if (termRegex.test(term)) {
                found = true;
                let tag = {
                    // tag: term,
                    value: '',
                    description: settings === null || settings === void 0 ? void 0 : settings.description
                };
                if (settings === null || settings === void 0 ? void 0 : settings.validate) {
                    try {
                        settings.validate.call(settings, value);
                        tag.value = value;
                        retVal.tags[term] = tag;
                    }
                    catch (err) {
                        (_b = retVal.messages) === null || _b === void 0 ? void 0 : _b.push(err.message);
                    }
                }
                break;
            }
        }
        if (!found) {
            (_c = retVal.messages) === null || _c === void 0 ? void 0 : _c.push(`Unknown tag ${term}`);
        }
    }
    if (((_d = retVal.messages) === null || _d === void 0 ? void 0 : _d.length) === 0)
        delete retVal.messages;
    return retVal;
}
function parser(record, recordType) {
    return __awaiter(this, void 0, void 0, function* () {
        // Steps
        // 1. Split policy string on semicolons into term pairs
        // 2. Process and validate each term pair
        // console.log("Policy param = ", policy, recordType);
        const checkingDmarc = recordType.toLowerCase() == types_1.Record_Types.DMARC;
        const checkingSTS = recordType.toLowerCase() == types_1.Record_Types.MTASTS;
        const checkingStsPolicy = recordType.toLowerCase() == types_1.Record_Types.STSPOLICY;
        const checkingStsReport = recordType.toLowerCase() == types_1.Record_Types.STSREPORT;
        let retVal = null;
        switch (true) {
            // case checkingDmarc: 
            // 	retVal = validateRecord(record, dmarcValidator);
            // 	return retVal;
            case checkingStsPolicy:
                retVal = validateRecord(record, validator_1.stsPolicyValidator);
                return retVal;
            case checkingStsReport:
                retVal = validateRecord(record, validator_1.stsReportValidator);
            default: return retVal;
        }
    });
}
exports.parser = parser;
