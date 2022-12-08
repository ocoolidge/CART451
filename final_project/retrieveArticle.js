const Readability = require('@mozilla/readability')
const jsdom = require('jsdom')
const axios = require('axios')
const request = require('request')
const scrambleText = require('./scrambleText.js')
const fs = require('fs')
const { getEnabledCategories } = require('trace_events')

class retrieveArticle {

	constructor(){
		console.log("init retriveArticle.js")
	}

	getArticleTFIDFLive(){
		return new Promise((resolve, reject) => {
			this.getLiveArticles().then(function(result){
				resolve(result)
			})
		})
	}

	getLiveArticles(){
		return new Promise((resolve, reject) => {
			let url = 'https://newsapi.org/v2/top-headlines?'+
					//'category=business&'+
					// 'from='+start+'&'+
					// 'to='+end+'&'+
					'sortBy=publishedAt&'+
					'language=en&'+
					'excludeDomains=youtube.com,yahoo.com&'+
					//'q='+keywords+'&'+
					'pageSize=100&'+
					'page=1&' +
					'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c'
			axios.get(url).then(function(r1) {
				console.log("inrequestArticles")					
				console.log("total results: " + r1.data.totalResults)
				console.log("articles: " + r1.data.articles.length)
				var string = JSON.stringify(r1.data.articles, null, "\t")
				let articleSet = r1.data.articles
				let amtBodies = 6
				doAll()
				console.log("after")
				async function doAll(){
					let hardCopy = JSON.parse(JSON.stringify(articleSet))
					for(let i = 0; i < amtBodies; i++){
						let body = await getArticleBody(hardCopy[i].url)
						console.log(body)
						hardCopy[i].content = body.content
						console.log(hardCopy[i])
						console.log(i)
						if(hardCopy[i].content == "BLOCKED"){
							amtBodies++
						}
						console.log(hardCopy[i].title)
					}
					resolve(await newTFIDF(hardCopy))
				}
				// fs.writeFile('data/articles/all/' + r1.data.articles[0].publishedAt + '.json', string, 'utf8', (err) => { 
				// 	if (err) { 
				// 		throw err
				// 	}else{
				// 		console.log("file " + r1.data.articles[0].publishedAt + " written")					
				// 	}
				// })
			})
		})
	}

	getArticleTFIDF(){
		return new Promise((resolve, reject) => {
			let articleData = {}
			fs.readdir('data/articles/all/', (err, files) => {
				var file = files[Math.floor(Math.random() * files.length)]
				fs.readFile('data/articles/all/' + file, "utf8", (err, jsonString) => {
					if (err){
						console.log("File read failed:", err)
						return
					}
					articleData = JSON.parse(jsonString)
					if(articleData.status){
						articleData = articleData.articles
					}
					let i = Math.floor(Math.random() * articleData.length)
					getArticleBody(articleData[i].url).then(function(article){
						if(article != "BLOCKED"){
							articleData.content = article.textContent
						}
						resolve(libraryFrequency(articleData[i], files))
					})
				})
			})
		})
	}

	getStoredArticle(){
		return new Promise((resolve, reject) => {
			let articleData = {}
			fs.readdir('data/articles/all/', (err, files) => {
				var file = files[Math.floor(Math.random() * files.length)]
				fs.readFile('data/articles/all/' + file, "utf8", (err, jsonString) => {
					if (err){
						console.log("File read failed:", err)
						return
					}
					articleData = JSON.parse(jsonString)
					if(articleData.status){
						articleData = articleData.articles
					}
					let i = Math.floor(Math.random() * articleData.length)
					console.log(file)
					console.log(articleData[i].url)
					getArticleBody(articleData[i].url).then(function(article){
						if(article != "BLOCKED"){
							let articleComplete = [article.textContent, articleData[i].source.name, articleData[i].title, articleData[i].publishedAt, articleData[i].url, articleData[i].urlToImage, articleData[i].author];
							resolve(articleComplete)
						}else{
							let articleComplete = [articleData[i].content, articleData[i].source.name, articleData[i].title, articleData[i].publishedAt, articleData[i].url, articleData[i].urlToImage, articleData[i].author];
							resolve(articleComplete)
						}
					})
				})
			})
		})
	}

	getAlphaIntel(from, length){
		return new Promise((resolve, reject) => {
			console.log("test")
			console.log(from.toString())
			var start = convertDate(from)
			console.log("start: " + start)
			var temp = new Date(from)
			var end = convertDate(temp.setDate(temp.getDate() + length))
			console.log("start: " + start)
			console.log("end: " + end)
			var url = 'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&limit=200&tickers=AAPL&sort=LATEST&time_from='+start+'&time_to='+end+'&apikey=G310EAU66S32MQEY'
			request.get({
				url: url,
				json: true,
				headers: {'User-Agent': 'request'}
			}, (err, res, data) => {
				if (err) {
					console.log('Error:', err)
				} else if (res.statusCode !== 200) {
					console.log('Status:', res.statusCode)
				} else {
					console.log(data)
					// console.log(data.feed[0])
					// console.log(data.feed[data.feed.length-1])
					var date2 = convertToDate(data.feed[0].time_published)
					var date1 = convertToDate(data.feed[data.feed.length-1].time_published)
					var dateDiff = parseFloat((date2 - date1) / (1000 * 60 * 60 * 24), 10)
					// console.log(date1)
					// console.log(date2)
					// console.log(dateDiff)
					// console.log(data.feed.length)
					resolve(data)
				}
			})
		})
	}
}

