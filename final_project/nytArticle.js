import Readability from '@mozilla/readability';
import jsdom from 'jsdom';
import axios from 'axios';

export default class nytArticle {

    constructor(){
        console.log("init");
        //make an instance of the module
        
    }

    getArticle(url){
            
            // Make the request with axios' get() function
            axios.get(url).then(function(r1) {
            
              // At this point we will have some search results from the API. Take the first search result...
              let firstResult = r1.data.articles[0];
                console.log(firstResult.url);
              // ...and download the HTML for it, again with axios
              axios.get(firstResult.url).then(function(r2) {
            
                // We now have the article HTML, but before we can use Readability to locate the article content we need jsdom to convert it into a DOM object
                let dom = new jsdom.JSDOM(r2.data, {
                  url: firstResult.url
                });
            
                // now pass the DOM document into readability to parse
                let article = new Readability.Readability(dom.window.document).parse();
            
                // Done! The article content is in the textContent property
                let articleText = article.textContent;
                //console.log(article.textContent);
                return articleText;
              })
            })

            
        }
        
      

    }

