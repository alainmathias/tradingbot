const fs = require('fs');

function saveLog(data) {

    const line = `
TIME: ${new Date().toISOString()}
PRICE: ${data.price}
SIGNAL: ${data.signal}
SCORE: ${data.score}
---------------------
`;

    fs.appendFileSync('logs/trades.txt', line);
}

module.exports = { saveLog };
