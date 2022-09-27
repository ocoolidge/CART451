var Imap = require('imap');

var imap = new Imap({
  user: 'ocoolidge@gmail.com', // put your mail email
  password: 'owlgd6gmyk', // put your mail password or your mail app password
  host: 'imap.gmail.com', // put your mail host
  port: 993, // your mail host port
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
})

imap.once('ready', function() { // this event will call once the imap is successfully made connection with imap host

})

imap.once('error', function(err) { // this event will call if there is any issue will come during making imap connection
  console.log(err);
});

imap.once('end', function() { // this event will call once the imap connection is closed
  console.log('Connection ended');
});

imap.connect() // this will call imap to connect to mail host using the mail credentials


function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }
  
  imap.once('ready', function() {
      openInbox(function(err, box) { // call function to select the mailbox inbox to fetch new emails from inbox 
         var f = imap.seq.fetch('1:3', {
                   bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                   struct: true
                 });
  
         f.on('message', function(msg, seqno) {
         
         })
  
         f.once('error', function(err) {
           console.log('Fetch error: ' + err);
         });
  
         f.once('end', function() {
           console.log('Done fetching all messages!');
           imap.end();
        });
      })
  })