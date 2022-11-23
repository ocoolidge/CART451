const fs = require('fs')
const nlp = require('compromise')
const plg = require('compromise-speech');
const { resolve } = require('path');

fs.readFile('./companyNames', "utf8", (err, csv) => {
    if (err) {
        console.log("File read failed:", err);
        return;
      }
    companies = csv.split('\n')
    funk(companies)
    funk2(companies)
})

async function funk2(companies){

    var wordsInName = 3;
    for(j = 0; j <100; j++){
        var generatedCompanyName = ""
        for(i = 0; i < wordsInName; i++){
            
            var randomCompany = Math.floor(Math.random()*companies.length)
            var randomWord = Math.floor(Math.random()*companies[randomCompany].split(" ").length)

            console.log(companies[randomCompany])
            console.log(companies[randomCompany].split(" ")[randomWord])

            var random = companies[randomCompany].split(" ")[randomWord]
            generatedCompanyName += random + " "
            
        }
        generatedCompanyName += "\n"
        console.log(generatedCompanyName)
        appendFile(generatedCompanyName, "generated2")
    }
}

async function funk(companies){
    
    var companyArray = await getSyllables(companies)

    for(k = 0; k < 50; k++){

        var name = await scrambleSyllables(companyArray)
        console.log(name)
        var splitted = name.split(" ")
        for(i = 0; i < splitted.length; i++){
            splitted[i] = splitted[i].charAt(0).toUpperCase() + splitted[i].slice(1)
        }
        name = splitted.join(" ")
        name += "\n"
        console.log(name)
        
        await appendFile(name, "generated")
    }
}

function scrambleSyllables(companyArray){
    return new Promise((resolve, reject) => {
        var syllablesInName = 3;
        var generatedCompanyName = ""
        for(i = 0; i < syllablesInName; i++){
            
            var randomCompany = Math.floor(Math.random()*companyArray.length)
            var randomWord = Math.floor(Math.random()*companyArray[randomCompany][0].length)
            var randomSyllable = Math.floor(Math.random()*companyArray[randomCompany][0][randomWord].length)

            console.log(companies[randomCompany])
            console.log(companyArray[randomCompany][0][randomWord])

            var random = companyArray[randomCompany][0][randomWord][randomSyllable]

            if(companyArray[randomCompany][0][randomWord].length < 2){
                if(i = 0){
                    generatedCompanyName += random + " "
                }else{
                    generatedCompanyName += " " + random + " "
                }
            }else{
                generatedCompanyName += random
            }
        }
        resolve(generatedCompanyName)
    })
}


function getSyllables(companies){
    return new Promise((resolve, reject) => {
        nlp.extend(plg)
        var companyArray = new Array()
        for(i = 0; i < companies.length; i++){
            companyArray[i] = new Array()
            for(j = 0; j < companies[i].split(" ").length; j++){
                companyArray[i][j] = new Array()
                companyArray[i][j] = nlp(companies[i].split(" ")[j]).terms().syllables()
                companyArray[i][j] = nlp(companies[i].split(" ")[j]).terms().syllables()
            }
        }
        resolve(companyArray)
    })
}


function appendFile(generatedCompanyName, fileName){
    return new Promise((resolve, reject) => {
        if(generatedCompanyName.charAt(0) == generatedCompanyName.charAt(0).toUpperCase()){
            fs.appendFile('./data/'+fileName+'.txt', generatedCompanyName, 'utf8', (err) => { 
                if (err) { 
                    throw err; 
                }else{
                    console.log("file appended")
                    resolve()
                }
            })
        }
    })
}

// var company1 = companies[i-1]
//         var company2 = companies[i]
//         var company2 = companies[i+1]
//         company1Syllables = nlp(companies[i-1]).terms().syllables()
//         company2Syllables = nlp(companies[i]).terms().syllables()
//         company3Syllables = nlp(companies[i+1]).terms().syllables()


        
//         var newCompany = new Array()
        
//         newCompany[0] = company1Syllables[0][0]
//         newCompany[1] = company1Syllables[1][0]
        
        
        
//         console.log(newCompany)