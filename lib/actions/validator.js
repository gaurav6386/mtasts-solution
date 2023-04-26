"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stsPolicyValidator = exports.stsReportValidator = exports.dmarcValidator = void 0;
const email_validator_1 = __importDefault(require("email-validator"));
const types_1 = require("../types");
exports.dmarcValidator = {
    v: {
        required: true,
        description: 'The v tag is required and represents the protocol version. An example is v=DMARC1',
        validate(term, value) {
            if (value !== 'DMARC1') {
                throw new Error(`Invalid DMARC version: '${value}'`);
            }
        }
    },
    fo: {
        description: 'The FO tag pertains to how forensic reports are created and presented to DMARC users.',
        validate(term, originalValue) {
            var value = originalValue.split(':');
            if (value.length <= 4) {
                if (!/^([01ds])$/i.test(value[0])) {
                    throw new Error(`Invalid value for '${term}': '${originalValue}', must be colon seprated with: 0, 1, d, s`);
                }
                if (value.length > 1 && !/^([01ds])$/i.test(value[1])) {
                    throw new Error(`Invalid value for '${term}': '${originalValue}', must be colon seprated with: 0, 1, d, s`);
                }
                if (value.length > 2 && !/^([01ds])$/i.test(value[2])) {
                    throw new Error(`Invalid value for '${term}': '${originalValue}', must be colon seprated with: 0, 1, d, s`);
                }
                if (value.length > 3 && !/^([01ds])$/i.test(value[3])) {
                    throw new Error(`Invalid value for '${term}': '${originalValue}', must be colon seprated with: 0, 1, d, s`);
                }
            }
        },
        generate(value) {
            if (value && value.length)
                return value.join(':');
            throw new Error("Invalid for 'fo' tag");
        }
    },
    p: {
        description: 'The required p tag demonstrates the policy for domain (or requested handling policy). It directs the receiver to report, quarantine, or reject emails that fail authentication checks. Policy options are: 1) None 2) Quarantine or 3) Reject.',
        validate(term, value) {
            if (!/^(none|quarantine|reject)$/i.test(value)) {
                throw new Error(`Invalid value for '${term}': '${value}', must be one of: none, quarantine, reject`);
            }
        }
    },
    pct: {
        description: `This DMARC tag specifies the percentage of email messages subjected to filtering. For example, pct=25 means a quarter of your company’s emails will be filtered by the recipient.`,
        validate(term, value) {
            if (!/^\d+$/.test(value)) {
                throw new Error(`Invalid value for '${term}': ${value}, must be a positive integer`);
            }
            else if (parseInt(value, 10) > 100 || parseInt(value, 10) < 0) {
                throw new Error(`Invalid value for '${term}': ${value}, must be an integer between 0 and 100`);
            }
        }
    },
    rf: {
        description: `Format to be used for message-specific failure reports (colon-separated plain-text list of values)`,
        validate(term, value) {
            // The RFC says the values are colon-separated but a lot of examples/docs around the net show commas... so we'll do both
            let values = value.split(/,|:/).map(x => x.trim());
            for (let val of values) {
                if (!/^(afrf|iodef)$/i.test(val)) {
                    throw new Error(`Invalid value for '${term}': '${value}', must be one or more of these values: afrf, iodef. Multiple values must be separated by a comma or colon`);
                }
            }
        }
    },
    ri: {
        description: 'The ri tag corresponds to the aggregate reporting interval and provides DMARC feedback for the outlined criteria.',
        validate(term, value) {
            if (!/^\d+$/.test(value)) {
                throw new Error(`Invalid value for '${term}': ${value}, must be an unsigned integer`);
            }
        }
    },
    rua: {
        description: 'This optional tag is designed for reporting URI(s) for aggregate data. An rua example is rua=mailto:CUSTOMER@for.example.com.',
        validate(term, value) {
            let values = value.split(/,/).map(x => x.trim());
            for (let val of values) {
                let matches = val.match(/^mailto:(.+)$/i);
                if (!matches) {
                    throw new Error(`Invalid value for '${term}': ${value}, must be a list of DMARC URIs such as 'mailto:some.email@somedomain.com'`);
                }
                let email = matches[1];
                if (!email_validator_1.default.validate(email)) {
                    throw new Error(`Invalid email address in '${term}': '${email}'`);
                }
            }
        },
        generate(value) {
            var mailtoList = [];
            if (value && value.length) {
                for (var i = 0; i < value.length; i++) {
                    if (typeof value[i] === 'string') {
                        if (!value[i].startsWith('mailto:'))
                            value[i] = 'mailto:' + value[i];
                        if (mailtoList.indexOf(value[i]) == -1)
                            mailtoList.push(value[i]);
                    }
                    else
                        throw new Error("Invalid Email: '" + value[i] + "' for 'rua' tag");
                }
                return mailtoList.join(',');
            }
            else
                throw new Error(`Invalid value for 'rua' tag`);
        }
    },
    ruf: {
        description: 'Like the rua tag, the ruf designation is an optional tag. It directs addresses to which message-specific forensic information is to be reported (i.e., comma-separated plain-text list of URIs). An ruf example is ruf=mailto:CUSTOMER@for.example.com.',
        validate(term, value) {
            let values = value.split(/,/).map(x => x.trim());
            for (let val of values) {
                let matches = val.match(/^mailto:(.+)$/i);
                if (!matches) {
                    throw new Error(`Invalid value for '${term}': ${value}, must be a list of DMARC URIs such as 'mailto:some.email@somedomain.com'`);
                }
                let email = matches[1];
                if (!email_validator_1.default.validate(email)) {
                    throw new Error(`Invalid email address in '${term}': '${email}'`);
                }
            }
        },
        generate(value) {
            var mailtoList = [];
            if (value && value.length) {
                for (var i = 0; i < value.length; i++) {
                    if (typeof value[i] === 'string') {
                        if (!value[i].startsWith('mailto:'))
                            value[i] = 'mailto:' + value[i];
                        if (mailtoList.indexOf(value[i]) == -1)
                            mailtoList.push(value[i]);
                    }
                    else
                        throw new Error("Invalid Email: '" + value[i] + "' for 'ruf' tag");
                }
                return mailtoList.join(',');
            }
            else
                throw new Error(`Invalid value for 'ruf' tag`);
        }
    },
    sp: {
        description: 'Requested Mail Receiver policy for all subdomains. Can be "none", "quarantine", or "reject".',
        validate(term, value) {
            if (!/^(none|quarantine|reject)$/i.test(value)) {
                throw new Error(`Invalid value for '${term}': '${value}', must be one of: none, quarantine, reject`);
            }
        }
    },
    aspf: {
        description: 'The aspf tag represents alignment mode for SPF. An optional tag, aspf=r is a common example of its configuration.',
        validate(term, value) {
            if (!/^(s|r)$/i.test(value)) {
                throw new Error(`Invalid value for '${term}': '${value}', must be one of "r" or "s"`);
            }
        }
    },
    adkim: {
        description: 'Similar to aspf, the optional adkim tag is the alignment mode for the DKIM protocol. A sample tag is adkim=r.',
        validate(term, value) {
            if (!/^(s|r)$/i.test(value)) {
                throw new Error(`Invalid value for '${term}': '${value}', must be one of "r" or "s"`);
            }
        }
    }
};
exports.stsReportValidator = {
    'v': {
        required: true,
        description: "Specify version of TLSRPT policy. Currently, only 'TLSRPTv1 is supported. The other version will be added in later document.",
        validate(value) {
            if (!(value in types_1.AllowedStsReportVersion))
                throw new Error("Invalid TLSRPT version specified.");
        }
    },
    'rua': {
        required: true,
        description: "A URI specifying the endpoint to which aggregate information about policy validation results should be sent",
        validate(originalValue) {
            const values = originalValue.split(/;/);
            let isValidRua = false;
            for (let i = 0; i < values.length; i++) {
                const directives = values[i].trim().split(/:/);
                //Constant time: O(1)
                Object.values(types_1.AllowedUriEnum).forEach(uri => {
                    if (uri == directives[0])
                        isValidRua = true;
                });
            }
            if (!isValidRua)
                throw new Error("Invalid URI scheme specified in rua");
        }
    }
};
exports.stsPolicyValidator = {
    'v': {
        required: true,
        description: "Specify sts version. Currently, only 'STSv1' is supported",
        validate(value) {
            if (!(value in types_1.AllowedStsPolicyVersion)) {
                throw new Error('Invalid version in sts policy record');
            }
        }
    },
    'id': {
        required: true,
        description: "A short string of number that is used to track policy updates. This string MUST uniquely identify a given instance of a policy, such that senders can determine when the policy has been updated by comparing to the 'id' of a previously seen policy. There is no implied ordering of 'id' fields between revisions.",
        validate(value) {
            if (!value)
                throw new Error('sts id is required for detecting policy changes.');
        }
    }
};
