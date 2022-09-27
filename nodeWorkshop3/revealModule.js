module.exports = function() {
    //private member
      let messageCount = 0;
      let messages = [];
     
      function passMessage (message) {
        //used internally ...
         messageCount++;
         messages.push(message);
         console.log(`Message Count: ${messageCount}`);
     
      }
     
      function printMessages () {
        for(let i =0; i< messages.length; i++){
           console.log(`message num: ${i} , the message: ${messages[i]}`);
        }
     
      }
     
      // public members
      return {
           addMessage: passMessage,
          accessMessages: printMessages,
       };
     
    }