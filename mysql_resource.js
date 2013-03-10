var walk = require('walk')
  , fs = require('fs')
  , dirwalk = walk.walk('/var/www')
  , runner = require('child_process')
  , mysql = require('mysql')
  , nicks = require('./routes/data.json').nicks
  , names = []
  , total = {}
  , bots = []
  , lullabots = [];

for (var i = nicks.length - 1; i >= 0; i--) {
  // Reset all Karma to 0 so we're only getting new values.
  nicks[i].karma = 0;

  // Used in our query creation.
  names.push(nicks[i].name);
}

// Create our query from our currenty list of nicks.
var query = 'select * from bot_karma where term in("' + names.join('","') + '")';

// Go through each directory in /var/www.
dirwalk.on('directories', function (root, dirStatsArray, next) {

  for (var i = dirStatsArray.length - 1; i >= 0; i--) {
    if (dirStatsArray[i].type === 'directory') {

      // GO through each settings.php file in these directories.
      filewalk = walk.walk(root + '/' + dirStatsArray[i].name);
      filewalk.on('file', function (root, fileStats, next) {

        // Execute php on the host machine to turn the database array
        // into a json object which we can work with.
        runner.exec(
          'php -r \'include("' + root + '/' + fileStats.name + '"); print json_encode($databases);\'', 
          function (err, stdout, stderr) {

            // Parse stdout into JSON.
            var connectTo = JSON.parse(stdout).default.default
              // Use our parsed variables to establish a connection to mysql.
              , connection = mysql.createConnection({
                host: connectTo.host,
                user: connectTo.username,
                password: connectTo.password,
                database: connectTo.database
              });

            connection.connect();

            // Run our previously crafted query.
            connection.query(query, function (err, rows, fields) {
              if (err) {
                console.log(err);
              } else {
                // Add the newly retrieved karma to an array
                addEmUp(rows);
              }

            });
            connection.end();

            next();
          }
        );
      
      });
    }
  };

  next();
});

function addEmUp(rows) {
  // console.log(bot);
  for (var i = rows.length - 1; i >= 0; i--) {
    console.log(rows[i]);
    for (var j = nicks.length - 1; j >= 0; j--) {
      if (rows[i].term === nicks[j].name) {
        // update the karma
        nicks[j].karma += parseInt(rows[i].karma);
      }
    };
  };
  
  // Save our nicks array to data.json.
  fs.writeFile('./routes/data.json', JSON.stringify({"nicks": nicks}, null, 4), function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
  });
}