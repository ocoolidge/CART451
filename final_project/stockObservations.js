const { arrayBuffer } = require('stream/consumers')
const alpha = require('alphavantage')({ key: 'G310EAU66S32MQEY' })
const fs = require('fs')
var request = require('request')
const { resolve } = require('path')
var util = require('util')
const yahooFinance = require('yahoo-finance')
var _ = require('lodash')
require('colors')

class stockObservations {
    constructor(){console.log("init stockObservations.js")}
	getAggregatedObservations(){
		return new Promise((resolve, reject) => {
			let tickers = ['AAPL', 'MSFT'/*, 'NVDA', 'TSLA', 'AMZN', 'BRK.A'*/]
			resolve(iterateRequestStock(tickers))})
		async function iterateRequestStock(tickers){
			let dataArray = new Array()
			let temp = new Array()
			let output = {}
			let shortest = Infinity
			for(let i = 0; i < tickers.length; i++){
				console.log(shortest)
				console.log(i)
				dataArray[i] = await getAlphaStockHist(tickers[i])
				let seriesKey = Object.keys(dataArray[i])[1]
				let metaKey = Object.keys(dataArray[i])[0]
				let theKeys = Object.keys(dataArray[i][seriesKey])
				let close = Object.keys(dataArray[i][seriesKey][theKeys[0]])[3]
				let symbolKey = Object.keys(dataArray[i][metaKey])[1]
				let symbol = dataArray[i][metaKey][symbolKey]
				if(theKeys.length < shortest){
					shortest = theKeys.length}
				temp = new Array()
				for(let k2 = 0; k2 < theKeys.length; k2++){
					temp[k2] = new Array()
					temp[k2][0] = theKeys[k2]
					temp[k2][1] = dataArray[i][seriesKey][theKeys[k2]][close]}
				console.log(shortest)
				output[symbol] = temp}
			output = await trimOutput(output, shortest)
			return output}}

	getInfoYahoo(symbol){
		return new Promise((resolve, reject) => {
			awaitQuote()
			async function awaitQuote(){
				let result = await yahooFinance.quote(
					symbol, ['summaryDetail', 'recommendationTrend'/*, 'earnings', 'calendarEvents', 'upgradeDowngradeHistory', 'price', 'defaultKeyStatistics', 'summaryProfile', 'financialData'*/
				])
				resolve(result)}})}

	getObservationsYahoo(symbol, amtDays){
		const today = new Date()
		let tempDate = new Date(today)
		
		tempDate.setDate(tempDate.getDate() - amtDays)
		console.log(tempDate)

		yahooFinance.historical({
			symbol: symbol,
			from: tempDate,
			to: new Date(),
			period: 'd'
		}).then(function (quotes) {console.log(util.format('=== %s (%d) ===', symbol, quotes.length).cyan)
			if (quotes[0]) {
				console.log(
				'%s\n...\n%s',
				JSON.stringify(quotes[0], null, 2),
				JSON.stringify(quotes[quotes.length - 1], null, 2)
			)} else {console.log('N/A');}})}

	getSP500IndexHistorical(amtDays){
		return new Promise((resolve, reject) => {
			const today = new Date()
			let tempDate = new Date(today)
			tempDate.setDate(tempDate.getDate() - amtDays)
			console.log(tempDate)
			
			var SYMBOL = '^GSPC';

			yahooFinance.historical({
				symbol: SYMBOL,
				from: tempDate,
				to: new Date(),
				period: 'd'
			}).then(function (quotes) {
				// console.log(util.format('=== %s (%d) ===', SYMBOL, quotes.length).cyan)
				// if (quotes[0]) {
				// 	console.log(
				// 	'%s\n...\n%s',
				// 	JSON.stringify(quotes[0], null, 2),
				// 	JSON.stringify(quotes[quotes.length - 1], null, 2)
				// )} else {
				// 	console.log('N/A');
				// }
				//console.log(quotes)
				resolve(quotes)})})}

	getSP500HistoricalYahoo(){
        return new Promise((resolve, reject) => {
			fs.readFile('data/sp500Constituents.json', "utf8", (err, tickersJson) => {
				if (err) {console.log("File read failed:", err)
					return}
				var list = JSON.parse(tickersJson)
				var SYMBOLS = []

				for(let i = 0; i < list.length/50; i++){SYMBOLS[i] = list[i].Symbol}
				console.log(new Date())
				
				yahooFinance.historical({
					symbols: SYMBOLS,
					from: '2022-11-24',
					to: new Date(),
					period: 'd'
				
				}).then(function (result) {
					// _.each(result, function (quotes, symbol) {
					// 	console.log(util.format('=== %s (%d) ===', symbol, quotes.length).cyan)
					// 	if (quotes[0]) {
					// 			console.log(
					// 				'%s\n...\n%s',
					// 				JSON.stringify(quotes[0], null, 2),
					// 				JSON.stringify(quotes[quotes.length - 1], null, 2)
					// 			)
					// 	} else {
					// 		console.log('N/A');
					// 	}
					// })
					//console.log(result)
					resolve(result)})})})}

    getObservations(type, ticker){
        return new Promise((resolve, reject) => {
            alpha.data.intraday_extended(`msft`, undefined, undefined, '60min', 'year1month1', true).then((data) => {
                console.log(data)
                resolve(data)})})}
    
    getHourlyAlpha(ticker){
        return new Promise((resolve, reject) => {
			console.log('getHourlyAlpha')
            var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&adjusted=true&symbol='+ticker+'&outputsize=full&interval=15min&apikey=G310EAU66S32MQEY';
			request.get({url: url,
				json: true,
				headers: {'User-Agent': 'request'}}, (err, res, data) => {
				if (err) {console.log('Error:', err)
				} else if (res.statusCode !== 200) {console.log('Status:', res.statusCode);
				} else {console.log(data)
					resolve(data)}})})}}

function trimOutput(input, shortest){
	return new Promise((resolve, reject) => {
		let keys = Object.keys(input)
		let output = {}
		console.log(keys)
		for(let j = 0; j < keys.length; j++){
			input[keys[j]] = input[keys[j]].slice(0, shortest)}
		output = input
		resolve(output)})}

function getAlphaStockHist(ticker){
	return new Promise((resolve, reject) => {
	console.log('getHourlyAlpha')
		var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&adjusted=true&symbol='+ticker+'&outputsize=full&interval=15min&apikey=G310EAU66S32MQEY'
		request.get({url: url, json: true,
			headers: {'User-Agent': 'request'}}, (err, res, data) => {
			if (err) {console.log('Error:', err)
			} else if (res.statusCode !== 200) {console.log('Status:', res.statusCode)
			} else {resolve(data)}})})}

module.exports = stockObservations;