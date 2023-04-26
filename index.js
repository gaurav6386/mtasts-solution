var parser = require('./bin/parser');
var fetcher = require('./bin/fetcher');
var generator = require('./bin/generator');

var linearParser = function (record, recordType) {
	return new Promise((resolve, reject) => {
		
	})
}

/**
 * Parses Dmarc & MTASTS Record for a give domain
 * @param {*} record 
 * @param {*} recordType  "mtasts" | "dmarc"
 * @returns 
 */
var recordParser = function (record, recordType) {
	return new Promise((resolve, reject) => {
		// console.log("Record in tls solution package", record, recordType);
		return parser(record, recordType).then(result => {
			// console.log({ resultFromParser: result });
			if (result.messages && result.messages.length) return reject(result.messages);
			resolve(result.tags);
		});
	});
}

/**
 * 
 * @param {*} domainName 
 * @param {*} recordType "mtasts" | "dmarc"
 * @returns 
 */
var recordFetcher = function (domainName, recordType) {
	return new Promise((resolve, reject) => {
		return fetcher(domainName, recordType)
			.then(record => {
				return recordParser(record, recordType).then(r => [r, record]);
			})
			.then(([data, record]) => {
				// console.log({data, record})
				resolve({ record: record, tags: data });
			})
			.catch(err => {
				console.log(err);
				reject(err);
			})
	})
}

var recordGenerator = function (values) {
	return new Promise((resolve, reject) => {
		try {
			resolve(generator(values))
		} catch (err) {
			reject(err.message)
		}
	})
}


exports.parse = recordParser;
exports.fetch = recordFetcher;
exports.generate = recordGenerator;