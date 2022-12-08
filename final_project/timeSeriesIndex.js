const stats = require('simple-statistics')
const fs = require('fs')

fs.readdir('data/stock_market_data/combined/', (err, files) => {
    getAllCombinations(files)	//array of every fileName which corrosponds to the company names as well
})

async function getAllCombinations(tickers){
	console.log(tickers.length)
    
    for(let i = 0; i < tickers.length-1; i++){		//loop1	(around 4100 cycles)
		
        var data1 = await getData(tickers[i+1])		//retrieve adjclose daily price data for first stock
        var company = {}

        console.log(tickers[i+1])
        
        company.currency=data1.chart.result[0].meta.currency
        company.symbol=data1.chart.result[0].meta.symbol
        company.exchangeName=data1.chart.result[0].meta.exchangeName
        company.instrumentType=data1.chart.result[0].meta.instrumentType
        company.firstTradeDate=data1.chart.result[0].meta.firstTradeDate
		company.correlation = new Array()
        
        if(!data1.chart.result[0].indicators.adjclose[0].adjclose){		//makes sure the data exists before looping
            company.correlation[0] = ["no data"]
			console.log(company)
			var waiter = await write(company)
			console.log(waiter)
        }else{
            for(let j = 0; j < tickers.length-1; j++){			//loop2 (around 4100^2 cycles)
                console.log(j)
                var data2 = await getData(tickers[j+1])			//retrieve adjclose daily price data for second stock
				company.correlation[j] = await getCorr(data1, data2)
                //console.log(data2.chart.result[0].indicators.quote[0])
				if(j==tickers.length-2){						//dont know if i need this i just wasnt sure if maybe the file was getting written before the calculations were made
					console.log(company)
					var waiter = await write(company)			//writes the file
					console.log(waiter)
				}
            }
        }
    }
}

function getCorr(data1, data2){
	return new Promise((resolve, reject) => {
		if(data1 != undefined && data2 != undefined){
			if(!data2.chart.result[0].indicators.adjclose[0].adjclose){
				var corr = [data2.chart.result[0].meta.symbol, "no data"]
			}else if(data2.chart.result[0].indicators.adjclose[0].adjclose.length < 1){
				var corr = [data2.chart.result[0].meta.symbol, "no data"]
			}else{
				//console.log(data2.chart.result[0].indicators.adjclose[0].adjclose[0])
				var X = data1.chart.result[0].indicators.adjclose[0].adjclose		//getting first timeSeries dataset
				var Y = data2.chart.result[0].indicators.adjclose[0].adjclose		//getting second timeSeries dataset
				var length = Math.min(X.length, Y.length)

				if(X.length > length){
					X = X.splice(X.length-length, X.length)				
				}if(Y.length > length){
					Y = Y.splice(Y.length-length, Y.length)				//splicing the longer timeseries so that it is the same length as the shorter one
				}for(let k = 0; k < X.length; k++){
					X[k] = Math.round(100*X[k])/100						//rounding each dumber to two decimal places to reduce calculaiton time
				}for(let k2 = 0; k2 < Y.length; k2++){
					Y[k2] = Math.round(100*Y[k2])/100
				}if(X.length > 1 && Y.length > 1){
					var corr = stats.sampleCorrelation(X, Y)			//calculating correlation
				}if(false){
					console.log(data1.chart.result[0].meta.exchangeName + ":" + data1.chart.result[0].meta.symbol + 
					" CORR " + data2.chart.result[0].meta.exchangeName + ":" + data2.chart.result[0].meta.symbol + 
					" = " + corr)
				}
				var corr = [data2.chart.result[0].meta.symbol, corr]	//making object with the correlation and its object
			}
			console.log(corr)
			resolve(corr)
		}
	})
}

function write(company){
    return new Promise((resolve, reject) => {
        console.log(company.symbol)
		var toWrite = JSON.stringify(company, null, "\t")	//formatting
        fs.writeFile('data/stock_market_data/companyProfiles/'+company.symbol+'.json', toWrite, 'utf8', (err) => { 
            if (err) { 
                throw err; 
            }else{
                resolve("file " + company.symbol + ".json written")
            }
        })
    })
}

function getData(ticker){
    return new Promise((resolve, reject) => {
        fs.readFile('data/stock_market_data/combined/'+ticker, "utf8", (err, jsonString) => {
            if (err) {
                console.log("File read failed:", err);
                return;
            }
            let json = JSON.parse(jsonString)
            if(json.chart.result[0].indicators.quote.length > 1){
                for(j = 0; j < json.chart.result[0].timestamp.length; j++){
                    json.chart.result[0].timestamp[j] *= 1000					//formatting the time
                }resolve(json)
            }else{
                resolve(json)
            }
        })
    })
}