const http = require('http');
const fs = require('fs');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('api_response.txt', `STATUS: ${res.statusCode}\nBODY: ${data}`);
    });
});

req.on('error', (e) => {
    fs.writeFileSync('api_response.txt', `ERROR: ${e.message}`);
});

req.end();