function newTFIDF(articles){
	return new Promise((resolve, reject) => {
		getCommon().then(function(common){
			console.log(common)
			let titleTerms = new Array()
			for(let j = 0; j < articles.length; j++){
				for(let k = 0; k < articles[j].title.length; k++){
					titleTerms.push(articles[j].title.toLowerCase().split(" "))
				}
			}for(let i = 0; i < articles.length; i++){
				let tfidf = new Array()
				let titleTokens = articles[i].title.toLowerCase().split(" ")
				for(let k3 = 0; k3 < titleTokens.length; k3++){
					tfidf[k3] = 0
					for(let k4 = 0; k4 < titleTerms.length; k4++){
						if(titleTerms[k4].indexOf(titleTokens[k3]) > -1){
							tfidf[k3]++
						}
					}
					tfidf[k3] = Math.log(titleTerms.length/tfidf[k3])
					if(common.indexOf(titleTokens[k3]) > -1 || /\d/.test(titleTokens[k3])){
						tfidf[k3] = -tfidf[k3]
					}
					console.log(titleTokens[k3] + " " + tfidf[k3])
				}
				articles[i].titleTokens = titleTokens
				articles[i].tfidf = tfidf
				console.log(articles)
			}
			resolve(articles)
		})
	})
}

function getArticleBody(url){
	return new Promise((resolve, reject) => {
		axios.get(url).then(function(r2) {
			let dom = new jsdom.JSDOM(r2.data, {
				url: url
			})
			let article = new Readability.Readability(dom.window.document).parse()
			if(article){
				resolve(article)
			}else{
				resolve("BLOCKED")
			}
		})
	})
}

function convertDate(dateObj){
	var temp = new Date(dateObj)
    var date = temp.toISOString().split('T')[0].split('-')
	var newDate = date.join("")
    var time = temp.toISOString().split('T')[1].slice(0, -7).split(':')
	var newTime = time.join("")
    var dateTime = newDate + "T" + newTime
    return dateTime
}

function convertToDate(string){
    var date = string.slice(0, 4)+'-'+string.slice(4,6)+'-'+string.slice(6, 8)
    var time = string.slice(9, 11)+':'+string.slice(11,13)+':'+string.slice(13, 15)
    return new Date(date+'T'+time)
}

async function libraryFrequency(article, files){
	let titleTerms = new Array()
	let bodyTerms = new Array()
	let common = await getCommon()
	console.log(common)
	for(let i = 1; i < files.length-1; i++){
		let fileData = await readFile(files[i])
		for(let k = 0; k < fileData.length; k++){
			//let body = await getArticleBody(fileData[k].url)
			//fileData[k].content = body.textContent
			titleTerms.push(fileData[k].title.split(" "))
			//bodyTerms.push(fileData[k].content.split(" "))
		}
	}
	let tfidf = new Array()
	console.log(article)
	let titleTokens = article.title.split(" ")
	for(let k3 = 0; k3 < titleTokens.length; k3++){
		tfidf[k3] = 0
		for(let k4 = 0; k4 < titleTerms.length; k4++){
			if(titleTerms[k4].indexOf(titleTokens[k3]) > -1){
				tfidf[k3]++;
			}
		}
		tfidf[k3] = Math.log(titleTerms.length/tfidf[k3])
		if(common.indexOf(titleTokens[k3]) > -1 || /\d/.test(titleTokens[k3])){
			tfidf[k3] = -tfidf[k3]
		}
		console.log(titleTokens[k3] + " " + tfidf[k3])
	}
	article.titleTokens = titleTokens
	article.tfidf = tfidf
	console.log(article)
	return article
}

function readFile(file){
	return new Promise((resolve, reject) => {
		fs.readFile('data/articles/all/' + file, "utf8", (err, jsonString) => {
			if (err){
				console.log("File read failed:", err)
				return
			}
			resolve(JSON.parse(jsonString))
		})
	})
}

function getCommon(){
	return new Promise((resolve, reject) => {
		fs.readFile('data/1000CommonWords.txt', "utf8", (err, jsonString) => {
			if (err){
				console.log("File read failed:", err)
				return
			}else{
				let common = jsonString.split(/\r?\n/)
				resolve(common)
			}
		})
	})
}

module.exports = retrieveArticle;
