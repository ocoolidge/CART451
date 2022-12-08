var request = require('request');
const fs = require('fs');

fs.readdir('data/stock_market_data/sp500/json/', (err, files) => {
    getCompanyNames(files);
    async function getCompanyNames(files){
        
        var companyNames = new Array();
        for(i = 0; i < 20; i++){
            var ticker = files[i].split('.')[0]
            console.log(ticker)
            companyNames[i] = await getData(ticker);
        }
        console.log(companyNames)
    }
})

function getData(ticker){
    return new Promise((resolve, reject) => {
        var url = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol='+ticker+'&apikey=G310EAU66S32MQEY';
        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
        }, (err, res, data) => {
            if (err) {
            console.log('Error:', err);
            } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
            } else {
            console.log(data.Name)
            resolve(data.Name)
            }
        });
    })
}

