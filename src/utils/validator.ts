import { AllowedRecordTypes, AllowedRecords, IValidationError, IValidationRecord, RecordTagSchema, RecordTypes, TagDetails, UnionValidationSchema } from "../types";
import { stsPolicyDescriptor, stsReportDescriptor } from "./descriptors";

function getValidator(type: AllowedRecordTypes){
    switch(type) {
        case RecordTypes.STSPOLICY: return stsPolicyDescriptor;
        case RecordTypes.STSREPORT: return stsReportDescriptor;
        default: throw new Error('Invalid record types supplied!');
    }
}

export function validateRecord(type: AllowedRecordTypes, record: AllowedRecords): IValidationRecord {
    let terms = record.split(/;/)
		.map(t => t.trim()) // Trim surrounding whitespace
		.filter(x => x !== ''); // Ignore empty tags

    let rules: string[][] = terms.map(x => x.split(/[=]/).map(p => p.trim()));
    let errors: IValidationError[] = [];
    let validationStatus: IValidationRecord = { valid: true, tags: {}, errors };

    // Make sure `v` is the first tag
	if (!/^v$/i.test(rules[0][0])) {
		errors.push({ statusCode: 403, message: `First tag in this record must be 'v', but found: '${rules[0][0]}'` });
		validationStatus.valid = false;
        return validationStatus;
	}
	
    const validator = getValidator(type);
    
    for(let rule of rules) {
        let term = rule[0];
        let value = rule[1];
        
        if(validator?.hasOwnProperty(term)){
            const setting = validator[term as keyof UnionValidationSchema]
            let tag: TagDetails = {
                value: '',
                description: setting?.description
            };
            if (setting.validate) {
                try {	
                    setting.validate.call(setting, value);
                    tag.value = value;
                    validationStatus.tags[term as keyof RecordTagSchema] = tag;
                } catch (err: any) {
                    errors.push(err.message);
                }
            }
        } else errors.push({ statusCode: 403, message: `Unknown tag ${term}` })
    }
    if(errors.length) validationStatus.valid = false;
	return validationStatus;
}