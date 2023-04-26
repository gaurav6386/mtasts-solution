var dns = require('dns');

function mtaStsFetcher(domainName) {
	return new Promise(async (resolve, reject) => {
		dns.resolveTxt(`_mta-sts.${domainName}`, (err, stsRecord) => {
			var record = {
				stsRecord: { exists: false, data: null },
				tlsReport: { exists: false, data: null }
			};
			// console.log("Policy Validation = ", stsRecord);
			if (err) {
				if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
					return reject(new Error('MTA-STS Policy file is not found'));
				return reject(err.message);
			} else {
				for (var i = 0; i < stsRecord.length; i++) {
					for (var j = 0; j < stsRecord[i].length; j++) {
						// console.log("STS RECORD INSIDE LOOP = ", stsRecord[i][j]);
						if (stsRecord[i][j].startsWith('v=STSv1')) {
							record.stsRecord.data = stsRecord[i][j];
							record.stsRecord.exists = true;
							break;
						}
					}
					if (record.stsRecord.data && stsRecord[i].length > 0) record.stsRecord.data = stsRecord[i].join("")
					if (record.stsRecord.data != null)
						break;
				}
				if (record.stsRecord.data == null) return reject(new Error('MTA-STS Record not available'));
			}

			// (Optional)
			dns.resolveTxt(`_smtp._tls.${domainName}`, (err, tlsReport) => {
				// console.log("TLS Report Validation = ", tlsReport);
				// var record = null;
				if (err) {
					if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
						return resolve(record);
					return reject(err.message);
				}
				for (var i = 0; i < tlsReport.length; i++) {
					for (var j = 0; j < tlsReport[i].length; j++) {
						if (tlsReport[i][j].startsWith('v=TLSRPTv1')) {
							record.tlsReport.data = tlsReport[i][j];
							record.tlsReport.exists = true;
							break;
						}
					}
					if (record.tlsReport && tlsReport[i].length > 0) record.tlsReport.data = tlsReport[i].join("")
					if (record.tlsReport.data != null)
						break;
				}
				// if (record == null) return reject(new Error('MTA-STS Record not available')); 
				return resolve(record);
			})
		});
	})
}
  
function dmarcFetcher(domainName) {
	return new Promise(async (resolve, reject) => {
		dns.resolveTxt(`_dmarc.${domainName}`, (err, resp) => {
			if(err) {
				if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
					return reject(new Error('DMARC Record is not available'));
				return reject(err.message);
			}

			var record = null;
			for (var i = 0; i < resp.length; i++) {
				for (var j = 0; j < resp[i].length; j++) {
					if (resp[i][j].startsWith('v=DMARCv1')) {
						record = resp[i][j];
						break;
					}
				}
				if (record && resp[i].length > 0) record = resp[i].join("")
				if (record != null)
					break;
			}
			if (record == null) return reject(new Error('DMARC Record not available'));
			return resolve(record);
		})
})}

const fetcher = async (domainName, recordType) => {
	switch(recordType){
		case "dmarc": {
			const record = await dmarcFetcher(domainName);
			return record;
			break;
		}
		case "mtasts": {
			const record = await mtaStsFetcher(domainName);
			return record;
			break;
		}
		default: {
			throw new Error("No Record available for given auth type");
		}
	}
};

// var fetch = function (domainName) {
// 	return new Promise((resolve, reject) => {
// 		dns.resolveTxt('_dmarc.' + domainName, (err, records) => {
// 			if (err) {
// 				if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
// 					return reject(new Error('DMARC Record not available'));
// 				return reject(err.message);
// 			}
// 			var record = null;
// 			for (var i = 0; i < records.length; i++) {
// 				for (var j = 0; j < records[i].length; j++) {
// 					if (records[i][j].startsWith('v=DMARC')) {
// 						record = records[i][j];
// 						break;
// 					}
// 				}
// 				if (record && records[i].length > 0) record = records[i].join("")
// 				if (record != null)
// 					break;
// 			}
// 			if (record == null) return reject(new Error('DMARC Record not available'));
// 			return resolve(record);
// 		});
// 	})
// }

module.exports = fetcher;