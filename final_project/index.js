// import request from "request"
// import fetch from "node-fetch"
// import fs from "fs"
// import Readability from '@mozilla/readability'
// import jsdom from 'jsdom'
const yahooFinance = require('yahoo-finance')
const Readability = require('@mozilla/readability')
const jsdom = require('jsdom')
const axios = require('axios')
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const retrieveArticle = require('./retrieveArticle.js')
const scrambleText = require('./scrambleText.js')
const generateLanguage = require('./generateLanguage.js')
const stockObservations = require('./stockObservations.js')
const WordNet = require('node-wordnet')
const wordnet = new WordNet("./node_modules/wordnet-db/dict")
const SerpApi = require('google-search-results-nodejs')
const nlp = require('node-nlp')
const natural = require('natural')
const Chart = require('chart.js')
const fs = require('fs')
const Sentiment = require('sentiment')
const { dockStart } = require('@nlpjs/basic')
const { getEnvironmentData } = require('worker_threads')
const { resolve } = require('path')
const AppleAppStore = require('google-search-results-nodejs/lib/AppleAppStoreSearch.js')
const search = new SerpApi.GoogleSearch("254e041f84f9ff60250d27f7e19dd08b45dea34f90379b2b9a05f59184c2fad9")
const portNumber = 4203
let app = express()
var tickers = {}

app.use(express.static(__dirname + '/public'))

app.get('/stonks', function(req, res) {
    res.sendFile(__dirname + '/public/stocks.html')
})

app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

let httpServer = http.createServer(app)

httpServer.listen(portNumber, function(){
  	console.log('listening on port:: ' + portNumber)
})

let searchHistory = new Array()
var liveArticles = true

app.post('/getStocksOfInterest', stocksOfInterestPost)
app.post('/getGenerateArticle', generateArticlePost)
app.post('/getAlphaIntel', alphaIntelPost)
app.post('/getStockData', handleTimeSeriesPost)//
app.post('/getArticle', handleArticlePost)
app.post('/getSentimentTimeSeries', handleSentimentPost)//
app.post('/getCorrelationData', handleCorrelationData)
app.post('/getAggregatedStockData', aggregatedStockPost)
app.post('/getTFIDF', TFIDFPost)
//app.post('/getStocks', getStocks)

function getStocks(request, response){
	fs.readdir('data/stock_market_data/combined/', (err, files) => {
		console.log(files)
		readStockHist(files).then(function (result){
			response.send(result)
		})
	})

	function readStockHist(files){
		return new Promise((resolve, reject)  => {
			console.log(files)
			resolve(readLocalStockData(files))
		})
	}
}

async function readLocalStockData(files){
	let stockHists = new Array()
	for(let i = 0; i < 10; i++){
		console.log(Math.floor(Math.random(0, files.length)*4000))
		stockHists[i] = await read(files[Math.floor(Math.random(0, files.length)*4000)])
	}
	return stockHists
}

function read(file){
	console.log(file)
	return new Promise((resolve, reject)  => {
		fs.readFile('data/stock_market_data/combined/'+file,  "utf8", (err, jsonString) => {
			if (err){
				console.log("File read failed:", err)
				return
			}else{
				console.log(jsonString)
				resolve(JSON.parse(jsonString).chart.result)
			}
		})
	})
}

function TFIDFPost(request, response){
	let articles = new retrieveArticle()
	if(liveArticles){
		articles.getArticleTFIDFLive().then(function(result){
			response.send(result)
		})
	}else{
		articles.getArticleTFIDF().then(function(result){
			response.send(result)
		})
	}
}

function aggregatedStockPost(request, response){

	console.log("in handle post: " + request.body.clientPhrase)
	let stocks = new stockObservations()
	stocks.getAggregatedObservations(60).then(function (result){
		response.send(result)
	})

}

function handleCorrelationData(request, response){

	fs.readdir('data/stock_market_data/companyProfiles2/', (err, files) => {
		readCorrFiles(files)
	})

	async function readCorrFiles(files){
		let corrData = new Array()
		for(let i = 1; i < files.length-1; i++){
			corrData[i-1] = await readFile(files[i])
			// for(let j = 0; j < corrData.correlation.length; j++){
			// 	if(Math.abs(corrData.correlation[j][1]) > 0.99){
			// 		console.log(corrData.correlation[j])
			// 	}
			// }
			console.log(corrData[i-1].symbol)
		}
		console.log(corrData)
		response.send(corrData)
	}
}

function readFile(file){
	return new Promise((resolve, reject)  => {
		console.log(file)
		fs.readFile('data/stock_market_data/companyProfiles2/'+file,  "utf8", (err, jsonString) => {
			if (err){
				console.log("File read failed:", err)
				return
			}else{
				resolve(JSON.parse(jsonString))
			}
		})
	})
}

