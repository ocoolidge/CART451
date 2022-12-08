//import WordNet from 'node-wordnet';
const WordNet = require('node-wordnet')
const natural = require('natural')
const { exit } = require('process')
const { link } = require('fs')
let output = ""
var lookupData = []
var getData = []
var pointerTypes = ["!", "@", "", "*", "&", "#m"]

class scrambleText {constructor(){console.log("init scrambleText.js")
        this.wordnet = new WordNet("./node_modules/wordnet-db/dict")}
    wordSwitch(input, pointerType){
        if(pointerType == null){
            pointerType = '!'}
        const wordnet = new WordNet("./node_modules/wordnet-db/dict")
        return new Promise((resolve, reject) => {
            if(input != undefined){
				if(input == 'stock' || input == 'stocks'){
					resolve(input)
				}else{wordnet.lookup(input, function(result) {
						if(result.length > 0 && result[0].ptrs[0] != null && result[0].ptrs != undefined && input != 'a'){
							var counter = 0
							var index = 0
							for (const element of result[0].ptrs) {								
								if(element.pointerSymbol == pointerTypes[Math.floor(Math.Random * pointerTypes.length)]){
									var index = counter
									break
								}counter++}
							let pointer = result[0].ptrs[index]
							wordnet.get(pointer.synsetOffset, pointer.pos, function(result2){
								output = result2.lemma
								//console.log(input + " --> " + output);
								resolve(output)})
						}else{resolve(input)}})}
			}else{resolve("undefined")} })}

    recursiveLookup3(input){
        return new Promise((resolve, reject) => {
            while(output.length < input.length){
                console.log(i)
                wordnet.lookup(input[i], function(result) {
                    console.log(result)
                    if(result.length > 0 && result[0].ptrs[0] != null && typeof result[0].ptrs[0] != undefined){
                        lookupData[i] = result
                        console.log(result[0].ptrs[0])
                        wordnet.get(result[0].ptrs[0].synsetOffset, result[0].ptrs[0].pos, function(result){
                            getData[i] = result
                            output[i] = result.lemma
                            if(output.length < input.length){i++
                            }else{
                                console.log(input)
                                console.log(output)
                                resolve(output)}})
                    }else{
                        output[i] = input[i]
                        if(output.length < input.length){i++
                        }else{
                            console.log(input)
                            console.log(output)
                            resolve(output)}}})}})}

    recursiveLookup2(input){
        console.log(i)
        var self = this
        wordnet.lookup(input[i], function(result) {
            console.log(result)
            if(result.length > 0 && result[0].ptrs[0] != null && typeof result[0].ptrs[0] != undefined){
                lookupData[i] = result}})
        console.log("after lookup")
        if(lookupData[i].length > 0 && lookupData[i].ptrs[0] != null && typeof lookupData[i].ptrs[0] != undefined){
            wordnet.get(lookupData[i].ptrs[0].synsetOffset, lookupData[i].ptrs[0].pos, function(result){
                getData[i] = result
                output[i] = result.lemma})
				if(i >= input.length - 1){
					return(output)
				}else{i++; this.recursiveLookup2(input)}
				}else{output[i] = input[i]
				if(i >= input.length - 1){
					return(output)
				}else{i++; this.recursiveLookup2(input)}}}

    recursiveLookup(input){
        return new Promise((resolve, reject) => {
            if(i >= input.length - 1){
                return output}
            var self = this
            console.log("recurse: " + i)
            wordnet.lookup(input[i], function(results) {
                if(results.length > 0 && results[0].ptrs[0] != null && typeof results[0].ptrs[0] != undefined){
                    wordnet.get(results[0].ptrs[0].synsetOffset, results[0].ptrs[0].pos, function(getResult){
                    console.log("|||" + getResult.lemma)
                    output[i] = getResult.lemma
                    i++
                    if(i < input.length){self.recursiveLookup(input)
                    }else{
                        console.log("Recursion Termination: results.length > 0, i < input.length")
                        console.log(input + " --> " + output)
                        resolve(output)
                    }})}else{
                    output[i] = input[i]
                    console.log(input[i])
                    i++
                    if(i < input.length){self.recursiveLookup(input)
                    }else{
                        console.log("Recursion Termination: results.length <= 0, i < input.length")
                        console.log(input)
                        console.log(output)
                        resolve(output)}}})})}}

function getPointerType(symbol){
	if(symbol == '!'){return "Antonym"
	}if(symbol == '@'){return "Hypernym"
	}if(symbol == ''){return "Hyponym"
	}if(symbol == '*'){return "Entailment"
	}if(symbol == '&'){return "Similar"
	}if(symbol == '#m'){return "Member meronym"
	}if(symbol == '#s'){return "Substance meronym"
	}if(symbol == '#p'){return "Part meronym"
	}if(symbol == '%m'){return "Member holonym"
	}if(symbol == '%s'){return "Substance holonym"
	}if(symbol == '%p'){return "Part holonym"
	}if(symbol == '%'){return "All meronyms"
	}if(symbol == '#'){return "All holonyms"
	}if(symbol == '>'){return "Cause"
	}if(symbol == '<'){return "Participle of verb"
	}if(symbol == '^'){return "Also see"}}

module.exports = scrambleText;