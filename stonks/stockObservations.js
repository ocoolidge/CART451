const { arrayBuffer } = require('stream/consumers');
const alpha = require('alphavantage')({ key: 'G310EAU66S32MQEY' });
const fs = require('fs');
var request = require('request');
const { resolve } = require('path');

class stockObservations {

    constructor(){
        console.log("init stockObservations.js");
        
    }

    getObservations(type, ticker){
        return new Promise((resolve, reject) => {
            alpha.data.intraday_extended(`msft`, undefined, undefined, '60min', 'year1month1', true).then((data) => {
                console.log(data.length);
                resolve(data);
            });
        })
    }
    
    getVolatile(ticker){
        return new Promise((resolve, reject) => {
            // alpha.data.daily_adjusted(ticker, 'compact').then((data) => {
            //     //console.log(data)
            //     resolve(data);
            // });
            

            // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
            var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=' + ticker + '&apikey=G310EAU66S32MQEY';

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
                // data is successfully parsed as a JSON object:
                console.log(data);
                    resolve(data)
                }
            });
        })
    }
}

module.exports = stockObservations;