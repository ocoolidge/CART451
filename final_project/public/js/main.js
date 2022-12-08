// var prevScrollpos = window.pageYOffset;
// window.onscroll = function() {
//   var currentScrollPos = window.pageYOffset;
//   if (prevScrollpos > currentScrollPos) {
//     document.getElementById("navbar").style.top = "0";
//   } else {
//     document.getElementById("navbar").style.top = "-50px";
//   }
//   prevScrollpos = currentScrollPos;
// }
$(document).ready(go)
function go(){
	var dateSideBar = document.getElementById('dateSideBar')
	var corrDiv = document.getElementById('correlationCoef')
	var apophButton = document.getElementById('apophButton')
	var allButton = document.getElementById('allButton')
	var correlationButton = document.getElementById('correlationButton')
	var articleButton = document.getElementById('articleButton')
	var stocksButton = document.getElementById('stocksButton')
	var sentimentTimeSeriesGraph = document.getElementById('sentiCanvas')
	// let articleContainer1 = document.getElementById("resultsContainer")
	// let articleContainer2 = document.getElementById("resultsContainer2")
	let alphaIntelGraph = document.getElementById("alphaIntelCanvas")
	let priceGraph = document.getElementById("stockPriceCanvas")
	let aggStockGraph = document.getElementById("aggregatedStocksCanvas")
	// let highSentArticles1 = document.getElementById("titleGood")
	// let highSentArticles2 = document.getElementById("titleBad")
	let dateListMenu = document.getElementById("dateSideBar")
	let titleGoodTitle = document.getElementById("titleGood")
	let titleBadTitle = document.getElementById("titleBad")
	//let articleTitles = document.getElementById("articleTitle")
	let articles = document.getElementById("articles")
	var tfidf = document.getElementById("tfidf")
	var graphs = document.getElementById("graphs")
	//corrDiv.style.display = "none"
	var isClicked = false

	apophButton.onclick = function(event){
		if(isClicked){
			sentimentTimeSeriesGraph.style.position = "relative"
			alphaIntelGraph.style.position = "relative"
			priceGraph.style.position = "relative"
			aggStockGraph.style.position = "relative"
			isClicked = false
		}else{
			sentimentTimeSeriesGraph.style.position = "absolute"
			alphaIntelGraph.style.position = "absolute"
			priceGraph.style.position = "absolute"
			aggStockGraph.style.position = "absolute"
			isClicked = true}}

	allButton.onclick = function(event){
		graphs.style.display = "block"
		articles.style.display = "block"
		corrDiv.style.display = "block"
		dateListMenu.style.display = "none"
		alphaIntelGraph.style.display = "block"
		priceGraph.style.display = "block"
		sentimentTimeSeriesGraph.style.display = "block"
		// articleTitles.style.display = "block"
		titleGoodTitle.style.display = "block"
		titleBadTitle.style.display = "block"
		dateListMenu.style.display = "block"
		// articleContainer1.style.display = "block"
		// articleContainer2.style.display = "block"
		// highSentArticles1.style.display = "block"
		// highSentArticles2.style.display = "block"
		dateSideBar.style.display = "none"
		tfidf.style.display = "none"}

	correlationButton.onclick = function(event){
		graphs.style.display = "none"
		corrDiv.style.display = "block"
		// articleTitles.style.display = "none"
		titleGoodTitle.style.display = "none"
		titleBadTitle.style.display = "none"
		dateListMenu.style.display = "none"
		// articleContainer1.style.display = "none"
		// articleContainer2.style.display = "none"
		// highSentArticles1.style.display = "none"
		// highSentArticles2.style.display = "none"
		sentimentTimeSeriesGraph.style.display = "none"
		alphaIntelGraph.style.display = "none"
		priceGraph.style.display = "none"
		dateSideBar.style.display = "none"
		articles.style.display = "none"
		tfidf.style.display = "none"}

	stocksButton.onclick = function(event){
		populateDateList()
		graphs.style.display = "block"
		tfidf.style.display = "block"
		dateListMenu.style.display = "block"
		alphaIntelGraph.style.display = "block"
		priceGraph.style.display = "block"
		sentimentTimeSeriesGraph.style.display = "block"
		corrDiv.style.display = "none"
		// articleTitles.style.display = "none"
		titleGoodTitle.style.display = "none"
		titleBadTitle.style.display = "none"
		// articleContainer1.style.display = "none"
		// articleContainer2.style.display = "none"
		// highSentArticles1.style.display = "none"
		// highSentArticles2.style.display = "none"
		dateSideBar.style.display = "none"
		articles.style.display = "none"}

	articleButton.onclick = function(event){
		populateDateList()
		generateArticle()
		getArticle()
		articles.style.display = "block"
		// articleTitles.style.display = "block"
		titleGoodTitle.style.display = "block"
		titleBadTitle.style.display = "block"
		dateListMenu.style.display = "block"
		// articleContainer1.style.display = "block"
		// articleContainer2.style.display = "block"
		// highSentArticles1.style.display = "block"
		// highSentArticles2.style.display = "block"
		corrDiv.style.display = "none"
		sentimentTimeSeriesGraph.style.display = "none"
		alphaIntelGraph.style.display = "none"
		priceGraph.style.display = "none"
		dateSideBar.style.display = "none"
		tfidf.style.display = "none"
		graphs.style.display = "none"}

	let dateListArray = new Array()
	
	function populateDateList(){
		var temp = new Date()
		for(let i = 0; i < 100; i++){
			let listItem = $("<li id="+i+">")
			$("#dateList").append(listItem)
			let listById = document.getElementById(i.toString())
			dateListArray[i] = temp.toString()
			listById.innerHTML = formatDateTime(temp)
			temp.setDate(temp.getDate() - 1)}}

	let today = new Date()
	//getTFIDF()
	//getAggregatedStockData()
	getCorrelationData()
	getStockData()
	generateArticle()
	getArticle()
	sentimentTimeSeries(new Date())
	getAlphaIntel(today, 20)
	//getStocks()

	function getEventTarget(e) {
		e = e || window.event
		return e.target || e.srcElement}
	
	var ul = document.getElementById('dateList')
	ul.onclick = function(event) {
		console.log("ul click")
		var target = getEventTarget(event)
		getAlphaIntel(dateListArray[target.id], 20)
		sentimentTimeSeries(dateListArray[target.id])}

	function getTFIDF(){
		let mData = {date:"date"}
		console.log("inGetTFIDF()")
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url: '/getTFIDF',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseTFIDFData(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")}})}
	
	function getAggregatedStockData(date){
		let mData = {date:date}
		console.log("inAggregatedStockData")
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url: '/getAggregatedStockData',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseAggregatedStockData(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")}})}

	function getCorrelationData(){
		let mData = {data:"no data"}
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url: '/getcorrelationData',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseCorrelationData(response)},
			error:function(e){console.log(e)
				console.log("error occurred")}})}

	function generateArticle(){
		let mData = {data:"no data"}
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url: '/getGenerateArticle',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseGenerateArticle(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")}})}

	function getAlphaIntel(date, length){
		let mData = {date:date, length:length}
		console.log("date menu " + date)
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url: '/getAlphaIntel',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseAlphaIntel(response)
				console.log(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")}})}

	function sentimentTimeSeries(date){
		console.log("in sentimentTimeSeries()")
		let mData = {date:date}
		console.log(mData)
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url:'/getSentimentTimeSeries',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseSentimentTimeSeries(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")}})}

	function getStockData(){
		let mData={clientPhrase:"none"}
		$.ajax({type: "POST",
			data: JSON.stringify(mData),
			url:'/getStockData',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseStockData(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")}})}

	function getArticle(){
		let phrase = $("#articleSearch").val()
		console.log("user phrase:" + phrase)
		let mData = {clientPhrase:phrase}
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url:'/getArticle',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseResponse(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")}})}

	function getStocks(){
		console.log("in getStocks()")
		let mData = {clientPhrase:"stocks"}
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url:'/getStocks',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseStocksResponse(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")}})}}

function parseStocksResponse(response){
	console.log("inParseStocks")
	console.log(response)
	for(let i = 0; i < response.length; i++){
		//console.log(response[i])
		console.log(response[i][0].indicators)}}

function parseTFIDFData(response){
	console.log(response)
	let container = document.getElementById("tfidf")
	//$(container).append($("<p>").html(response.title))
	for(let i = 0; i < response.length; i++){
		response[i].postf = new Array()
		response[i].regulatedTokens = new Array()
		for(let j = 0; j < response[i].tfidf.length; j++){
			if(response[i].tfidf[j] > 0){
				console.log(response[i].tfidf)
				response[i].postf.push(response[i].tfidf[j])
				response[i].regulatedTokens.push(response[i].titletokens[j])
				response[i].tfidfSum += response[i].tfidf[j]}}}
	response = response.sort(function(a, b){return a.tfidfSum/a.titleTokens.length - b.tfidfSum/a.titleTokens.length})
	for(let k = 0; k < response.length; k++){
		let text = document.createTextNode(response[i].title + "\n" + " test")
		let line = document.createElement("p")
		line.style.display = "inline"
		line.appendChild(text)
		//line.appendChild(document.createElement("br"))
		container.appendChild(line)}}

function parseAggregatedStockData(response){
	let keys = Object.keys(response)
	console.log(response)
	let data = new Array()
	let labels = new Array()
	console.log(keys)
	console.log(response[keys[0]])
	for(let k = 0; k < response[keys[0]].length; k++){
		data[k] = 0
		for(let k2 = 0; k2 < keys.length; k2++){
			if(response[keys[k2]].length-1 >= k && parseFloat(response[keys[k2]][k][1]) != undefined && parseFloat(response[keys[k2]][k][1]) != NaN){
				data[k] += parseFloat(response[keys[k2]][k][1])
				labels[k] = response[keys[k2]][k][0]}}
		//console.log(data[k])
		//console.log(response[keys[k2]])
	}

	// for(let i = 0; i < keys.length; i++){
	// 	console.log(response[keys[i]])
	// 	for(let j = 0; j < response[keys[i]].length; j++){
	// 		console.log(data[j] + " + " + response[keys[i]][j][1])
	// 		data[j] = data[j] + parseFloat(response[keys[i]][j][1])

	// 		if(i == 0){
	// 			labels[j] = response[keys[i]][j][0]
	// 		}
	// 	}
	// }
	data = data.reverse()
	labels = labels.reverse()
	var ctx = document.getElementById("aggregatedStocksCanvas")
	var myChart = new Chart(ctx, {type: "line",
		data: {labels: labels, datasets: [{
				label: "Stocks",
				data: data,
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
				fill: false,
				lineTension: 0 }]
		},options: {scales: {xAxes: [{ticks: {autoSkip: true, maxTicksLimit: 20,}}]}}})}

function parseCorrelationData(response){
	console.log(response.length)
	for(let i = 0; i < response.length; i++){
		let meanCorr = 0
	 	let count = 0
		for(let k = 0; k < response[i].correlation.length; k++){
			if(response[i].correlation[k][1] == null || response[i].correlation[k][1] == "no data" || response[i].correlation[k][1] == NaN){
				response[i].correlation[k][1] = -2
			}else{meanCorr += response[i].correlation[k][1];count++}
		}if(count > 0){meanCorr /= count
		}else{meanCorr = 0
		}if(meanCorr != NaN){response[i].meanCorr = meanCorr
		}else{response[i].meanCorr = 0}		
		response[i].correlation = response[i].correlation.sort(function(a, b){return a[1] - b[1]})
		response[i].correlation = response[i].correlation.reverse()}
	response = response.sort(function(a, b){return b.meanCorr - a.meanCorr})
	let list = $("<ul>")
	let item = document.createElement("li")
	let marginAmount = 0
	$("#correlationCoef").append(list)
	let itemArray = new Array()
	let subItemArray = new Array()
	let marginChanger = 15
	for(let i = 0; i < response.length; i ++){
		if(marginAmount > 1100){marginChanger = -15
		}if(marginAmount < -100){marginChanger = 15}
		itemArray[i] = document.createElement("li")
		marginString = marginAmount.toString()
		itemArray[i].style.marginLeft = marginString+"px"
		$(list).append($(itemArray[i]).html((Math.round(response[i].meanCorr * 1000) / 1000) + " " + response[i].name))
		marginAmount += marginChanger
		// for(let f2 = 0; f2 < 10; f2++){
			
		// 	if(response[i].correlation[f2]){
				
		// 		if(response[i].correlation[f2][1] != -2){
		// 			subItemArray[f2] = document.createElement("li")
		// 			subItemArray[f2].style.marginLeft = marginString+"px"
		// 			$(list).append($(subItemArray[f2]).html(response[i].correlation[f2][0] + " Correlation: " + response[i].correlation[f2][1].toString()))
		// 		}
		// 	}
		// }
	}
	response = response.sort(function(a, b){return a.meanCorr - b.meanCorr})
	response = response.reverse()
	console.log(response)}

function parseGenerateArticle(response){console.log(response)}

function parseAlphaIntel(response){
	console.log(response)
	var data = new Array()
	var labels = new Array()
	for(let i = 0; i < response.feed.length; i++){
		data[i] = response.feed[i].overall_sentiment_score
		labels[i] = formatDateTime(convertToDate(response.feed[i].time_published))}
	data = data.reverse()
	labels = labels.reverse()
	var ctx = document.getElementById("alphaIntelCanvas")
	var myChart = new Chart(ctx, {
		type: "line", data: {labels: labels,
			datasets: [{
				label: "Intel",
				data: data,
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
				fill: false,
				lineTension: 0 
			}]},options: {scales: {xAxes: [{ticks: {
						autoSkip: true,
        				maxTicksLimit: 20,}}]}}})}

function parseStockData(response){
	console.log(response)
	var data = new Array()
	var labels = new Array()
	for(let i = 0; i < response.length; i++){
		data[i] = response[i].adjClose
		labels[i] = formatDateTime(new Date(response[i].date))}
	data = data.reverse()
	labels = labels.reverse()
	console.log(data)
	console.log(labels)
	var ctx = document.getElementById("stockPriceCanvas")
	var myChart = new Chart(ctx, {type: "line",
		data: {labels: labels, datasets: [{
				label: "Market Value",
				data: data,
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
				fill: false,
				lineTension: 0 }]
		},options: {scales: {xAxes: [{ticks: {autoSkip: true, maxTicksLimit: 20,}}]}}})}

function parseResponse(response){
	//console.log(response)

	document.getElementById("articleContainer2").innerHTML = response.result2[0]
	document.getElementById("articleTitle2").innerHTML = response.result2[2]
	//document.getElementById("articleSourceAndDate2").innerHTML = response.result2[1] + "  -  " + response.result2[3];

	//var img = document.createElement('img');
	//img.id = "articleImage"
	//img.src = response[5];
	//document.getElementById('resultsContainer').appendChild(img);
}

function parseGeneratedArticle(response){
	console.log(response)
	document.getElementById("articleContainer2").innerHTML = response[0]
	document.getElementById("articleTitle2").innerHTML = response[2]
	//document.getElementById("articleSourceAndDate2").innerHTML = response[1] + "  -  " + response[3];
	document.getElementById("articleImage2").src = response[5]}

function parseSentimentTimeSeries(response){
	let articleSentiment = response[1]
	let sp500 = response[0]
	console.log(articleSentiment.length)
	let filled = false
	let theArray = new Array()
	for(let i = 0; i < articleSentiment.length; i++){
		let dateTime = new Date(articleSentiment[i].publishedAt)
		articleSentiment[i].publishedAt = dateTime.getTime()
		if(articleSentiment[i].isFull || filled == false){
			document.getElementById("articleContainer").innerHTML = articleSentiment[i].content
			document.getElementById("articleTitle").innerHTML = articleSentiment[i].title
			document.getElementById("articleSourceAndDate").innerHTML = articleSentiment[i].source.name + "  -  " + new Date(articleSentiment[i].publishedAt).toISOString()
			filled = true
		}
	}

	console.log(sp500)
	console.log(articleSentiment)
	articleSentiment = articleSentiment.sort(function(a, b){return a.publishedAt - b.publishedAt})
	sp500 = sp500.reverse()
	theArray.date = new Array()
	theArray.meanSentiment = new Array()
	theArray.sp500 = new Array()
	theArray.percentChange = new Array()
	theArray.percentChange[0] = 0

	for(let i = 0; i < sp500.length; i ++){
		theArray.meanSentiment[i] = 0
		let date = new Date(sp500[i].date)
		let count = 0
		theArray.date[i] = date
		for(let j = 0; j < articleSentiment.length; j++){
			let date2 = new Date(articleSentiment[j].publishedAt)
			console.log(date2.toDateString() == date.toDateString())
			if(date2.toDateString() == date.toDateString()){
				theArray.meanSentiment[i] += articleSentiment[j].titleScore
				count++
			}
		}
		if(i>0){
			console.log(sp500[i-1].adjClose + " / " + sp500[i].adjClose)
			theArray.percentChange[i] = sp500[i-1].adjClose/sp500[i].adjClose
		}
		theArray.sp500[i] = sp500[i].adjClose
		if(theArray.meanSentiment != NaN && theArray.meanSentiment != undefined && theArray.meanSentiment != null && count > 0){
			theArray.meanSentiment[i] /= count
		}else{
			theArray.meanSentiment[i] = 0
		}
	}
	var data = new Array()
	var labels = new Array()
	for(let i = 0; i < theArray.date.length; i ++){
		//console.log(theArray.meanSentiment[i])
		//console.log(theArray.date[i])
		data.push(theArray.meanSentiment[i])
		labels.push(formatDateTime(new Date(theArray.date[i])))
	}

	let marketRegression = new Array()
	let sentimentRegression = new Array()
	let regressionLabels = new Array()
	for(let k = 0; k < theArray.date.length; k++){
		marketRegression[k] = [theArray.date.indexOf(theArray.date[k]), theArray.sp500[k]]
		console.log(theArray.meanSentiment[k])
		sentimentRegression[k] = [theArray.date.indexOf(theArray.date[k]), theArray.meanSentiment[k]]
		regressionLabels[k] = theArray.date.indexOf(theArray.date[k])
	}

	const my_sentRegression = regression.linear(sentimentRegression)
	const my_marketRegression = regression.linear(marketRegression)
	
	console.log(my_sentRegression)
	console.log(my_marketRegression)
	let sentRegressionData = new Array()
	let marketRegressionData = new Array()
	for(let k2 = 0; k2 < my_sentRegression.points.length; k2++){
		sentRegressionData[k2] = my_sentRegression.points[k2][1]
		marketRegressionData[k2] = my_marketRegression.points[k2][1]
	}
	
	var totalSentiment = 0
	var sentimentSum = 0
	var totalPositiveSentiment = 0
	var totalNegativeSentiment = 0
	//article.publishedAt = new Date(article.publishedAt).toLocaleString("en-US", {timeZone: "America/New_York"})
	for(let i = 0; i < articleSentiment.length; i ++){
		if(articleSentiment[i].titleScore > 0){
			totalPositiveSentiment += articleSentiment[i].titleScore
		}else if(articleSentiment[i].titleScore < 0){
			totalNegativeSentiment += Math.abs(articleSentiment[i].titleScore)
		}
		sentimentSum += articleSentiment[i].titleScore
		totalSentiment += Math.abs(articleSentiment[i].titleScore)
		
	}

	var negativeSentiment = (totalNegativeSentiment/totalSentiment)
	var positiveSentiment = (totalPositiveSentiment/totalSentiment)
	console.log("positive: " + totalPositiveSentiment)
	console.log("negative: " + totalNegativeSentiment)
	console.log("pos: " + (totalPositiveSentiment/totalSentiment) * 100)
	console.log("neg: " + (totalNegativeSentiment/totalSentiment) * 100)

	var ctx = document.getElementById("sentiCanvas").getContext('2d')
	var myChart = new Chart(ctx, {type: "line",
		data: {labels: labels,
			datasets: [{
				label: "News Sentiment",
				yAxisID: 'A',
				data: theArray.meanSentiment,
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
				fill: false,
				lineTension: 0 
			},{
				label: "Market Value",
				yAxisID: 'B',
				data: theArray.sp500,
				backgroundColor: "rgba(132, 99, 255, 0.2)",
				borderColor: "rgba(132, 99, 255, 1)",
				borderWidth: 1,
				fill: false,
				lineTension: 0 
			}],
		},
		options: {
			scales: {
				yAxes: [{
					id: 'B',
					type: 'linear',
					position: 'left',
				  }, {
					id: 'A',
					type: 'linear',
					position: 'right',
					ticks: {
					  max: 3,
					  min: -3
					}
				  }],
				xAxes: [{
					ticks: {
						autoSkip: true,
        				maxTicksLimit: 30,
					}
				}]
			}
		}
	})

	var ctx2 = document.getElementById("regressionCanvas").getContext('2d')
	var myChart = new Chart(ctx2, {type: "line",
		data: {labels: regressionLabels,
			datasets: [{
				label: "News Sentiment Regression",
				yAxisID: 'A',
				data: sentRegressionData,
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
				fill: false,
				lineTension: 0 
			}
			,{
				label: "Market Value Regression",
				yAxisID: 'B',
				data: marketRegressionData,
				backgroundColor: "rgba(132, 99, 255, 0.2)",
				borderColor: "rgba(132, 99, 255, 1)",
				borderWidth: 1,
				fill: false,
				lineTension: 0 
			}
		],
		},
		options: {
			scales: {
				yAxes: [{
					id: 'B',
					type: 'linear',
					position: 'left',
					ticks: {
						max: 4100,
						min: 3500
					  }
				  }, {
					id: 'A',
					type: 'linear',
					position: 'right',
					ticks: {
					  max: 3,
					  min: -3
					}
				  }],
				xAxes: [{
					ticks: {
						autoSkip: true,
        				maxTicksLimit: 30,
					}
				}]
			}
		}
	})


	let goodList = $("<ul>")
	let badList = $("<ul>")
	$("#titleGood").append(goodList)
	$("#titleBad").append(badList)
	console.log(totalSentiment)
	articleSentiment = articleSentiment.sort(function(a, b){return Math.abs(b.titleScore) - Math.abs(a.titleScore)})
	for(i = 0; i < articleSentiment.length; i ++){
		if(articleSentiment[i].titleScore > 0){
			let date = new Date(articleSentiment[i].publishedAt)
			$(goodList).append($("<li>").html(articleSentiment[i].title + " - " + date.toLocaleString('en-US', { timeZone: 'EST' }) + ": " + articleSentiment[i].titleScore.toString()))
		}else if(articleSentiment[i].titleScore < 0){
			let date = new Date(articleSentiment[i].publishedAt)
			$(badList).append($("<li>").html(articleSentiment[i].title + " - " + date.toLocaleString('en-US', { timeZone: 'EST' }) + ": " + articleSentiment[i].titleScore.toString()))}}
	var positive = document.createTextNode("Positive")
	var negative = document.createTextNode("Negative")
	document.getElementById("titleGood").prepend(positive)
	document.getElementById("titleBad").prepend(negative)
}


function formatDateTime(dateObj){
	var output = dateObj.toLocaleDateString("en-US", {
		timeZone: 'EST',
		//year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"})
	return output}

function convertToDate(string){
    var date = string.slice(0,4)+'-'+string.slice(4,6)+'-'+string.slice(6,8)
    var time = string.slice(9,11)+':'+string.slice(11,13)+':'+string.slice(13,15)
    return new Date(date+'T'+time)}