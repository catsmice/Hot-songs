//var wtf = require('wtfnode');
var pg = require('pg');
var run_count = 0;

var config = {
    user: 'jimlee',
    database: 'jimlee',
    host: 'localhost',
    port: 5432,
    max: 5,
    idleTimeoutMillis: 30000
    //ssl: true
};

/*
function db_query_done(err, result) {
    //call `done()` to release the client back to the pool
    console.log("query_done");
    //client_done();

    if(err) {
      return console.log('error running query');
    }
    
    //console.log(result.rows[0].count);
    console.log(result.rows[0].youtube_title);
    //process.exitCode = 1;
    
    //console.log(process._getActiveRequests());
    //console.log(process._getActiveHandles());
    //client.end();
    
    working_client.end();
    
    //wtf.dump();
    //output: 1
}
*/

function db_connected(err, client, done) {
    if(err) {
        return console.log('error fetching client from pool'+err);
    }

    console.log("connected");
    //working_client = client;
    
    client.query('select * from song;', function (err, result) {
        done();

        console.log("query_done");
        if(err) {
            return console.log('error running query');
        }

        console.log(result.rows[0].youtube_title);
        run_count ++;

        if (run_count == 10)
            pool.end();
        //wtf.dump();
    });
}

function pool_error(err, client) {
// if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
}

var pool = new pg.Pool(config);

for (i = 0; i < 10; i ++) {
    //console.log('start new query: '+i);
    //client.connect(db_connected);
    pool.connect(db_connected);
}
pool.on('error', pool_error);