function stocksOfInterestPost(request, response){
	let stocks = new stockObservations()
	fs.readdir('data/stock_market_data/combined/', (err, files) => {
		for(let i = 1; i < 2; i++){
			console.log(files[i].split(".")[0])
			stocks.getInfoYahoo(files[i].split(".")[0]).then(function(result){
				console.log(result.recommendationTrend.trend)
				console.log(result.summaryDetail)
			})
		}
	})
}

function generateArticlePost(request, response){
	let retrieve = new retrieveArticle()
	
	retrieve.getStoredArticle().then(function(result){
		let generate = new generateLanguage()
		let generated = generate.coreNLP(result[0])
		response.send(generated)
	})
}

function alphaIntelPost(request, response){
	let retrieve = new retrieveArticle()
	console.log("request.body.date: " + request.body.date)
	if(liveArticles){
		retrieve.getAlphaIntel(request.body.date, request.body.length).then(function(result){
			console.log(result)
			response.send(result)
		})
	}
}

function handleSentimentPost(request, response){
	let stocks = new stockObservations()
	stocks.getSP500IndexHistorical(60).then(function (result1){
		articleSentimentTimeSeries(request.body.date).then(function (result2){
			let result = [result1, result2]
			console.log(result2.length)
			response.send(result)
		})
	})
}

function handleArticlePost(request,response){
    console.log('articlePost2')
    let count = 0
    searchHistory.forEach(element => {
		if (element == request.body.clientPhrase){
			count++
			console.log(count)
		}
    })

    searchHistory.push(request.body.clientPhrase)
    let retrieveArticleInstance = new retrieveArticle()
    retrieveArticleInstance.getStoredArticle().then(function(result){
    
		let normalResult = result
		let scrambledResult = JSON.parse(JSON.stringify(normalResult))
		iterateWord()
		
		async function iterateWord(){
			let scrambleTextInstance = new scrambleText()
			let titleTokens = new Array()
			let bodyTokens = new Array()

			if(normalResult[0] != undefined && normalResult[0] != null){

			titleTokens[0] = normalResult[2].split(" ")
			bodyTokens[0] = normalResult[0].split(" ")
			titleTokens[1] = normalResult[2].split(" ")
			bodyTokens[1] = normalResult[0].split(" ")

			}else{
				titleTokens[0] = normalResult[2].split(" ")
				titleTokens[1] = normalResult[2].split(" ")
				bodyTokens[0] = normalResult[2].split(" ")
				bodyTokens[1] = normalResult[2].split(" ")
			}

			for(let i = 0; i < titleTokens[0].length; i++){
				titleTokens[1][i] = await scrambleTextInstance.wordSwitch(titleTokens[0][i])
				bodyTokens[1][i] = await scrambleTextInstance.wordSwitch(bodyTokens[0][i])
				titleTokens[1][i] = titleTokens[1][i].charAt(0).toUpperCase() + titleTokens[1][i].slice(1)
				bodyTokens[1][i] = bodyTokens[1][i].charAt(0).toUpperCase() + bodyTokens[1][i].slice(1)
				titleTokens[1][i] = titleTokens[1][i].charAt(0).toUpperCase() + titleTokens[1][i].slice(1)
			}

			scrambledResult[2] = titleTokens[1].join(" ").replace(/_/g, ' ')
			scrambledResult[0] = bodyTokens[1].join(" ").replace(/_/g, ' ')

			final = {result1: normalResult, result2: scrambledResult}
			response.send(final)
		} 
  	})
}

async function articleSentimentTimeSeries(date){
	return new Promise((resolve, reject)  => {
		funk()
		async function funk(){
			var allArticles = new Array()
			var consolidatedArticles = new Array()
			if(liveArticles){
				var keyWords = '+stock,S&P500'
				allArticles = await requestArticles(new Date(date), keyWords)
				//let newArticleCount = allArticles.length
				//allArticles.push(await getAllStoredArticles())
				for(let i = 0; i < allArticles.length; i++){
					consolidatedArticles.push(await analyzeArticle(allArticles[i]))
					if(i == allArticles.length - 1){
						var string = JSON.stringify(consolidatedArticles, null, "\t")
						fs.writeFile('data/articles/all/' + consolidatedArticles[0].publishedAt + '.json', string, 'utf8', (err) => { 
							if (err) { 
								throw err
							}else{
								console.log("file written")
							}
						})
						console.log(consolidatedArticles.length)
						let allStored = await getAllStoredArticles()
						consolidatedArticles.push(allStored)
						console.log(allStored.length)
						resolve(allStored)
					}
				}
			}else{
				for(let i = 0; i < 12; i++){
					allArticles[i] = await readArticles(i+20)
					for(let j = 0; j < allArticles[i].length; j++){
						if(j > 0){
							if(allArticles[i][j].source.name != "Yahoo Entertainment" && allArticles[i][j].title != consolidatedArticles[consolidatedArticles.length-1].title){
								consolidatedArticles.push(await analyzeArticle(allArticles[i][j]))
							}
						}else{
							consolidatedArticles.push(await analyzeArticle(allArticles[i][j]))
						}
					}
					if(i == 11 && allArticles[11] != undefined){
						var string = JSON.stringify(consolidatedArticles, null, "\t");
						resolve(consolidatedArticles)
					}
				}
			}
		}
	})
}

