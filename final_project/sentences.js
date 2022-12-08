const grammar = require('grammar-graph')
const retrieveArticle = require('./retrieveArticle.js');
const scrambleText = require('./scrambleText.js');
const WordNet = require('node-wordnet');
const wordnet = new WordNet("./node_modules/wordnet-db/dict")
const fs = require('fs');
var tokenizer = require('sbd');


let retrieveArticleInstance = new retrieveArticle();   
var options = {
    "newline_boundaries" : false,
    "html_boundaries"    : false,
    "sanitize"           : false,
    "allowed_tags"       : false,
    "preserve_whitespace" : false,
    "abbreviations"      : null
}; 


retrieveArticleInstance.getSameStoredArticle().then(function (result){
    //console.log(result[0])
    var body = result[0];
    body = body.replace(/(\r\n|\n|\r)/gm, "");
    console.log(body);
    var sentences = tokenizer.sentences(body, options);
    // for(i = 0; i < sentences.length; i ++){
    //     if(sentences[i] == "" || sentences[i] == "\n"){
    //         sentences.splice(i, 1);
            
    //     }else{
    //         sentences[i] = sentences[i].split(" ")
    //         for(j = 0; j < sentences[i].length; j++){
    //             if(sentences[i][j] == ""){
    //                 sentences[i].splice(j, 1);
    //             }
    //             else if(sentences[i][j].indexOf("\n") > -1){
    //                 sentences[i][j].replace("\n", "")
    //                 //sentences[i][j].splice(sentences[i][j].indexOf("\n"), 2);
    //             }
    //         }
    //     }
    // }
    iterateWord()
        
    async function iterateWord(){
        for(i = 0; i < sentences.length; i ++){
            let scrambledWord = await scrambleTextInstance.wordSwitch(array[i]);
        }
    }
    
    console.log(sentences)
})

