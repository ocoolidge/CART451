let messageCount = 0;
 
//the object to return -> could have > 1 function associated.
let sharedMessageModule = {};
 
sharedMessageModule.passMessage = function (message) {
    messageCount++;
    console.log(`Message ${messageCount}: ${message}`);
    return;
}
 
module.exports = sharedMessageModule;