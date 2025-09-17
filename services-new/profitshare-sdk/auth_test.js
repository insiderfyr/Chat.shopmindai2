const crypto = require('crypto');
const qs = require('qs');

const api_user = "burca_denis_68c9b156822ca";
const api_key = 'fd6f6fe5b514f390d1f73d20c0fd1f3d15641139';

const date = (new Date()).toUTCString();
const request_type = 'GET';
const route = 'affiliate-products/';
const query_params = {
    'page': 1,
    'filters[advertiser]': '35'
};

// This is the critical part: how the query string is stringified
const query_string = qs.stringify(query_params, { encode: false });

const signature_string = request_type + route + '?' + query_string + '/' + api_user + date;

const hmac = crypto.createHmac("sha1", api_key);
const signed = hmac.update(signature_string).digest('hex');

console.log("--- Javascript Auth Test ---");
console.log("Date:", date);
console.log("Signature String:", signature_string);
console.log("Signature Hash:", signed);
console.log("--------------------------");
