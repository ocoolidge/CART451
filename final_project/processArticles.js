const fs = require('fs')
const Sentiment = require('sentiment')
//+stock,S&P500

//getStoredArticles()
analyzeStoredArticles()

function analyzeStoredArticles(){
	let articleData = new Array()
	var sentiment = new Sentiment()
	let consolidatedArticles = new Array()
	fs.readdir('data/articles/all/', (err, files) => {
		let count = 0
		for(let i = 1; i < files.length; i ++){
			fs.readFile('data/articles/all/' + files[i], "utf8", (err, jsonString) => {
				if (err){
					console.log("File read failed:", err)
					return
				}else{
					let result = JSON.parse(jsonString)
					for(let j = 0; j < result.length; j++){
						result[j].titleScore = sentiment.analyze(result[j].title).score
						articleData.push(result[j])
						count++
					}
				}if(i == files.length-1){
					console.log(articleData.length)
					const addresses = [...articleData]; // Some array I got from async call
					const uniqueAddresses = Array.from(new Set(addresses.map(a => a.title))).map(title => {
						return addresses.find(a => a.title === title)
					})
					console.log(uniqueAddresses.length)
					var string = JSON.stringify(uniqueAddresses, null, "\t")
					fs.writeFile('data/articles/consolidatedAnalyzed/all.json', string, 'utf8', (err) => { 
						if (err){
							throw err
						}else{
							console.log("file written")
							fs.readFile('data/articles/consolidatedAnalyzed/all.json', "utf8", (err, jsonString) => {
								if (err){
									console.log("File read failed:", err)
									return
								}else{
									let allJSON = JSON.parse(jsonString)
									console.log(allJSON[0])
								}
							})	
						}
					})
				}
			})
		}
	})
}

function getStoredArticles(){
  for(i = 20; i < 20+12; i++){
  fs.readFile("data/articles/NOV10Rally08am/"+i+".json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return;
    }
    let articles = JSON.parse(jsonString)
    var sentiment = new Sentiment()
    let articlesContent = {}
    
    for(j = 0; j < articles.length; j++){
      articles[j].titleScore = sentiment.analyze(articles[j].title)
      //articles[i].descriptionScore = sentiment.analyze(articles[i].title)
      //articles[i].contentScore = sentiment.analyze(articles[i].content.split('\r'))
      //articles[i].totalScore = parseInt(articles[i].descriptionScore) + parseInt(articles[i].titleScore)// + articles[i].contentScore
      //console.log(articles[i].titleScore.score + "  " + articles[i].title)
      //console.log(articles[i].descriptionScore.score + "  " + articles[i].description) 
      console.log(articles[j].publishedAt + " " + articles[j].titleScore.score + " " + articles[j].title)
    }
    //console.log(articles[1].publishedAt)
    //console.log(articles);
  })
}
}