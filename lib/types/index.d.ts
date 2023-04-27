export declare enum Record_Types {
    DMARC = "dmarc",
    MTASTS = "mtasts",
    STSPOLICY = "stspolicy",
    STSREPORT = "stsreport"
}
export declare enum AllowedStsPolicyVersion {
    STSv1 = "STSv1"
}
export declare enum AllowedStsReportVersion {
    TLSRPTv1 = "TLSRPTv1"
}
export declare enum AllowedUriEnum {
    MAILTO = "mailto",
    HTTPS = "https"
}
/** Includes all keys that exists in the Dmarc & MtaSts Record */
export declare enum AllKeysValidationSchema {
    v = "v",
    id = "id",
    rua = "rua"
}
export type AllowedUriSchema = AllowedUriEnum.HTTPS | AllowedUriEnum.MAILTO;
export type RecordType = Record_Types.DMARC | Record_Types.MTASTS | Record_Types.STSPOLICY | Record_Types.STSREPORT;
export interface RecordValidatorSchema {
    required: boolean;
    description: string;
    validate?: (value: string) => void;
}
export interface StsPolicyValidatorSchema {
    v: RecordValidatorSchema;
    id: RecordValidatorSchema;
}
export interface StsSmtpValidatorSchema {
    v: RecordValidatorSchema;
    rua: RecordValidatorSchema;
}
export interface UnionValidationSchema extends Partial<StsPolicyValidatorSchema>, Partial<StsSmtpValidatorSchema> {
}
export interface TagDetails {
    value?: string;
    description?: string;
}
export interface RecordTagSchema {
    v?: TagDetails;
    id?: TagDetails;
    rua?: TagDetails;
}
export interface ParserReturnValue {
    tags: RecordTagSchema;
    messages?: string[];
}
export interface AllStsRecordSchema {
    stsPolicyRecord: {
        exists: boolean;
        data: string | null;
    };
    stsSmtpRecord: {
        exists: boolean;
        data: string | null;
    };
}
export interface FetchResponseSchema {
    record: AllStsRecordSchema | string;
    tags: {
        stspolicy?: RecordTagSchema;
        stsreport?: RecordTagSchema;
    };
}
