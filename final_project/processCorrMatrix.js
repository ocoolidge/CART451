const fs = require('fs')
const stats = require('simple-statistics')

fs.readdir('data/stock_market_data/companyProfiles/', (err, files) => {
	addCompanyNames(files)
})

async function addCompanyNames(files){
	let corrData = new Array()
	for(let i = 0; i < files.length; i++){
		corrData[i] = await readFile(files[i+1])
		await addCompanyName(corrData[i])
		
		// for(let j = 0; j < corrData.correlation.length; j++){
		// 	if(Math.abs(corrData.correlation[j][1]) > 0.99){
		// 		console.log(corrData.correlation[j])
		// 	}
		// }
		//console.log(corrData)
		//console.log(corrData[i].symbol)
	}
	//console.log(corrData)
}

function addCompanyName(company){
	return new Promise((resolve, reject)  => {
		fs.readFile('data/tickers.json',  "utf8", (err, jsonString) => {
			if (err){
				console.log("File read failed:", err)
				return
			}else{
				var allCompanyData = JSON.parse(jsonString)
				for(let i = 0; i < allCompanyData.length; i++){
					if(allCompanyData[i][0] == company.symbol){
						company.name = allCompanyData[i][1]
						let toWrite = JSON.stringify(company, null, "\t")
						fs.writeFile('data/stock_market_data/companyProfiles2/'+company.symbol+'.json', toWrite, 'utf8', (err) => { 
							if (err) { 
								throw err; 
							}else{
								resolve("changed file " + company.symbol + ".json written")
							}
						})
						
					}
				}
				resolve("not found")
			}
		})
	})
}


function readFile(file){
	return new Promise((resolve, reject)  => {
		console.log(file)
		fs.readFile('data/stock_market_data/companyProfiles/'+file,  "utf8", (err, jsonString) => {
			if (err){
				console.log("File read failed:", err)
				return
			}else{
				resolve(JSON.parse(jsonString))
			}
		})
	})
}

fs.readFile('./data/stock_market_data/companyProfiles/', "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    let company = JSON.parse(jsonString)

})