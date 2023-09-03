import { AllowedSTSPolicyKey, AllowedSTSPolicyMode, STSPolicyKeys, STSPolicyMode } from ".";

export const hasValidPolicyMode = (key: any): key is STSPolicyMode => Object.values(AllowedSTSPolicyMode).indexOf(key) >= 0;
export const hasValidPolicyKeys = (key: any): key is STSPolicyKeys => Object.values(AllowedSTSPolicyKey).indexOf(key) >= 0;
