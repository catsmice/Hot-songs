var crawler = require("crawler");
var google = require('googleapis');
var util = require('util');
var url = require('url');
var http = require('http');
var express = require('express');
var dateFormat = require('dateformat');

var crawledSong = []; 
//var matchedVideoId = [];
//var matchedVideoTitle = [];

var song = [];
var totalSong = 0;
var youtube;
var webOutput;

class Song
{
  constructor(song, id, title) {
      this.song_name = song;
      this.video_id = [];
      this.video_title = [];
      this.video_number = 0;
  }

  getSong() {
      return this.song_name;
  }

  setSong(song) {
      this.song_name = song;
  }
};
 
var queryYoutubeDone = function (error, query_string, data) {
    var item;
    
    song[totalSong] = new Song(query_string, '', '');
    song[totalSong].setSong = query_string;
    song[totalSong].video_number = data.items.length;

    for (i = 0; i < data.items.length; i++) {
        item = data.items[i];
        
        song[totalSong].video_id[i] = item.id.videoId;
        song[totalSong].video_title[i] = item.snippet.title;
        
        //console.log("[ "+i+" video ID]: " + song[totalSong].video_id[i]);
        //console.log("[ "+i+" video title: " + song[totalSong].video_title[i]);
    }

    totalSong ++;

    if (totalSong == 10) {
        BuildResponse();
    }
    //console.log("-- Query Youtube done");
};

var queryYoutube = function (error, query_string, callback)
{
    //console.log("-- Query Youtube start");
    youtube.search.list ( {
    part: 'id,snippet',
    //q: 'Node.js on Google Cloud'
    order: 'viewCount',
    q: query_string
    }, function (err, data) {
        if (err) {
            console.error('Error: ' + err);
        }
        if (data) {
            console.log("[query_string] "+query_string);
            callback(false, query_string, data)
            //console.log(util.inspect(data, false, null));
        }
        //process.exit();
    });

    //callback();
};

var crawlWebDone = function (error, res, done) {
    if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            // $ is Cheerio by default 
            //a lean implementation of core jQuery designed specifically for the server 
            
            //console.log($("h2.title").eq(0).text());
            //console.log($("h2.title").length);
            for (i = 0; i < 10; i++) {
              //console.log($("h2.title").eq(i).text());
              crawledSong[i] = $("h2.title").eq(i).text();
              //console.log(matchedSong[i]);

              queryYoutube(false, crawledSong[i], queryYoutubeDone);
            }
        }
};

var BuildResponse = function() {
    var outputString = "";

    for (i = 0; i < totalSong; i++) {
        outputString += song[i].song_name + "<br>\n";

        outputString += "<table border=1>\n";
        for (ii = 0; ii < song[i].video_number; ii ++) {
            outputString += "<tr>\n";
            outputString += "<td>" + song[i].video_title[ii] + "</td>\n";
            outputString += "<td><a href=\"https://www.youtube.com/watch?v=" + song[i].video_id[ii] + "\" target=\"_blank\">" + "Youtube link" + "</a></td>\n";
            outputString += "</tr>\n";
        }
        outputString += "</table></br>\n";
    }

    //console.log('output:' + outputString);
    webOutput.send(outputString);
}

var app = express();

app.get('/', function(req,res) {
    res.send('<form action=\"/go\" method=\"POST\"><button>Start</button></form>');

});

app.get('/go', function(req,res) {
    totalSong ++;
    console.log("totalSong:"+totalSong+" session:"+req.sessionID);
    res.sendStatus(200);
});

app.post('/go', function(req,res) {
    //res.send('<form action=\"/go\"><button>Start</button></form>');
    //res.send('hihi');

    webOutput = res;

    var c = new crawler ({
        maxConnections : 1,
        callback : crawlWebDone
    });

    var youtube = google.youtube({
        version: 'v3',
        auth: 'AIzaSyCqd9zyDgj9kj_byB7jcYXyYFEnfxZJb3Q'
    });


    var today = new Date();
    var fourdaysago = new Date();
    fourdaysago.setDate(today.getDate()-4);

    var day = dateFormat(fourdaysago,"yyyy-mm-dd");
    console.log("http://www.oricon.co.jp/rank/js/d/"+day+"/");
    c.queue("http://www.oricon.co.jp/rank/js/d/"+day+"/");
 


    //c.queue('http://www.oricon.co.jp/rank/js/d/2017-01-03/');

    //http://www.oricon.co.jp/rank/js/d/2017-01-03/
    //http://www.oricon.co.jp/rank/js/d/2016-12-27/
    /*
    crawledSong = ['僕以外の誰か', '素晴らしきSekai', '不滅のインフェルノ', '二人セゾン', 'God’s S.T.A.R.', '世界に一つだけの花(シングル・ヴァージョン)', '恋', 'Winter Wonderland', '無敵*デンジャラス', 'Give Me Love'];

    for (i = 0; i < 10; i++) {
        queryYoutube(false, crawledSong[i], queryYoutubeDone);
    }
    */
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'hotsongtoken') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  //if (data.object == 'page') {
      console.log("webhook post");
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  //}
});
  
function receivedMessage(event) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("Message data: ", event.message);
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAT4KAIKi24BABXn46xVxnespzb7N1kfh7ZCBIRcnX03XAyH4ZC2NQ0NhPSHSOPErvNmcsvIiVkfceWM9DvdZA7ZBs8GPIbrXp4EQHMq6zATOvB3GXhVRrDTUeEvykqjKXa0rjChZCRlhNZBZB2FGdCmf37zypojvZCtSBOpzQ3A7gZDZD'},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}
/*
var youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyCqd9zyDgj9kj_byB7jcYXyYFEnfxZJb3Q'
});
*/

var c = new crawler ({
    maxConnections : 1,
    callback : crawlWebDone
});

youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyCqd9zyDgj9kj_byB7jcYXyYFEnfxZJb3Q'
});


app.listen(3000, function(){
    console.log('HTTP running');
});

//c.queue('http://www.oricon.co.jp/rank/js/d/2016-12-27/');
/*
crawledSong = ['僕以外の誰か', '素晴らしきSekai', '不滅のインフェルノ', '二人セゾン', 'God’s S.T.A.R.', '世界に一つだけの花(シングル・ヴァージョン)', '恋', 'Winter Wonderland', '無敵*デンジャラス', 'Give Me Love'];

for (i = 0; i < 10; i++) {
    queryYoutube(false, crawledSong[i], queryYoutubeDone);
}
*/


