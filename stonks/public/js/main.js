$(document).ready(go);
src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"

jQuery(function(){
  jQuery('#getRes').click();
  console.log("clicked");
});

var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("navbar").style.top = "0";
  } else {
    document.getElementById("navbar").style.top = "-50px";
  }
  prevScrollpos = currentScrollPos;
}

function go(){
  console.log("we are ready to go");
  sentimentTimeSeries();
  //getArticle();
  //$("#getRes").click(getArticle);
  document.addEventListener("click", getArticle);
  //document.addEventListener("getRes", getArticle)
  //$("#ant").click(generateArticle("!"));
  //document.getElementById("ant").onClick() = generateArticle("!");
   
  // $("#Ant").click(generateArticle("!"));
  // $("#Hyper").click(generateArticle("@"));
  // $("#Hypo").click(generateArticle("_"));
  // $("#entail").click(generateArticle("*"));
  // $("#sim").click(generateArticle("&"));
  // $("#Mero").click(generateArticle("#m"));
  // $("#getRes").click(getStockData);

  function sentimentTimeSeries(){
    console.log("in sentimentTimeSeries()");
    let mData = {sentiment:"sentiment"};
    $.ajax({
      type: "POST",
      data: JSON.stringify(mData),
      url:'/getSentimentTimeSeries',
      processData: false,
      contentType: "application/json",
      cache: false,
      timeout: 600000,
      success: function (response) {
        console.log("we had success!");
        parseSentimentTimeSeries(response)
        //publishedAtconsole.log(response)
      },
      error:function(e){
        console.log(e);
        console.log("error occurred");
      }
});
}

  function generateArticle(pointerType){
    console.log(pointerType);
    let mData = {pointerT:pointerType};
    $.ajax({
      type: "POST",
      data: JSON.stringify(mData),
      url:'/getGeneratedArticle',
      processData: false,
      contentType: "application/json",
      cache: false,
      timeout: 600000,
      success: function (response) {
        console.log("we had success!");
        parseGeneratedArticle(response)
      },
      error:function(e){
        console.log(e);
        console.log("error occurred");
      }
});
}
  function getStockData(){  
    let ticker = $("#articleSearch").val();
    console.log("user ticker:" + ticker);
    let mData={clientPhrase:ticker};
    $.ajax({
          type: "POST",
          data: JSON.stringify(mData),
          url:'/getStockData',
          processData: false,
          contentType: "application/json",
          cache: false,
          timeout: 600000,
          success: function (response) {
            console.log("we had success!");
            parseResponse2(response, ticker)
          },
          error:function(e){
            console.log(e);
            console.log("error occurred");
          }
    });
  }

  function getArticle(){
    let phrase = $("#articleSearch").val();
    console.log("user phrase:" + phrase);
    let mData={clientPhrase:phrase};
 
    /*** request ***/
    $.ajax({
            type: "POST",
            data: JSON.stringify(mData),
            url:'/getArticle',
            processData: false,
            contentType: "application/json",
            cache: false,
            timeout: 600000,
            success: function (response) {
              console.log("we had success!");
              parseResponse(response)
            },
            error:function(e){
              console.log(e);
              console.log("error occurred");
            }
         });
  }
  function getArticle2(articleN, fileN){
    let phrase = $("#articleSearch").val();
    console.log("user phrase:" + phrase);
    let mData={clientPhrase:phrase, article:articleN, file:fileN};
 
    /*** request ***/
    $.ajax({
            type: "POST",
            data: JSON.stringify(mData),
            url:'/getArticle2',
            processData: false,
            contentType: "application/json",
            cache: false,
            timeout: 600000,
            success: function (response) {
              //reponse is a STRING
              console.log("we had success!");
              //console.log(response);
              parseArticle2(response)
            },
            error:function(e){
              console.log(e);
              console.log("error occurred");
            }
         });
  }
}
  function parseResponse2(response, ticker){
    console.log(response);
    let seriesKey = Object.keys(response)[1];
    let observationKeys = Object.keys(response[seriesKey]);
    let valueKeys = Object.keys(response[seriesKey][observationKeys[0]]);
    console.log("seriesKey: " + seriesKey);
    console.log("observationKeys: " + observationKeys)
    console.log("valueKeys: " + valueKeys)
    
    var data = new Array(observationKeys.length);
    var labels = new Array(observationKeys.length);
    console.log(typeof valueKeys[0])
    
    // for(i = 0; i < observationKeys.length; i++){
    //   data[i] = response[seriesKey][observationKeys[i]][valueKeys[0]];
    //   //labels[i] = new Date(observationKeys[i]).toISOString().split("T")[1].slice(0, -5);
    //   labels[i] = observationKeys[i];
    //   console.log(typeof response[seriesKey][observationKeys[i]][valueKeys[0]]);
    //   console.log(response[seriesKey][observationKeys[i]][valueKeys[0]]);
    // }
    for(i = 0; i < response.length; i++){
      data[i] = response[i].open;
      labels[i] = response[i].time;
    }
    data = data.reverse();
    labels = labels.reverse();
    console.log(data)
    console.log(labels)
  
    var ctx = document.getElementById("canvas").getContext('2d');
    var config = {
      type: 'line',
      data: {
         labels: labels,
         datasets: [{
            label: 'Graph Line',
            data: data,
            backgroundColor: 'rgba(0, 119, 204, 0.3)'
         }]
      },
      options: {
        maxRotation: 0
      }
    };
    var chart = new Chart(ctx, config);
  }

function parseResponse(response){
  console.log(response)

  document.getElementById("articleContainer").innerHTML = response.result1[0];
  document.getElementById("articleTitle").innerHTML = response.result1[2];
  document.getElementById("articleSourceAndDate").innerHTML = response.result1[1] + "  -  " + response.result1[3];
  document.getElementById("articleImage").src = response.result1[5];

  document.getElementById("articleContainer2").innerHTML = response.result2[0];
  document.getElementById("articleTitle2").innerHTML = response.result2[2];
  //document.getElementById("articleSourceAndDate2").innerHTML = response.result2[1] + "  -  " + response.result2[3];
  document.getElementById("articleImage2").src = response.result2[5];

  //var img = document.createElement('img');
  //img.id = "articleImage"
  //img.src = response[5];
  //document.getElementById('resultsContainer').appendChild(img);
}

function parseGeneratedArticle(response){
  console.log(response)
  document.getElementById("articleContainer2").innerHTML = response[0];
  document.getElementById("articleTitle2").innerHTML = response[2];
  //document.getElementById("articleSourceAndDate2").innerHTML = response[1] + "  -  " + response[3];
  document.getElementById("articleImage2").src = response[5];
}


function parseSentimentTimeSeries(response){
  var data = new Array(response.length);
  var labels = new Array(response.length);
  for(i = 0; i < response.length; i++){
    data[i] = response[i].titleScore;
    labels[i] = response[i].publishedAt;
  }
  data = data.reverse();
  labels = labels.reverse();
  console.log(data)
  console.log(labels)

  var ctx = document.getElementById("sentiCanvas").getContext('2d');
  var config = {
    type: 'line',
    data: {
       labels: labels,
       datasets: [{
          label: 'Graph Line',
          data: data,
          backgroundColor: 'rgba(0, 119, 204, 0.3)'
       }], lineAtIndex: '2022-11-10T04:49:33Z'
    },
    options: {
      maxRotation: 0
    }
  };
  var chart = new Chart(ctx, config);
  document.getElementById("sentiChartTitle").innerHTML = "Market Relevent Article Sentiment Around a Significant Rally on Nov 10, 8am EST";
}
