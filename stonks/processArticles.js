const fs = require('fs');
const Sentiment = require('sentiment');
//+stock,S&P500

getStoredArticles();

function getStoredArticles(){
  for(i = 20; i < 20+12; i++){
  fs.readFile("data/articles/NOV10Rally08am/"+i+".json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    let articles = JSON.parse(jsonString)
    var sentiment = new Sentiment();
    let articlesContent = {};
    
    for(j = 0; j < articles.length; j++){
      articles[j].titleScore = sentiment.analyze(articles[j].title);
      //articles[i].descriptionScore = sentiment.analyze(articles[i].title);
      //articles[i].contentScore = sentiment.analyze(articles[i].content.split('\r'));
      //articles[i].totalScore = parseInt(articles[i].descriptionScore) + parseInt(articles[i].titleScore)// + articles[i].contentScore
      //console.log(articles[i].titleScore.score + "  " + articles[i].title)
      //console.log(articles[i].descriptionScore.score + "  " + articles[i].description) 
      console.log(articles[j].publishedAt + " " + articles[j].titleScore.score + " " + articles[j].title)
    }
    //console.log(articles[1].publishedAt)
    //console.log(articles);
  });
}
}