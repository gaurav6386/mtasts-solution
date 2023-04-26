import { AllKeysValidationSchema, ParserReturnValue, RecordTagSchema, RecordType, Record_Types, StsPolicyValidatorSchema, StsSmtpValidatorSchema, TagDetails, UnionValidationSchema } from "../types";
import { dmarcValidator, stsPolicyValidator, stsReportValidator } from "./validator";

function validateRecord(record: string, validator: UnionValidationSchema): ParserReturnValue {
    let terms: string[] = record.split(/;/)
		.map(t => t.trim()) // Trim surrounding whitespace
		.filter(x => x !== ''); // Ignore empty tags

	let rules: string[][] = terms.map(x => x.split(/[=]/).map(p => p.trim()));
    
    let retVal: ParserReturnValue = {
        tags: {},
        messages: []
    }

    // Make sure `v` is the first tag
	if (!/^v$/i.test(rules[0][0])) {
		retVal.messages?.push(`First tag in a MTASTS policy must be 'v', but found: '${rules[0][0]}'`);
		return retVal;
	}
	
    for(let rule of rules) {
        let term = rule[0];
        let value = rule[1];
        let found = false;

        for(let validatorTerm of Object.keys(validator)) {
			let settings = validator[validatorTerm as keyof UnionValidationSchema];

			// Term matches validaor
			let termRegex = new RegExp(`^${validatorTerm}$`, 'i');
			if(termRegex.test(term)){
				found = true;
				let tag: TagDetails = {
					// tag: term,
					value: '',
					description: settings?.description
				};
	
				if (settings?.validate) {
					try {	
						settings.validate.call(settings, value);
						tag.value = value;
						retVal.tags[term as keyof RecordTagSchema] = tag;
					}catch (err: any) {
						retVal.messages?.push(err.message);
					}
				}
				break;
			}
        }
		if(!found) {
			retVal.messages?.push(`Unknown tag ${term}`)
		}
    }
	if(retVal.messages?.length === 0) delete retVal.messages;
	return retVal;
}

export async function parser(record: string, recordType: RecordType) {
	// Steps
	// 1. Split policy string on semicolons into term pairs
	// 2. Process and validate each term pair
	// console.log("Policy param = ", policy, recordType);
	const checkingDmarc:boolean = recordType.toLowerCase() == Record_Types.DMARC;
	const checkingSTS: boolean = recordType.toLowerCase() == Record_Types.MTASTS;
    const checkingStsPolicy: boolean = recordType.toLowerCase() ==Record_Types.STSPOLICY
    const checkingStsReport: boolean = recordType.toLowerCase() == Record_Types.STSREPORT;

    let retVal = null;
	switch(true) {
		// case checkingDmarc: 
		// 	retVal = validateRecord(record, dmarcValidator);
		// 	return retVal;
		case checkingStsPolicy:
			retVal = validateRecord(record, stsPolicyValidator);
			return retVal;
        case checkingStsReport:
            retVal = validateRecord(record, stsReportValidator);
		default: return retVal;
	}
}