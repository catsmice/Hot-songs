var crawler = require("crawler");
var google = require('googleapis');
var util = require('util');
var url = require('url');
var http = require('http');
var express = require('express');

var crawledSong = []; 
var matchedVideoId = [];
var matchedVideoTitle = [];

var song = [];
var totalSong = 0;

class Song
{
  var song_name;
  var video_id;
  var video_title;
  var video_number;

  constructor(song, id, title) {
      this.song_name = song;
      this.video_id = null;
      this.video_title = null;
      this.video_number = 0;
  }

  getSong() {
      return this.song_name;
  }

  setSong(song) {
      this.song_name = song;
  }
}

/*
var c = new Crawler({
    maxConnections : 1,
    // This will be called for each crawled page 
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default 
            //a lean implementation of core jQuery designed specifically for the server 
            
            //console.log($("h2.title").eq(0).text());
            //console.log($("h2.title").length);

            for (i = 0; i < 10; i++) {
              //console.log($("h2.title").eq(i).text());
              matchedSong[i] = $("h2.title").eq(i).text();
              console.log(matchedSong[i]);
            }
        }
        done();
    }
});
*/
 
var queryYoutubeDone = function (error, query_string, data) {
    var item;
    
    //console.log("query_string:"+query_string);
    song[totalSong] = new Song();
    song[totalSong].setSong = query_string;
    song[totalSong].video_numer = data.items.length;

    for (i = 0; i < data.items.length; i++) {
        //console.log(data.items.length);
        item = data.items[i];
        
        //matchedVideoId[i] = item.id.videoId;
        //matchedVideoTitle[i] = item.snippet.title;
        song[totalSong].video_id[i] = item.id.videoId;
        song[totalSong].video_title[i] = item.snippet.title;

        //console.log("[ "+i+" video ID]: "+item.id.videoId);
        //console.log("[ "+i+" video title: "+item.snippet.title);
        //console.log("[ "+i+" video ID]: "+matchedVideoId[i]);
        //console.log("[ "+i+" video title: "+matchedVideoTitle[i]);
        console.log("[ "+i+" video ID]: " + song[totalSong].videoId[i]);
        console.log("[ "+i+" video title: " + song[totalSong].title[i]);
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

//song[totalSong] = new Song('a', 10, 'b');
//console.log(song[totalSong].getSong());
//totalSong++;


crawledSong = ['僕以外の誰か', '素晴らしきSekai', '不滅のインフェルノ', '二人セゾン', 'God’s S.T.A.R.', '世界に一つだけの花(シングル・ヴァージョン)', '恋', 'Winter Wonderland', '無敵*デンジャラス', 'Give Me Love'];
/*
song[0] = new Song('僕以外の誰か', '', '');
song[1] = new Song('素晴らしきSekai', '', '');
song[2] = new Song('不滅のインフェルノ', '', '');
song[3] = new Song('二人セゾン', '', '');
song[4] = new Song('God’s S.T.A.R.', '', '');
song[5] = new Song('世界に一つだけの花(シングル・ヴァージョン)', '', '');
song[6] = new Song('恋', '', '');
song[7] = new Song('Winter Wonderland', '', '');
song[8] = new Song('無敵*デンジャラス', '', '');
song[9] = new Song('Give Me Love', '', '');
totalSong = 10;
*/

for (i = 0; i < 10; i++) {
    queryYoutube(false, crawledSong[i], queryYoutubeDone);
}

