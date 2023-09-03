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
        errors.push({ found: rules[0][0], expected: 'v', message: `First tag in this record must be 'v', but found: '${rules[0][0]}'` });
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
                    errors.push({ message: err.message });
                }
            }
        } else errors.push({ found: `${term}`, expected: Object.keys(validator),  message: `Unknown tag ${term}` })
    }
    if(errors.length) validationStatus.valid = false;
    return validationStatus;
}

export async function validateEmail(email: string){
    return new RegExp(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/).test(email);
}

const RestrictedCharacterInURL = ['@'];
export async function validateURL(url: string) {
    const restrictedChars = RestrictedCharacterInURL.join('');
    const regExString = `^[^${restrictedChars}]*$`; 
    if(!(new RegExp(regExString).test(url))) return false;
    return new RegExp(/[A-Za-z0-9.-]+\.[A-Za-z]{2,}([A-Za-z0-9\/?=&%-_#]+)?$/).test(url)
}