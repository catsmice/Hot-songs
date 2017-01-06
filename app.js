var crawler = require("crawler");
var google = require('googleapis');
var util = require('util');
var url = require('url');
var http = require('http');
var express = require('express');

var crawledSong = []; 
//var matchedVideoId = [];
//var matchedVideoTitle = [];

var song = [];
var totalSong = 0;

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
    song[totalSong].video_numer = data.items.length;

    for (i = 0; i < data.items.length; i++) {
        item = data.items[i];
        
        song[totalSong].video_id[i] = item.id.videoId;
        song[totalSong].video_title[i] = item.snippet.title;
        
        console.log("[ "+i+" video ID]: " + song[totalSong].video_id[i]);
        console.log("[ "+i+" video title: " + song[totalSong].video_title[i]);
    }

    totalSong ++;
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

              //queryYoutube(false, matchedSong[i], queryYoutubeDone);
            }
        }
};

var BuildResponse = function() {
    var outputString = '';

    outputString = '<BR>';

    console.log('output:' + outputString);
}

var app = express();
app.get('/', function(req,res) {
    res.send('<form action=\"/go\" method=\"POST\"><button>Start</button></form>');

});

app.post('/go', function(req,res) {
    //res.send('<form action=\"/go\"><button>Start</button></form>');
    //res.send('hihi');
    var c = new crawler ({
        maxConnections : 1,
        callback : crawlWebDone
    });

    var youtube = google.youtube({
        version: 'v3',
        auth: 'AIzaSyCqd9zyDgj9kj_byB7jcYXyYFEnfxZJb3Q'
    });

    //c.queue('http://www.oricon.co.jp/rank/js/d/2016-12-27/');

    crawledSong = ['僕以外の誰か', '素晴らしきSekai', '不滅のインフェルノ', '二人セゾン', 'God’s S.T.A.R.', '世界に一つだけの花(シングル・ヴァージョン)', '恋', 'Winter Wonderland', '無敵*デンジャラス', 'Give Me Love'];

    for (i = 0; i < 10; i++) {
        queryYoutube(false, crawledSong[i], queryYoutubeDone);
    }
});

var youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyCqd9zyDgj9kj_byB7jcYXyYFEnfxZJb3Q'
});

/*
app.listen(3000, function(){
    console.log('HTTP running');
});
*/

var c = new crawler ({
    maxConnections : 1,
    callback : crawlWebDone
});

var youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyCqd9zyDgj9kj_byB7jcYXyYFEnfxZJb3Q'
});

//c.queue('http://www.oricon.co.jp/rank/js/d/2016-12-27/');

crawledSong = ['僕以外の誰か', '素晴らしきSekai', '不滅のインフェルノ', '二人セゾン', 'God’s S.T.A.R.', '世界に一つだけの花(シングル・ヴァージョン)', '恋', 'Winter Wonderland', '無敵*デンジャラス', 'Give Me Love'];

for (i = 0; i < 10; i++) {
    queryYoutube(false, crawledSong[i], queryYoutubeDone);
    console.log("totalSong: "+totalSong);
    if (totalSong == 10) {
        BuildResponse();
    }
}



