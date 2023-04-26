import dns from 'dns';
import { AllStsRecordSchema, Record_Types } from '../types';

function fetchAllStsRecord(domainName: string): Promise<AllStsRecordSchema> {
	return new Promise((resolve, reject) => {
		dns.resolveTxt(`_mta-sts.${domainName}`, (err, stsPolicyRecord) => {
			const record: AllStsRecordSchema = {
				stsPolicyRecord: { exists: false, data: null },
				stsSmtpRecord: { exists: false, data: null }
			};
            if (err) {
				if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
					return reject(new Error('MTASTS Policy Record is not found'));
				return reject(err.message);
			}
            else {
				for (var i = 0; i < stsPolicyRecord.length; i++) {
					for (var j = 0; j < stsPolicyRecord[i].length; j++) {
						// console.log("STS RECORD INSIDE LOOP = ", stsPolicyRecord[i][j]);
						if (stsPolicyRecord[i][j].startsWith('v=STSv1')) {
							record.stsPolicyRecord.data = stsPolicyRecord[i][j];
							record.stsPolicyRecord.exists = true;
							break;
						}
					}
					if (record.stsPolicyRecord.data && stsPolicyRecord[i].length > 0) record.stsPolicyRecord.data = stsPolicyRecord[i].join("")
					if (record.stsPolicyRecord.data != null)
						break;
				}
				if (record.stsPolicyRecord.data == null) return reject(new Error('MTA-STS Record not available'));
			}
            // (Optional)
			dns.resolveTxt(`_smtp._tls.${domainName}`, (err, tlsReport) => {
				// console.log("TLS Report Validation = ", tlsReport);
				
				if (err) {
					if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
						return resolve(record);
					return reject(err.message);
				}
				for (var i = 0; i < tlsReport.length; i++) {
					for (var j = 0; j < tlsReport[i].length; j++) {
						if (tlsReport[i][j].startsWith('v=TLSRPT')) {
							record.stsSmtpRecord.data = tlsReport[i][j];
							record.stsSmtpRecord.exists = true;
							break;
						}
					}
					if (record.stsSmtpRecord && tlsReport[i].length > 0) record.stsSmtpRecord.data = tlsReport[i].join("")
					if (record.stsSmtpRecord.data != null) break;
				}
				// if (record.tlsReport.data == null) return reject(new Error('MTA-STS Record not available')); 
				return resolve(record);
			})
		});
	})
}

function fetchStsPolicyRecord(domainName: string): Promise<string> {
    return new Promise((resolve, reject) => {
		dns.resolveTxt(`_mta-sts.${domainName}`, (err, stsPolicyRecord) => {
            if (err) {
				if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
					return reject(new Error('MTASTS Policy Record is not found'));
				return reject(err.message);
			}
            var record = null;
			for (var i = 0; i < stsPolicyRecord.length; i++) {
				for (var j = 0; j < stsPolicyRecord[i].length; j++) {
					if (stsPolicyRecord[i][j].startsWith('v=STS')) {
						record = stsPolicyRecord[i][j];
						break;
					}
				}
				if (record && stsPolicyRecord[i].length > 0) record = stsPolicyRecord[i].join("")
				if (record != null) break;
			}
			if (record == null) return reject(new Error('STS Policy Record not available'));
			return resolve(record);
        })
    })
}

function fetchStsReportRecord(domainName: string): Promise<string>  {
    return new Promise((resolve, reject) => {
        dns.resolveTxt(`_smtp._tls.${domainName}`, (err, tlsReport) => {
            if (err) {
                if (err.message && typeof err.message == 'string' && err.message.startsWith('queryTxt ENOTFOUND'))
                    return reject(new Error('MTASTS SMTP Record is not found'));
                return reject(err.message);
            }
            var record:string = '';
			for (var i = 0; i < tlsReport.length; i++) {
				for (var j = 0; j < tlsReport[i].length; j++) {
					if (tlsReport[i][j].startsWith('v=TLSRPT')) {
						record = tlsReport[i][j];
						break;
					}
				}
				if (record && tlsReport[i].length > 0) record = tlsReport[i].join("")
				if (record != null) break;
			}
			if (record == null) return reject(new Error('MTASTS SMTP Record is not set.'));
			return resolve(record);
        })
    })
}

/**
 * Fetch the asked DNS record and check if it is valid or not 
 * 
 * @param domainName string
 * @param recordType string
 * @returns 
 */
export async function fetcher (domainName: string, recordType: string): Promise<string | AllStsRecordSchema> {
	switch(recordType){
		// case "dmarc": {
		// 	const record = await dmarcFetcher(domainName);
		// 	return record;
		// 	break;
		// }
		case Record_Types.MTASTS: {
			const record = await fetchAllStsRecord(domainName);
			return record;
			break;
		}
        case Record_Types.STSPOLICY: {
            const record = await fetchStsPolicyRecord(domainName);
			return record;
        }
        case Record_Types.STSREPORT: {
            const record = await fetchStsReportRecord(domainName);
            return record;
        }
		default: {
			throw new Error("No Record available for given auth type");
		}
	}
};
