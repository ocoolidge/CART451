var POP3Client = require("mailpop3");
var client = new POP3Client('995', 'pop.gmail.com', {
 
        tlserrs: false,
        enabletls: true,
        debug: false
 
    });

    client.on("error", function(err) {
 
        if (err.errno === 111) console.log("Unable to connect to server");
        else console.log("Server error occurred");
 
        console.log(err);
 
});
 
client.on("connect", function() {
 
        console.log("CONNECT success");
        client.login(username, password);
 
});
 
client.on("invalid-state", function(cmd) {
        console.log("Invalid state. You tried calling " + cmd);
});
 
client.on("locked", function(cmd) {
        console.log("Current command has not finished yet. You tried calling " + cmd);
});


client.on("connect", function() {
 
    console.log("CONNECT success");
    client.login(username, password);

});


client.on("login", function(status, rawdata) {
 
    if (status) {
 
        console.log("LOGIN/PASS success");
        client.list();
 
    } else {
 
        console.log("LOGIN/PASS failed");
        client.quit();
 
    }
});
 
// Data is a 1-based index of messages, if there are any messages
client.on("list", function(status, msgcount, msgnumber, data, rawdata) {
 
    if (status === false) {
 
        console.log("LIST failed");
        client.quit();
 
    } else {
 
        console.log("LIST success with " + msgcount + " element(s)");
 
        if (msgcount > 0)
            client.retr(1);
        else
            client.quit();
 
    }
});
 
client.on("retr", function(status, msgnumber, data, rawdata) {
 
    if (status === true) {
 
        console.log("RETR success for msgnumber " + msgnumber);
        client.dele(msgnumber);
        client.quit();
 
    } else {
 
        console.log("RETR failed for msgnumber " + msgnumber);
        client.quit();
 
    }
});
 
client.on("dele", function(status, msgnumber, data, rawdata) {
 
    if (status === true) {
 
        console.log("DELE success for msgnumber " + msgnumber);
        client.quit();
 
    } else {
 
        console.log("DELE failed for msgnumber " + msgnumber);
        client.quit();
 
    }
});
 
client.on("quit", function(status, rawdata) {
 
    if (status === true) console.log("QUIT success");
    else console.log("QUIT failed");
 
});