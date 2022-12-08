const fs = require('fs')
var allFiles = new Array()

fs.readdir("data/stock_market_data/", (err, files) => {
    
    for(i = 1; i < files.length; i++){
        console.log(files[i])
        fs.readdir("data/stock_market_data/"+files[i]+"/json/", (err, files2) => {
            for(j = 0; j < files2.length; j++){
                
                for(k = 0; k < allFiles.length; k++){
                    if(allFiles[k] == files2[j]){
                        var dupe = true;
                    }
                }
                if(!dupe){
                    
                    allFiles.push(files2[j])
                    
                }else{
                    dupe = false
                }if(i == files.length && j==files2.length-1){
                    console.log(allFiles)
                    
                }
            }
        })
    }
})