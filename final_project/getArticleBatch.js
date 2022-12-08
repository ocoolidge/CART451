const jsdom = require('jsdom');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
let file = 0;
var diff = 60;
var diffUnit = 'minutes'
var UTCnow = moment().utc();
var UTCpast = moment().utc().subtract(diff, diffUnit);

//10 NOV 6AM EST TO 10 NOV 8AM EST
var rallyTime = new Date('2022-11-14T00:00:00');
var segments = 12;
var segmentLength = 12;
var startOfInterest = new Date(rallyTime.setHours(rallyTime.getHours() - (segments/2) * segmentLength))
var endOfInterest = new Date (rallyTime.setHours(rallyTime.getHours() + (segments * segmentLength)))


iterate()
async function iterate(){
    var start = new Date (startOfInterest);
    for(i = 0; i < segments; i++){
        var end = new Date(startOfInterest.setHours(startOfInterest.getHours() + segmentLength));
        console.log(start + " --> " + end)
        var fileNumber = await getTopArticles(convertDate(start), convertDate(end));
        console.log(fileNumber);
        start = new Date(end);
    }
}

console.log("start of interest: " + startOfInterest.toString())
console.log("end of interest: " + endOfInterest.toString())

var UTCstart = convertDate(new Date(UTCpast))
var UTCend = convertDate(new Date(UTCnow))

console.log("EST NOW: " + moment().format());
console.log("UTC NOW: " + UTCstart + " to " + UTCend + " (" + diff + " " + diffUnit + ")");
console.log(UTCstart.toString() + '->' + diff + diffUnit);
console.log(new Date('2022-11-09T22:35:00').toString());

//getTopArticles(startOfInterest, endOfInterest);

//getTopArticles(UTCstart, UTCend);
//setInterval(getTopArticles(start, end), 60000)

function getTopArticles(start, end){
    return new Promise((resolve, reject) => {
        fs.readdir('data/articles/NOV17PULL', (err, files) => {
            file = files.length + 1;
        });
    let url =   'https://newsapi.org/v2/everything?'+
                'sortBy=publishedAt&'+
                'from='+start+'&'+
                'to='+end+'&'+
                'language=en&'+
                'q=+stock,S&P500&'+
                'searchIn=title,description&'+
                'excludeDomains=yahoo.com&'+
                'pageSize=100&'+
                'page=1&' +
                'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c';

    let url2 = 'https://newsapi.org/v2/top-headlines?'+
                //'category=business&'+
                'from='+start+'&'+
                'to='+end+'&'+
                'sortBy=publishedAt&'+
                'language=en&'+
                'excludeDomains=youtube.com&'+
                //'q=S&P500&'+
                'pageSize=100&'+
                'page=1&' +
                'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c'
          
    axios.get(url).then(function(r1) {
            
        //console.log(r1.data.articles);
        console.log("total results: " + r1.data.totalResults);
        console.log("articles: " + r1.data.articles.length);
        var json = JSON.stringify(r1.data.articles, null, "\t");
        //getArticleBodys(articles);
        fs.writeFile('data/articles/NOV17PULL/' + file + '.json', json, 'utf8', (err) => { 
            if (err) { 
                throw err; 
            }else{
                console.log("file " + file + " written")
                resolve(file)
            }
        })
        
    })
})
}
    
function getArticleBodys(articles){
    //async function iterateWord(){
        const output = new Array();
        for(i = 0; i < articles.length; i++){
          
            axios.get(articles[i].url).then(function(r2) {
                // We now have the article HTML, but before we can use Readability to locate the article content we need jsdom to convert it into a DOM object
                let dom = new jsdom.JSDOM(r2.data, {
                    url: articles[0].url
                });
                let articleBody = new Readability.Readability(dom.window.document).parse();
                let articleText = "Article Text Was Null"
                if(articleBody != null){
                    articleText = articleBody.textContent;
                }
                let articleComplete = [articleText, article.source.name, article.title, article.publishedAt, article.url, article.urlToImage, article.author, article.publishedAt];
                console.log(articleComplete);
                output[i] = articleComplete;
                i++;
            })
            
        }
        
    //}
}
 


function getAllArticles(start, end){
    
    let url = 'https://newsapi.org/v2/everything?'+
                'q=bitcoin&'+
                'from='+start+'&'+
                'to='+end+'&'+
                'sortBy=publishedAt&'+
                'language=en&'+
                'page=1&'+
                'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c'
          
    axios.get(url).then(function(r1) {
            
        let firstResult = r1.data.articles[0];
        console.log("articles: " + r1.data.totalResults);
        //console.log(firstResult);
        //console.log(r1.data.sources);
        for (const s of r1.data.articles){
            //console.log(s.name);
        }
    })
}

function getAllEnglishSources(){
    let url = 'https://newsapi.org/v2/sources?'+
                'language=en&'+
                'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c';
    axios.get(url).then(function(r1) {
        //console.log(r1.data.sources);
        for (const s of r1.data.sources){
            console.log(s.url);
        }
        console.log("sources: " + r1.data.sources.length);
    })
}

// const ESTDate = changeTimeZone(new Date(), 'America/New_York');
// console.log(ESTDate.toString()); // 👉️ "Sun Jan 16 2022 01:22:07"
function changeTimeZone(date, timeZone) {
    return new Date(
        date.toLocaleString('en-US', {
          timeZone,
        }),
      );
}

function convertDate(dateObj){
    var date = dateObj.toISOString().split('T')[0]
    var time = dateObj.toISOString().split('T')[1].slice(0, -5)
    var dateTime = date+"T"+time;
    return dateTime
}