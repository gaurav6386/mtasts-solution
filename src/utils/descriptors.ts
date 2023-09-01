import { AllowedStsPolicyVersion, AllowedStsReportVersion, AllowedTLSRPTUriScheme, StsPolicyDescriptorSchema, StsReportDescriptorSchema } from "../types";

//Add warning for potential issue in the provided DNS record in upcoming version
export const stsPolicyDescriptor: StsPolicyDescriptorSchema = {
    'v': {
        required: true,
        description: "Specify sts version. Currently, only 'STSv1' is supported",
        validate(value: string): boolean {
            if(!value) throw new Error("v tag is required");
            else if(!(value in AllowedStsPolicyVersion)) throw new Error(`${value}: Invalid policy version specified`);
            return true;
        }
    },
    'id': {
        required: true,
        description: "A short string of number that is used to track policy updates. This string MUST uniquely identify a given instance of a policy, such that senders can determine when the policy has been updated by comparing to the 'id' of a previously seen policy. There is no implied ordering of 'id' fields between revisions.",
        validate(value: string): boolean {
            if(!value) throw new Error('id tag is required for detecting policy changes.')
            return true
        }
    }
}

export const stsReportDescriptor: StsReportDescriptorSchema = {
    'v': {
        required: true,
        description: "Specify version of TLSRPT policy. Currently, only 'TLSRPTv1 is supported. The other version will be added in later document.",
        validate(value: string) {
            if(!(value in AllowedStsReportVersion)) throw new Error(`${value}: Invalid TLSRPT version specified.`);
            return true;
        }
    },
    'rua': {
        required: true,
        description: "A URI specifying the endpoint to which aggregate information about policy validation results should be sent",
        validate(originalValue: string) {
            const values = originalValue.split(/;/);
			let isValidRua = false;
            for(let i=0; i<values.length; i++) {
                const directives = values[i].trim().split(/:/);
				//Constant time: O(1)
				Object.values(AllowedTLSRPTUriScheme).forEach(uri => {
					if(uri == directives[0]) isValidRua = true;
				})
			}
			if(!isValidRua) throw new Error(`Invalid URI scheme specified in rua`);
            return true;
        }
    }
}
