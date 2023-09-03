export const RecordTypes = {
    STSPOLICY: 'stspolicy',
    STSREPORT: 'stsreport',
    DMARCREPORT: 'dmarcreport'
} as const

export const ErrorTypes = {
    MissingVTag: 'MissingVTag'
} as const

// New versions will be added in future
export const AllowedStsPolicyVersion = {
    STSv1: "STSv1",
    // STSv2: "STSv2"
} as const

export const AllowedSTSPolicyKey = {
    VERSION: 'version',
    MODE: 'mode',
    MX: 'mx',
    MAXAGE: 'max_age'
} as const

export const AllowedSTSPolicyMode = {
    ENFORCE: 'enforce',
    TESTING: 'testing',
    NONE: 'none'
} as const

// New versions will be added in future
export const AllowedStsReportVersion = {
    TLSRPTv1: "TLSRPTv1"
} as const

export const AllowedTLSRPTUriScheme = { MAILTO: "mailto", HTTPS: "https" } as const;

export type AllowedRecordTypes = typeof RecordTypes[keyof typeof RecordTypes]

/** MTA-STS Policy record Types */
export type STSPolicyVersion = typeof AllowedStsPolicyVersion[keyof typeof AllowedStsPolicyVersion]
export type STSPolicyRecord = `v=${STSPolicyVersion}; id=${number}`
export type STSPolicyMode = typeof AllowedSTSPolicyMode[keyof typeof AllowedSTSPolicyMode]
export type STSPolicyKeys = typeof AllowedSTSPolicyKey[keyof typeof AllowedSTSPolicyKey]

/** MTA-STS Report record Types */
type STSReportVersion = typeof AllowedStsReportVersion[keyof typeof AllowedStsReportVersion]
type STSReportUriSchemes = typeof AllowedTLSRPTUriScheme[keyof typeof AllowedTLSRPTUriScheme]
export type ValidSTSRua = `${STSReportUriSchemes}:${string}`
export type STSReportRecord = `v=${STSReportVersion}; rua=${STSReportUriSchemes}:${string}`

/** DMARC Report Record Types */
//--------- ToBeAdded ----------

export interface IGenratorError {
    statusCode: number;
    message: string
}

export interface IGeneratedRecord {
    record: string;
    errors: IGenratorError[]
}

export interface DNSRecordGenerator {
    domainName: string;
    generate(rua?: ValidSTSRua): IGeneratedRecord
}

export interface IRecordFormat {
    [RecordTypes.STSPOLICY]: STSPolicyRecord;
    [RecordTypes.STSREPORT]: STSReportRecord;
    // [RecordTypes.DMARCREPORT]: string
}
export type AllowedRecords = IRecordFormat[keyof IRecordFormat];


export interface IValidationError {
    // statusCode: number;
    found?: string | number | string[] | number[]; 
    expected?: string | number | string[] | number[];
    message: string;
}

export interface TagDetails {
    value: string;
    description?: string;
}

export interface RecordTagSchema {
    v?: TagDetails;
    id?: TagDetails;
    rua?: TagDetails;
}

export interface IValidationRecord {
    valid: boolean;
    tags: RecordTagSchema;
    errors: IValidationError[]
}

export interface DNSRecordValidator {
    type: AllowedRecordTypes;
    record: AllowedRecords;
    validate(): IValidationRecord
}

export interface TagDescriptorSchema { required: boolean; description: string; validate?: (value: string) => boolean }
interface DescriptorBasic { v: TagDescriptorSchema };
export interface StsPolicyDescriptorSchema extends DescriptorBasic { id: TagDescriptorSchema }
export interface StsReportDescriptorSchema extends DescriptorBasic { rua: TagDescriptorSchema }

export type UnionValidationSchema = StsPolicyDescriptorSchema | StsReportDescriptorSchema;

export type PolicyFileFormat = {
    version: STSPolicyVersion | '';
    mode: STSPolicyMode | '';
    mx: string[];
    max_age: number;
}

export interface IPolicyValidationError extends IValidationError {}

export interface IPolicyValidationResponse {
    valid: boolean;
    data?: PolicyFileFormat;
    errors: IPolicyValidationError[];
} 