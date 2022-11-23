const Readability = require('@mozilla/readability')
const jsdom = require('jsdom')
const axios = require('axios')
const scrambleText = require('./scrambleText.js')
const fs = require('fs')
let fileNumber = 0;
let i = 0;

class retrieveArticle {

  constructor(){
      console.log("init retriveArticle.js");
  }

  getSameStoredArticle(){
    return new Promise((resolve, reject) => {
      console.log("in getSameStoredArticle()");
      let articleData = {};
        let rawdata = fs.readFileSync('data/articles/'+fileNumber+'.json');
        articleData = JSON.parse(rawdata);
        //console.log("file: " + fileNumber + " article: " + i);
        //console.log(articleData[i].url)
        getArticleBody(articleData[i].url).then(function(article){
          console.log("here")
          if(article != null){
            let articleComplete = [article.textContent, articleData[i].source.name, articleData[i].title, articleData[i].publishedAt, articleData[i].url, articleData[i].urlToImage, articleData[i].author];
            //console.log(articleComplete);
            resolve(articleComplete)
          }else{
            let articleComplete = ["article.textContent", articleData[i].source.name, articleData[i].title, articleData[i].publishedAt, articleData[i].url, articleData[i].urlToImage, articleData[i].author];
            resolve(articleComplete)
          }
        })
    })
  }

  getStoredArticle(){
    return new Promise((resolve, reject) => {
      console.log("in getStoredArticle()");
      let articleData = {};
      fs.readdir('data/articles', (err, files) => {
        fileNumber = Math.floor((Math.random() * files.length)-1);
        //console.log(fileNumber)
        let rawdata = fs.readFileSync('data/articles/'+fileNumber+'.json');
        articleData = JSON.parse(rawdata);
        //console.log(fileNumber)
        i = Math.floor(Math.random() * articleData.length)
        //console.log("file: " + fileNumber + " article: " + i);
        //console.log(articleData[i].url)
        getArticleBody(articleData[i].url).then(function(article){
          console.log("here")
          if(article != null){
            let articleComplete = [article.textContent, articleData[i].source.name, articleData[i].title, articleData[i].publishedAt, articleData[i].url, articleData[i].urlToImage, articleData[i].author];
            //console.log(articleComplete);
            resolve(articleComplete)
          }else{
            let articleComplete = ["article.textContent", articleData[i].source.name, articleData[i].title, articleData[i].publishedAt, articleData[i].url, articleData[i].urlToImage, articleData[i].author];
            resolve(articleComplete)
          }
        })
      })
    })
  }

  getArticle(keyword, searchRepeat){
    return new Promise((resolve, reject) => {
      let url = 'https://newsapi.org/v2/everything?' +
          'q='+keyword+'&' +
          'sortBy=relevance&' +
          'language=en&' +
          'pageSize=5&' +
          'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c';
          
      axios.get(url).then(function(r1) {
              
        let firstResult = r1.data.articles[searchRepeat];
        //console.log(r1.data)
        //console.log("Total Results for " + keyword + ": " + r1.data.totalResults);
        //console.log("First Result: " + r1.data.articles[0].content);
        //console.log(r1);
        // ...and download the HTML for it, again with axios
        axios.get(firstResult.url).then(function(r2) {
      
          // We now have the article HTML, but before we can use Readability to locate the article content we need jsdom to convert it into a DOM object
          let dom = new jsdom.JSDOM(r2.data, {
            url: firstResult.url
          });
      
          let article = new Readability.Readability(dom.window.document).parse();
          //console.log(article.textContent);
          let articleText = "Article Text Was Null"
          if(article != null){
            articleText = article.textContent;
          }
          let articleComplete = [articleText, firstResult.source.name, firstResult.title, firstResult.publishedAt, firstResult.url, firstResult.urlToImage, firstResult.author];
          //console.log(articleComplete);
          resolve(articleComplete)
        })
      })
    })
  }
}

function getArticleBody(url){
  return new Promise((resolve, reject) => {
    axios.get(url).then(function(r2) {
      let dom = new jsdom.JSDOM(r2.data, {
        url: url
      });
      let article = new Readability.Readability(dom.window.document).parse();
      let articleText = "Article Text Was Null"
      resolve(article)
    })
  })

}

module.exports = retrieveArticle;
