//INDEX//


function handleArticlePost(request,response){
    let count = 0;
    searchHistory.forEach(element => {
      if (element == request.body.clientPhrase) {
        count += 1;
      }
    })
    searchHistory.push(request.body.clientPhrase)
    let retrieveArticleInstance = new retrieveArticle()
    //retrieveArticleInstance.getArticle(request.body.clientPhrase, count).then(function (result){
    retrieveArticleInstance.getStoredArticle(request.body.articleN, request.body.fileN).then(function (result){
      response.send(result);
    })
  }

  app.post('/getGeneratedArticle', generateArticle);
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

const today = new Date()
let tempDate = new Date(today)
let businessDate = new Date(tempDate)

function isBusinessDay(businessDate){
    var day = businessDate.getDay();
    if(day == 0 || day == 6  ){
        return false;
    }
    return true;
}
while(!isBusinessDay(tempDate)) { tempDate.setDate(tempDate.getDate() - 1); if(ifBusinessDay(tempDate)){businessDate = new Date(tempDate)} }


yahooFinance.historical({

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


yahooFinance.quote({
    symbol: 'TSLA',
    modules: ['price', 'summaryDetail']       // optional; default modules.
  }, function(err, quote) {
    console.log(quote);
});


var keywords = "tesla";
var url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q='+keywords+'&api-key=8BNezA4HGWIAzvytYgmcsPZ6bIwGdJXQ';

const response = await fetch(url, {
    method: 'get',
    // body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
})

const nytArticleData = await response.json();
console.log(nytArticleData.response.docs);


async function imageSearch(){
    let url = result[5]
    params.image_url = result[5]
    console.log(url)
    console.log(params)
    const callback = function(data) {
        console.log(data.image_results[0].link)
        for (const key in data['image_results']){
            if(data['image_results'].hasOwnProperty(key)){
                console.log(`${key} : ${data['image_results'][key].snippet}`)
                result.push(data['image_results'][key].snippet)
            }
        }
        console.log(data['image_results'][0])
    }
    search.json(params, callback)
}


function reverseImageSearch(url){
    const params = {
        engine: "google_reverse_image",
        image_url: "https://i.imgur.com/5bGzZi7.jpg"
    };
}