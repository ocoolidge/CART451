const WordNet = require('node-wordnet')
const natural = require('natural')
const Sentiment = require('sentiment')
const CoreNLP = require('corenlp')
const Properties = require('corenlp').Properties
const Pipeline = require('corenlp').Pipeline

class generateLanguage {

    constructor(){
        console.log("init generateLanguage.js")
        this.wordnet = new WordNet("./node_modules/wordnet-db/dict")}

	coreNLP(input){
		const props = new Properties({
			annotators: 'tokenize,ssplit,pos,lemma,ner,parse'})
		const pipeline = new Pipeline(props, 'English')
		input = input.split(" ").slice(0, 100).join(" ")
		const sent = new CoreNLP.default.simple.Sentence(input)
		pipeline.annotate(sent).then(sent => {
			console.log('parse', sent.parse())
			var tree = JSON.parse(CoreNLP.default.util.Tree.fromSentence(sent).dump())
			console.log(tree)
			traverseTree(tree)
			console.log(input)
		}).catch(err => {console.log('err', err)})
		function traverseTree(tree){
			console.log(tree.pos + " " + tree.word)
			if(typeof tree.children !== 'undefined' && tree.children.length > 0){
				for(let i = 0; i < tree.children.length; i++){traverseTree(tree.children[i])}}}}

	generateNet(input){
		return new Promise((resolve, reject) => {
			input = input.split("/n").join(" ")
			let tokens = input.split(" ").slice(0, 50)
			let original = tokens.join(" ")
			let synsets = new Array()
			let pointers = new Array()
			let links = new Array()
			iterateLinks()
			async function iterateLinks(){
				for(let i = 0; i < tokens.length; i++){
					synsets[i] = await getSynsets(tokens[i])
					let originalPos = "n/a"
					if(synsets[i][0]){
						originalPos = synsets[i][0].pos
					}if(synsets[i]){
						pointers[i] = await getPointers(synsets[i])
					}if(pointers[i]){
						links[i] = await getLinks(pointers[i], tokens[i], originalPos)
					}
				}
				var output1 = await buildArticle(tokens, synsets, pointers, links)
				
				// for(let i = 0; i < synsets.length; i++){
				// 	console.log(synsets[i])
				// }
				
				var output2 = await buildArticle2(JSON.parse(JSON.stringify(tokens)), JSON.parse(JSON.stringify(synsets)))
				console.log(output1)
				console.log(output2)
				console.log(original)
				
				resolve (output1)}})}}

function buildArticle2(tokens, synsets){
	return new Promise((resolve, reject) => {
		var sentiment = new Sentiment()
		var newTokens = JSON.parse(JSON.stringify(tokens))
		for(let i = 0; i < tokens.length; i++){
			var originalSent = sentiment.analyze(tokens[i])
			for(let j = 0; j < synsets[i].length; j++){
				//console.log(synsets[i][j])
				var sentResults = new Array()
				for(let k = 0; k < synsets[i][j].synonyms.length; k++){
					sentResults[k] = sentiment.analyze(synsets[i][j].synonyms[k]).score
					if(Math.abs(sentResults[k]) > Math.abs(sentiment.analyze(newTokens[i]).score)){
						newTokens[i] = synsets[i][j].synonyms[k]
						console.log(synsets[i][j].synonyms)
						console.log(tokens[i] + " " + originalSent.score + " --> " + sentResults[k] + " " + newTokens[i])}}}}
		resolve(newTokens.join(" "))})}

function buildArticle(tokens, synsets, pointers, links){
	return new Promise((resolve, reject) => {
		let final = tokens
		let changeCount = 0
		for(let i = 0; i < tokens.length; i++){
			for(let j = 0; j < links[i].length; j++){
				if(links[i][j]){
					console.log(links[i][j])
					if(/*links[i][j][1] == links[i][j][3] && */links[i][j][1] == links[i][j][3] && include(links[i][j][0]) && acceptedPointeType(links[i][j][2]) && links[i][j][4] != 'Gregorian_calendar' && links[i][j][4] != 'Hebrew_alphabet' && links[i][j][4] != 'weekday' && !(links[i][j][2] == '@' && links[i][j][4].indexOf("_") > -1)){
						console.log(links[i][j][0] + " --> " + links[i][j][4])
						if(links[i][j][4].indexOf("_") > -1){
							final[i] = links[i][j][4].split("_").join(" ")
						}else{
							final[i] = links[i][j][4]
						}
						changeCount++
						break}}}}
		console.log(changeCount)
		final = final.join(" ")
		resolve(final)})}

function getSynsets(word){
	let wordnet = new WordNet("./node_modules/wordnet-db/dict")
	return new Promise((resolve, reject) => {
		wordnet.lookup(word, function(result) {
			if(result){
				resolve(result)
			}else{
				resolve("no synsets")}})})}

function getPointers(synsets){
	return new Promise((resolve, reject) => {
		let pointers = new Array()
		//console.log(synsets)
		for(let i = 0; i < synsets.length; i++){
			for(let j = 0; j < synsets[i].ptrs.length; j++){
				//console.log(synsets[i].ptrs[j])
				pointers.push(synsets[i].ptrs[j])}}
		resolve(pointers)})}

function getLinks(pointers, original, originalPos){
	let wordnet = new WordNet("./node_modules/wordnet-db/dict")
	return new Promise((resolve, reject) => {
		let links = new Array()
		for(let i = 0; i < pointers.length; i++){
			wordnet.get(pointers[i].synsetOffset, pointers[i].pos, function(result){
				if(result){
					//console.log(pointers[i][j])
					//links[i][j] = [pointers[i][j].pointerSymbol, result.lemma]
					links.push([original, originalPos, pointers[i].pointerSymbol, pointers[i].pos, result.lemma])}})}
		resolve(links)})}

function acceptedPointeType(symbol){
	if(symbol == '!'){
		return true
	}if(symbol == '@'){
		return true
	}if(symbol == ''){
		return true
	}if(symbol == '*'){
		return true
	}if(symbol == '&'){
		return true
	}if(symbol == '#m'){
		return true
	}if(symbol == '#s'){
		return true
	}if(symbol == '#p'){
		return true
	}if(symbol == '%m'){
		return true
	}if(symbol == '%s'){
		return true
	}if(symbol == '%p'){
		return true
	}if(symbol == '%'){
		return true
	}if(symbol == '#'){
		return true
	}if(symbol == '>'){
		return true
	}if(symbol == '<'){
		return true
	}else{
		return false}}

function include(word){
	if(word=="a"||word=="the"||word=="is"||word=="and"||word=="if"||word=="in"||word=="as"||(/\d/.test(word))){
		return false
	}else{
		return true}}

function getPointerType(symbol){
	if(symbol == '!'){
		return "Antonym"
	}if(symbol == '@'){
		return "Hypernym"
	}if(symbol == ''){
		return "Hyponym"
	}if(symbol == '*'){
		return "Entailment"
	}if(symbol == '&'){
		return "Similar"
	}if(symbol == '#m'){
		return "Member meronym"
	}if(symbol == '#s'){
		return "Substance meronym"
	}if(symbol == '#p'){
		return "Part meronym"
	}if(symbol == '%m'){
		return "Member holonym"
	}if(symbol == '%s'){
		return "Substance holonym"
	}if(symbol == '%p'){
		return "Part holonym"
	}if(symbol == '%'){
		return "All meronyms"
	}if(symbol == '#'){
		return "All holonyms"
	}if(symbol == '>'){
		return "Cause"
	}if(symbol == '<'){
		return "Participle of verb"
	}if(symbol == '^'){
		return "Also see"}}

module.exports = generateLanguage