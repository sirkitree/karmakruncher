/*
 * Serve JSON to our AngularJS client
 */

exports.nicks = function (req, res) {

  var fs = require('fs')
    , datafilepath = "./data.json"
    , data = require(datafilepath);

    if (data.nicks.length !== 0) {

      // Return the data from the api call.
      res.json(data);

    } else {

      // If length is 0 then we don't have valid nicks so get them from ldap.

      // todo: overwrite data.json on a regular (weekly?) basis with a new list
      // of nicks.

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
        , name = []
        , names = [];
        console.log(config.ldap.opts);
      client.bind(dn, pass, function(err) {
        if (err) { console.log(err); return; }
      });

      client.search(base, opts, function(err, res) {
        if (err) { console.log(err); return; }

        res.on('searchEntry', function(entry) {
          if (typeof entry.object.irc !== 'undefined') {
            names.push({ 
              "name" : entry.object.irc,
              // todo: get karma from mysql instead of random number
              "karma" : Math.floor(Math.random()*111)
            });
          }
        });

        res.on('end', function(result) {
          console.log(names);
          karmaSave(names, datafilepath);
        });

      });
      
    }

  karmaSave = function(data, filepath) {

    // Write the data to file for quicker retrieval.
    fs.writeFile(filepath, JSON.stringify({"nicks": data}, null, 4), function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("The file was saved!");
      }
    });

    // Return the data from the api call.
    res.json({
      "nicks": data
    });
  };

};
