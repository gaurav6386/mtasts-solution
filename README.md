# mtasts-solution

> Allows fetching, parsing and generation of MTA-STS records for your domain.


## Installation
```
npm i mtasts-solution
```

## Usage Example

To begin managing policy reports for a domain, you can use the following code as a starting point:

##### Managing MTA-STS TXT records
```js
const { STSPolicy } = require('mtasts-solution');

const stsPolicy = new STSPolicy('<example.com>');

// Policy record validation
stsPolicy.validate(record)
  .then(response => {
    // The validation response includes information about the policy's validity,
    // any recognized tags, and potential errors.
    // Example response: { valid: true, tags: {...}, errors: [...] }
    
    // Further processing based on the response
  })
  .catch(err => {
    // Handle any errors that may occur during the validation process
  });

// Fetching existing record on DNS 
const policy = await stsPolicy.fetch();
//{ record: 'v=STSv1; id=126743859' }
console.log('Fetched MTA-STS policy:', policy.record);

stsPolicy.parse('v=STSv1; id=123456789')
.then(record => {
  // { v: { value: 'STSv1', description: '...' }, id: { value: 123456789, description: '...' }}
}).catch(err => {
  //[{ message: 'reason' }, ...]
  if(err && err.length) err.forEach(e => console.error(e.message))
})

// Generate new Record
const newPolicyRecord = await stsPolicy.generate();
// { record: 'v=STSv1; id=123456789' }

const { valid, data, errors } = await stsPolicy.checkPolicyFile();
// valid: true | false
// data: <Hosted policy file>
// errors: Issues found in hosted file

```

##### Managing TLSRPT policy record
```js
const { STSReport } = require('mtasts-solution');

const stsReport = new STSReport('<example.com>');

// Checks whether the paramter is a valid TLSRPT record or not 
stsReport.validate(record)
  .then(response => {
    // Example response: { valid: true, tags: {...}, errors: [...] }
    // Further processing based on the response
    ...
  })
  .catch(err => {
    // Handle any errors that may occur during the validation process
  });

// Fetching existing record on DNS 
const policy = await stsReport.fetch();
console.log('Fetched TLSRPT record:', policy.record);

stsReport.parse('v=STSv1; id=123456789')
.then(record => {
  // Process parsed record...
}).catch(err => {
  //[{ message: 'reason' }, ...]
  if(err && err.length) err.forEach(e => console.error(e.message))
})

// Generate new Record
const newTlsrptRecord = await stsReport.generate('mailto', 'abc@example.com);
// { record: 'v=TLSRPTv1; rua=mailto:abc@example.com', errors: [] }   
```