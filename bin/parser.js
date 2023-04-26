'use strict';
var { dmarcValidators, tlsReportValidators, tlsPolicyValidators } = require('./validator');
const RECORD_TYPES = {
	MTASTS: 'mtasts',
	DMARC: 'dmarc'
}

function  customValidate(validators, rules, recordType) {
	console.log("Inside custom validate", { validators, rules, recordType});
	return new Promise((resolve, reject) => {
		let retval = {
			tags: {},
			messages: []
		};
	
		// Make sure v is the first tag
		if (!/^v$/i.test(rules[0][0])) {
			retval.messages.push(`First tag in a ${recordType.toUpperCase()} policy must be 'v', but found: '${rules[0][0]}'`);
			resolve(retval);
		}
	
		for (let rule of rules) {
			let term = rule[0];
			let value = rule[1];
	
			let found = false;
	
			for (let validatorTerm of Object.keys(validators)) {
				let settings = validators[validatorTerm];
	
				// Term matches validator
				let termRegex = new RegExp(`^${validatorTerm}$`, 'i');
				if (termRegex.test(term)) {
					found = true;
	
					let tag = {
						// tag: term,
						description: settings.description
					};
	
					if (settings.validate) {
						try {
							settings.validate.call(settings, term, value);
							tag.value = value;
							retval.tags[term] = tag;
						}
						catch (err) {
							retval.messages.push(err.message);
						}
					}
					break;
				}
			}
			
			if (!found) {
				retval.messages.push(`Unknown tag '${term}'`);
			}
		}
	
		// Remove "messages"
		if (retval.messages.length === 0) {
			delete retval.messages;
		}
		// console.log({beforeResolvingCustomValidate: retval})
		resolve(retval);
	})
}

/**
 * This function validates specific sts record with paramters having the following format
 * policy = {
 * 	stsRecord: { exists: true, data: <dummy-data>},
 * 	tlsRecord: { exists: true, data: <dummy-data>} 
 * }
 * @param {*} policy 
 * @returns 
 */
function validateSTS(policy) {
	// console.log("Inside validateSts", policy);
	return new Promise(async (resolve, reject) => {
		let terms1 = null, terms2 = null;
		terms1 = policy.tlsReport.data ? policy.tlsReport.data.split(/;/)
			.map(t => t.trim())
			.filter(x => x!== ''): [];
	
		terms2 = policy.stsRecord.data ? policy.stsRecord.data.split(/;/)
			.map(t => t.trim())
			.filter(x => x!== ''): [];
		
		let rules1 = terms1 ? terms1.map(
			x => x.split(/[=]/)
			.map(p => p.trim())
		): [];
		let rules2 = terms2 ? terms2.map(
			x => x.split(/[=]/)
			.map(p => p.trim())
		): [];
		// console.log("Policy file", {policy, typeofStsRecord: typeof policy.stsRecord.exists, typeofTlsReport: typeof policy.tlsReport.exists});
		let retVal = null;
		if(policy.stsRecord.exists){
			retVal = await customValidate(tlsPolicyValidators, rules2, RECORD_TYPES.MTASTS);
			// console.log("Return value for existing sts record", retVal);
			// return resolve(retVal);
		}

		if(policy.tlsReport.exists) {
			const retVal = await customValidate(tlsReportValidators, rules1, RECORD_TYPES.MTASTS);
			// console.log("Return value for exsiting tls report", retVal)
			return resolve(retVal);
		}

		return resolve(retVal);
	})
}


/**
 * This policy parameter is a single STS DNS TXT Record.
 * @param {*} policy 
 * @returns 
 */
function validateTlsReport(policy) {
	return new Promise(async (resolve, reject) => {
		let terms = null;
		terms = policy.split(/;/)
			.map(t => t.trim())
			.filter(x => x !== '');
		let rules = terms ? terms.map(
			r => r.split(/[=]/)
			.map(p => p.trim())
		): [];
		
		const retVal = await customValidate(tlsReportValidators, rules, RECORD_TYPES.MTASTS);
		resolve(retVal);
	})
}

async function validateDmarc(policy) {
	let terms = null;
	terms = policy.split(/;/)
		.map(t => t.trim()) // Trim surrounding whitespace
		.filter(x => x !== ''); // Ignore empty tags

	let rules = terms.map(
		x => x.split(/[=]/)
			.map(p => p.trim())
	);

	const retVal = await customValidate(dmarcValidators, rules, RECORD_TYPES.DMARC);
	resolve(retVal);
}

async function parser(policy, recordType) {
	// Steps
	// 1. Split policy string on semicolons into term pairs
	// 2. Process and validate each term pair
	// console.log("Policy param = ", policy, recordType);
	const isDmarc = recordType.toLowerCase() == RECORD_TYPES.DMARC;
	const isSTS = recordType.toLowerCase() == RECORD_TYPES.MTASTS;
	// console.log("Is dmarc & is sts", isDmarc, isSTS);
	let retVal = null;
	switch(true) {
		case isDmarc: 
			retVal = await validateDmarc(policy);
			// console.log("Return value for dmarc", retVal);
			return retVal;
		case isSTS:
			retVal = await validateSTS(policy);
			// console.log("Return value for TLS", retVal);		
			return retVal;
		case isSTSRecord:
			retVal = await validateTlsReport(policy);
			return retVal;
		default: return retVal;
	}
}

module.exports = parser;