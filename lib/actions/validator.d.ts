import { StsPolicyValidatorSchema } from '../types';
export declare const dmarcValidator: {
    v: {
        required: boolean;
        description: string;
        validate(term: string, value: string): void;
    };
    fo: {
        description: string;
        validate(term: string, originalValue: string): void;
        generate(value: string[]): string;
    };
    p: {
        description: string;
        validate(term: string, value: string): void;
    };
    pct: {
        description: string;
        validate(term: string, value: string): void;
    };
    rf: {
        description: string;
        validate(term: string, value: string): void;
    };
    ri: {
        description: string;
        validate(term: string, value: string): void;
    };
    rua: {
        description: string;
        validate(term: string, value: string): void;
        generate(value: string[]): string;
    };
    ruf: {
        description: string;
        validate(term: string, value: string): void;
        generate(value: string[]): string;
    };
    sp: {
        description: string;
        validate(term: string, value: string): void;
    };
    aspf: {
        description: string;
        validate(term: string, value: string): void;
    };
    adkim: {
        description: string;
        validate(term: string, value: string): void;
    };
};
export declare const stsReportValidator: {
    v: {
        required: boolean;
        description: string;
        validate(value: string): void;
    };
    rua: {
        required: boolean;
        description: string;
        validate(originalValue: string): void;
    };
};
export declare const stsPolicyValidator: StsPolicyValidatorSchema;
