


var url = 'https://newsapi.org/v2/top-headlines?'+ 
           'q=Apple&' +
           'from='+yesterday+'&' +
           'sortBy=popularity&' +
           'apiKey=012ff0b87fe14e4ca830e1c9ea1ee47c';

    const response = await fetch(url, {
    method: 'get',
    // body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
});
const data = await response.json();
//console.log(data);
console.log(data);
//console.log(data.articles['content'][1]);
const JSONData = JSON.stringify(data);
console.log(JSON.stringify(data.articles[1].content));

fs.writeFile('articleData.json', JSONData, err => {
    if (err) {
      throw err
    }
    console.log('JSON data is saved.')
  })