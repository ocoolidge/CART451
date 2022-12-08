const fs = require('fs')

sp500Data = getDatasp500('data/stock_market_data/sp500/json/')
nyseData = getDatasp500('data/stock_market_data/nyse/json/')
forbes2000Data = getDatasp500('data/stock_market_data/forbes2000/json/')
nasdaqData = getDatasp500('data/stock_market_data/nasdaq/json/')

allStockData = function(){
    var data = new Array()
    for(i = 0; i < Math.max(sp500Data.length, nyseData.length, forbes2000Data.length, nasdaqData.length); i++){
        if(i < sp500Data.length){
            data.push(sp500Data[i])
        }if(i < nyseData.length){
            data.push(nyseData[i])
        }if(i < forbes2000Data.length){
            data.push(forbes2000Data[i])
        }if(i < nasdaqData.length){
            data.push(nasdaqData[i])
        }
    }for(j = 0; j < data.length; j ++){
        for(k = 0; k < data.length; k ++){
            if(data[j] == data[k]){
                data.splice(j, 1)
            }
        }
    }
}

function getData(directory, file){
    return new Promise((resolve, reject) => {
        fs.readFile('data/stock_market_data/sp500/json/'+ticker, "utf8", (err, jsonString) => {
            if (err) {
                console.log("File read failed:", err);
                return;
            }
            let json = JSON.parse(jsonString)
            if(json.chart.result[0].meta.firstTradeDate != null && json.chart.result[0].meta.currency != null){
                for(j = 0; j < json.chart.result[0].timestamp.length; j++){
                    json.chart.result[0].timestamp[j] *= 1000
                }resolve(json)
            }else{
                resolve(undefined)
            }
        })
    })
}