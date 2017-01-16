var pg = require('pg');
var crawler = require("crawler");
var google = require('googleapis');
var util = require('util');
var url = require('url');
var http = require('http');
var dateFormat = require('dateformat');

var run_count = 0;
var youtube;
var pool;

var config = {
    user: 'jimlee',
    database: 'jimlee',
    host: 'localhost',
    port: 5432,
    max: 5,
    idleTimeoutMillis: 30000
    //ssl: true
};

function pool_error(err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
}

function startCrawler() {
    var c = new crawler({
        maxConnections : 1,
        callback : crawlWebDone
    });

    youtube = google.youtube({
        version: 'v3',
        auth: 'AIzaSyCqd9zyDgj9kj_byB7jcYXyYFEnfxZJb3Q'
    });

    var today = new Date();
    var fourdaysago = new Date();
    fourdaysago.setDate(today.getDate()-4);

    var day = dateFormat(fourdaysago,"yyyy-mm-dd");
    console.log("Crawler URL: http://www.oricon.co.jp/rank/js/d/"+day+"/");
    c.queue("http://www.oricon.co.jp/rank/js/d/"+day+"/");
};

function crawlWebDone(error, res, done) {    
    if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            var crawledSong = [];

            for (i = 0; i < 10; i++) {
              //console.log($("h2.title").eq(i).text());
              crawledSong[i] = $("h2.title").eq(i).text();
              queryYoutube(false, crawledSong[i], queryYoutubeDone);
              //run_count ++;
            }
        }
};

function queryYoutube(error, query_string, callback) {
    //console.log("-- Query Youtube start");
    youtube.search.list( {
        part: 'id,snippet',
        //q: 'Node.js on Google Cloud'
        order: 'viewCount',
        q: query_string
    }, function(err, data) {
        if (err) {
            console.error('Error: ' + err);
        }
        if (data) {
            //console.log("[query_string] "+query_string);
            callback(false, query_string, data)
            //console.log(util.inspect(data, false, null));
        }
    });
};

function queryYoutubeDone(error, query_string, data) {
    var item;
    var song_name = query_string;
    
    item = data.items[0];
    var song_video_id = item.id.videoId;
    var song_video_title = item.snippet.title;

    console.log("(queryDone) song_name: " + song_name);
    console.log("(queryDone) video_id: " + song_video_id);
    console.log("(queryDone) video_title: " + song_video_title); 

    pool.connect(function(err, client, done) {
        if(err) {
            return console.log('error fetching client from pool'+err);
        }

        //console.log("connected");
        
        client.query('select * from song;', function (err, result) {
            done();

            //console.log("query_done");
            if(err) {
                return console.log('error running query');
            }

            //console.log(result.rows[0].youtube_title);
            run_count ++;
        });
    });
    
    console.log('data insert count: '+run_count);

    // temporily solution for worker
    if (run_count == 9) {
        pool.end();
        run_count = 0;
    }

    //if (totalSong == 1) {
    //    BuildResponse();
    //}
    //console.log("-- Query Youtube done");
};

function BuildResponse() {
    var outputString = "";

    /*
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
    */

    /*
    outputString = "https://www.youtube.com/watch?v=" + song[0].video_id[0];
    console.log('output:' + outputString);
    //webOutput.send(outputString);
    sendMessage(messengerSenderId, {text: outputString});
    messengerOutput.sendStatus(200);
    */
};

var pool = new pg.Pool(config);
pool.on('error', pool_error);

startCrawler();
