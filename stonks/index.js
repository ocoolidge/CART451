// import yahooFinance from "yahoo-finance";
// import request from "request";
// import fetch from "node-fetch";
// import fs from "fs";
// import Readability from '@mozilla/readability';
// import jsdom from 'jsdom';
// import axios from 'axios';
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const retrieveArticle = require('./retrieveArticle.js');
const scrambleText = require('./scrambleText.js');
const stockObservations = require('./stockObservations.js');
const WordNet = require('node-wordnet');
const wordnet = new WordNet("./node_modules/wordnet-db/dict")
const SerpApi = require('google-search-results-nodejs');
const nlp = require('node-nlp');
const natural = require('natural');
const Chart = require('chart.js');
const fs = require('fs');
const Sentiment = require('sentiment');
const { dockStart } = require('@nlpjs/basic');
const { getEnvironmentData } = require('worker_threads');
const { resolve } = require('path');
const search = new SerpApi.GoogleSearch("254e041f84f9ff60250d27f7e19dd08b45dea34f90379b2b9a05f59184c2fad9");
const portNumber = 4203;
let app = express();
var tickers = {};

app.use(express.static(__dirname + '/public'));

app.get('/stonks', function(req, res) {
    res.sendFile(__dirname + '/public/stocksandnews.html');
});

//default route
app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>');
});

// "body parser" is needed to deal with post requests
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// fs.readFile("data/tickers.json", "utf8", (err, jsonString) => {
//   tickers = JSON.parse(jsonString);
// })

let httpServer = http.createServer(app);

// make server listen for incoming messages
httpServer.listen(portNumber, function(){
  console.log('listening on port:: '+portNumber);
})

let searchHistory = new Array();

app.post('/getSentimentTimeSeries', handleSentimentPost)
app.post('/getArticle', handleArticlePost2);
app.post('/getGeneratedArticle', generateArticle);
//app.post('/getArticle2', handleArticlePost2);
app.post('/getStockData', handleStockPost);

function handleSentimentPost(request, response){
  articleSentimentTimeSeries().then(function (result){
    console.log(result.length)
    response.send(result);
  })
}

function generateArticle(request,response){
  console.log("in generateArticle Pointer: " + request.body.pointerT)
  let retrieveArticleInstance = new retrieveArticle();    
  retrieveArticleInstance.getSameStoredArticle().then(function (result){
    console.log(result[2])
    //console.log(inputArray);
      
    let scrambledString = " "
    //response.send(original);
    var result2 = result;
    iterateWord()
    async function iterateWord(){
      let array = result2[2].split(" ");
      let scrambleTextInstance = new scrambleText();
        for(i = 0; i < array.length; i++){
          let response = await scrambleTextInstance.wordSwitch(array[i], request.body.pointerT);
          //console.log("response: " + response);
          scrambledString = scrambledString + response + " ";
        }
        scrambledString = scrambledString.replace(/_/g, ' ')
        scrambledString = scrambledString.charAt(0).toUpperCase() + scrambledString.slice(1);
        result2[2] = scrambledString;
        console.log(result2)
        response.send(result2);
    }
  })
}

function handleArticlePost2(request,response){
    console.log('articlePost2');
    let count = 0;
    searchHistory.forEach(element => {
      if (element == request.body.clientPhrase) {
        count ++;
        console.log(count);
      }
    });
    searchHistory.push(request.body.clientPhrase);
    console.log(searchHistory);

    let retrieveArticleInstance = new retrieveArticle();    
    retrieveArticleInstance.getStoredArticle().then(function (result){
        
    console.log(result[2])
    //console.log(inputArray);
    
    let scrambledString = " "
    let scrambledString2 = " "
    //response.send(original);
    const normalResult = JSON.parse(JSON.stringify(result));
    let scrambledResult = result;
    //console.log(scrambledResult)
    iterateWord()
        
    async function iterateWord(){
      let array = scrambledResult[2].split(" ");
      let array2 = scrambledResult[0].split(" ");
      let scrambleTextInstance = new scrambleText();
      //console.log(array)
      for(i = 0; i < array.length; i++){
        let scrambledWord = await scrambleTextInstance.wordSwitch(array[i]);
        let scrambledWord2 = await scrambleTextInstance.wordSwitch(array2[i]);
        scrambledString = scrambledString + scrambledWord + " ";
        scrambledString2 = scrambledString2 + scrambledWord2 + " ";
        array2[i] = "";
      }
      scrambledString = scrambledString.replace(/_/g, ' ')
      scrambledString = scrambledString.charAt(0).toUpperCase() + scrambledString.slice(1);
      scrambledResult[2] = scrambledString;
      scrambledResult[0] = (scrambledString2 + array2.join(" ")).replace(/_/g, ' ')

      final = {result1: normalResult, result2: scrambledResult}
      //console.log(final);
      response.send(final);
    } 
  })
}