function getAllStoredArticles(){
	return new Promise((resolve, reject) => {
		fs.readFile('data/articles/consolidatedAnalyzed/all.json', "utf8", (err, jsonString) => {
			if (err){
				console.log("File read failed:", err)
				return
			}else{
				let allJSON = JSON.parse(jsonString)
				resolve(allJSON)
			}
		})	
	})
}

function requestArticles(date, keywords){
    return new Promise((resolve, reject) => {
		if(date != undefined){
			var temp = new Date()
			//var start = convertDate(temp.setDate(temp.getDate()-7))
			var end = convertDate(date)
			let url = 'https://newsapi.org/v2/everything?'+
				'sortBy=publishedAt&'+
				//'from='+start+'&'+
				'to='+end+'&'+
				'language=en&'+
				'q=+stock,S&P500&'+
				'searchIn=title,description&'+
				'excludeDomains=yahoo.com,youtube.com&'+
				'pageSize=100&'+
				'page=1&' +
				'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c';
			getArticles(url)
		}else{
			let url = 'https://newsapi.org/v2/top-headlines?'+
                'category=business&'+
                // 'from='+start+'&'+
                // 'to='+end+'&'+
                'sortBy=publishedAt&'+
                'language=en&'+
                'excludeDomains=youtube.com,yahoo.com&'+
                //'q='+keywords+'&'+
                'pageSize=100&'+
                'page=1&' +
                'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c'
			getArticles(url)
		}

		function getArticles(url){
			axios.get(url).then(function(r1) {
				console.log("inrequestArticles")					
				console.log("total results: " + r1.data.totalResults)
				console.log("articles: " + r1.data.articles.length)
				var string = JSON.stringify(r1.data.articles, null, "\t")
				fs.writeFile('data/articles/all/' + r1.data.articles[0].publishedAt + '.json', string, 'utf8', (err) => { 
					if (err) { 
						throw err
					}else{
						console.log("file " + r1.data.articles[0].publishedAt + " written")
						axios.get(r1.data.articles[0].url).then(function(r2) {
							let dom = new jsdom.JSDOM(r2.data, {
								url: r1.data.articles[0].url
							})
							let body = new Readability.Readability(dom.window.document).parse()
							if(body != null){
								r1.data.articles[0].content = body.textContent
								r1.data.articles[0].isFull = true
								resolve(r1.data.articles)
							}else{
								resolve(r1.data.articles)
							}
						})
					}
				})
			})
		}
	})
}

function readArticles(i){
	return new Promise((resolve, reject)  => {
		fs.readFile("data/articles/NOV10Rally08am/"+i+".json", "utf8", (err, jsonString) => {
			if (err) {
				console.log("File read failed:", err)
				return
			}
			resolve(JSON.parse(jsonString))
		})
	})
}

function analyzeArticle(article){
	return new Promise((resolve, reject)  => {
		
		var sentiment = new Sentiment()
		article.titleScore = sentiment.analyze(article.title).score
		article.publishedAt = new Date(article.publishedAt).getTime()
		//console.log(article)
		var titleTokens = article.title.split(" ")
		var marketGrams = new Array()

		for(let i = 0; i < titleTokens.length; i++){
			if(titleTokens[i] == 'stock' || titleTokens[i] == 'stocks'){
				if(titleTokens[i-1] == 'the' || titleTokens[i-1] == 'The'){
					for(let j = 0; j < 3; j++){
						if(titleTokens[i+j] != undefined){
							marketGrams.push(titleTokens[i+j])
						}
					}
				}else{
					for(let j = 3; j > -1; j--){
						if(titleTokens[i-j] != undefined){
							marketGrams.push(titleTokens[i-j])
						}
					}
					marketGrams.push("\n")
				}
			}if(titleTokens[i] == 'market' || titleTokens[i] == 'markets'){
				for(let j = 3; j > -1; j--){
					if(titleTokens[i-j] != undefined){
						marketGrams.push(titleTokens[i-j])
					}
				}
				marketGrams.push("\n")
			}
		}
		marketGrams = marketGrams.join(" ")
		// if(marketGrams.length > 0){
		// 	console.log(article.title)
		// 	console.log(marketGrams)
		// 	console.log(article.titleScore)
		// }
		article.titleMarketGrams = marketGrams
		resolve(article)
	})
}

function handleTimeSeriesPost(request, response){
	console.log("in handle post: " + request.body.clientPhrase)
	let stocks = new stockObservations()
	stocks.getSP500IndexHistorical(60).then(function (result){
		response.send(result)
	})
}

function convertDate(dateObj){
	console.log(dateObj)
    var date = dateObj.toISOString().split('T')[0]
    var time = dateObj.toISOString().split('T')[1].slice(0, -5)
    var dateTime = date+"T"+time;
    return dateTime
}