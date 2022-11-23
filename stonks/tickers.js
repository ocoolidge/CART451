const axios = require('axios');
const fs = require('fs');

// replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
// request.get("https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=G310EAU66S32MQEY")
//     .pipe(new StringStream())
//     .CSVParse()                                   // parse CSV output into row objects
//     .consume(object => console.log("Row:", object))
//     .then(() => console.log("success"));

axios.get("https://www.alphavantage.co/query?function=LISTING_STATUS&state=active&apikey=G310EAU66S32MQEY")
.then(response => {
    let rows = response.data.split('\n');
    for(i = 0; i < rows.length;i ++){
        rows[i] = rows[i].split(',')
        if(rows[i][0].indexOf("-") > -1){
          rows[i][0] = ''
        }
    }
    //console.log(rows)
    let keys = Object.keys(rows[0]);
    
    var json = JSON.stringify(rows, null, "\t");
    
    fs.writeFile('data/tickers.json', json, 'utf8', (err) => { 
        if (err) { 
          throw err; 
        }})
})
.catch(error => {
  console.log(error);
});