function articleSentimentTimeSeries(){
  return new Promise((resolve, reject)  => {
    var sentimentTimeSeries = [];
    for(i = 20; i < 32; i++){
      fs.readFile("data/articles/NOV10Rally08am/"+i+".json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }
        let articles = JSON.parse(jsonString)
        var sentiment = new Sentiment();
        
        for(j = 0; j < articles.length; j++){
          articles[j].titleScore = sentiment.analyze(articles[j].title).score;
          //articles[i].descriptionScore = sentiment.analyze(articles[i].title);
          //articles[i].contentScore = sentiment.analyze(articles[i].content.split('\r'));
          //articles[i].totalScore = parseInt(articles[i].descriptionScore) + parseInt(articles[i].titleScore)// + articles[i].contentScore
          //console.log(articles[i].titleScore.score + "  " + articles[i].title)
          //console.log(articles[i].descriptionScore.score + "  " + articles[i].description) 
          //console.log(articles[j].publishedAt + " " + articles[j].titleScore.score + " " + articles[j].title)
          articles[j].publishedAt = new Date(articles[j].publishedAt).toLocaleString("en-US", {timeZone: "America/New_York"})
          sentimentTimeSeries.push(articles[j])
          //sentimentTimeSeries[articles[j].publishedAt] = {}
          //sentimentTimeSeries[articles[j].publishedAt].titleSentiment = articles[j].titleScore.score
          if(j >= articles.length - 1 && i >= 31){
            //console.log(sentimentTimeSeries)
            resolve(sentimentTimeSeries);
          }
        }
        //console.log(articles[1].publishedAt)
        //console.log(articles);
      });
    }
  })
}

function handleArticlePost(request,response){
  let count = 0;
  searchHistory.forEach(element => {
    if (element == request.body.clientPhrase) {
      count += 1;
      console.log(count);
    }
  });
  searchHistory.push(request.body.clientPhrase);
  console.log(searchHistory);

  let retrieveArticleInstance = new retrieveArticle();
  //retrieveArticleInstance.getArticle(request.body.clientPhrase, count).then(function (result){
  retrieveArticleInstance.getStoredArticle(request.body.articleN, request.body.fileN).then(function (result){
    response.send(result);
  })
}

function handleStockPost(request, response){
  // console.log("in handle post: " + request.body.clientPhrase)
  // let stocks = new stockObservations();
  // //  stocks.getVolatile('SSO').then(function (result){
  // //    response.send(result);
  // //  })
  // //iterateTickers();
  // async function iterateTickers(){
  //   var stockData = {};
  //   for(var i = 1; i < 50; i++){
  //     if(tickers[i][0].length > 0){
  //       console.log(tickers[i][0])
  //       let data = await stocks.getVolatile(tickers[i][0]);
  //       //console.log(data)
  //       stockData[tickers[i][0]] = data;
  //     }
  //   }
  //   console.log(stockData)
  // }
}

async function imageSearch(){
  let url = result[5]
    params.image_url = result[5];
    console.log(url);
    console.log(params);
    const callback = function(data) {
      console.log(data.image_results[0].link);
      for (const key in data['image_results']){
        if(data['image_results'].hasOwnProperty(key)){
          console.log(`${key} : ${data['image_results'][key].snippet}`)
          result.push(data['image_results'][key].snippet)
        }
      }
      console.log(data['image_results'][0])
      
    };
    search.json(params, callback);
}

function reverseImageSearch(url){
  const params = {
    engine: "google_reverse_image",
    image_url: "https://i.imgur.com/5bGzZi7.jpg"
  };
}

const currentDate = new Date();
let businessDate = currentDate;

function isBusinessDay(businessDate){
    var day = businessDate.getDay();
    if(day == 0 || day == 6  ){
        return false;
    }
    return true;
}
//while (!isBusinessDay(businessDate)) { date.setDate(businessDate.getDate() - 1) }
  
/*
  var ctx = canvas.getContext('2d');
  var config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
          label: 'Graph Line',
          data: data,
          backgroundColor: 'rgba(0, 119, 204, 0.3)'
      }]
    }
  };

  var chart = new Chart(ctx, config);
*/


/*yahooFinance.historical({

  symbol: 'AAPL',
  from: businessDate,
  to: businessDate,
  period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)

}, function (err, quotes) {

    quotes.forEach(function(quote){
        console.log(quote);
    })

    console.log(quotes);

});
*/

/*yahooFinance.quote({
    symbol: 'TSLA',
    modules: ['price', 'summaryDetail']       // optional; default modules.
  }, function(err, quote) {
    console.log(quote);
});*/


/*var keywords = "tesla";
var url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q='+keywords+'&api-key=8BNezA4HGWIAzvytYgmcsPZ6bIwGdJXQ';

    const response = await fetch(url, {
    method: 'get',
    // body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
});
const nytArticleData = await response.json();
console.log(nytArticleData.response.docs);*/