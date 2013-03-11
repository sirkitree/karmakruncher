/*
 * Serve JSON to our AngularJS client
 */

exports.nicks = function (req, res) {
  var data = require('./data.json');
  if (data.nicks.length !== 0) {
    // Return the data from the api call.
    res.json(data);
  } else {
    // If length is 0 then we don't have valid nicks so get them from ldap.
    ldapLoad(req, res);
  }
};

exports.ldapLoad = function (req, res) {
  ldapLoad(req, res);
};

exports.mysqlLoad = function (req, res) {
  mysqlLoad(req, res);
};

function ldapLoad (request, result) {

  // Connect to LDAP to retrieve all IRC nicks
  var config = require("./config.json")
    , ldap = require('ldapjs')
    , client = ldap.createClient({
        url: config.ldap.url
      })
    , dn = config.ldap.dn
    , pass = config.ldap.pass
    , base = config.ldap.base
    , opts = config.ldap.opts
    , nicks = [];
    
  client.bind(dn, pass, function(err) {
    if (err) { console.log(err); return; }
  });

  client.search(base, opts, function(err, res) {
    if (err) { console.log(err); return; }

    res.on('searchEntry', function(entry) {
      if (typeof entry.object.irc !== 'undefined') {
        nicks.push({ 
          "name" : entry.object.irc
        });
      }
    });

    // Save to file for quick retrieval next call.
    res.on('end', function(res) {
      // Return the data from the api call.
      mysqlLoad(nicks, result);
    });

  });
};

function mysqlLoad (nicks, result) {
  var walk = require('walk')
    , fs = require('fs')
    , dirwalk = walk.walk('/var/www')
    , runner = require('child_process')
    , mysql = require('mysql')
    , names = [];

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
          if (fileStats.name == 'settings.php') {
            var command = 'php -r \'include("' + root + '/' + fileStats.name + '"); print json_encode($databases);\'';
            runner.exec(
              command, 
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
                    addEmUp(rows, nicks);
                  }

                });
                connection.end();

                next();
              }
            );
          } 
        
        });
      }
    };

    next();
  });

  // Return nicks to our result.
  dirwalk.on('end', function() {
    result.send("Updated nicks from ldap: " + names.join(', ') + "\n <a href='/'>return</a>");
  });
};

function addEmUp(rows, nicks) {
  // Iterate over the rows returned from mysql.
  for (var i = rows.length - 1; i >= 0; i--) {
    // Iterate over our nicks.
    for (var j = nicks.length - 1; j >= 0; j--) {
      // If the current term is in our nicks (which is should be cuz that's 
        // what we started with) add up the karma points.
      if (rows[i].term === nicks[j].name) {
        // update the karma
        nicks[j].karma += parseInt(rows[i].karma);
      }
    };
  };

  karmaSave(nicks, './routes/data.json');
};

function karmaSave (data, filepath) {
  var fs = require('fs');

  // Write the data to file for quick retrieval.
  fs.writeFile(filepath, JSON.stringify({"nicks": data}, null, 4), function(err) {
    if (err) { console.log(err); return; } 
    console.log("The file was saved!");  
  });

};