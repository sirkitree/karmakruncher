/*
 * Serve JSON to our AngularJS client
 */
var datafilepath = "./data.json";

exports.nicks = function (req, res) {

    var data = require(datafilepath);

    if (data.nicks.length !== 0) {
      // Return the data from the api call.
      res.json(data);

    } else {
      // If length is 0 then we don't have valid nicks so get them from ldap.
      ldapLoad(req, res);
    }

};

exports.ldapLoad = function (request, result) {

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
    , names = []
    , data = [];
    
  client.bind(dn, pass, function(err) {
    if (err) { console.log(err); return; }
  });

  client.search(base, opts, function(err, res) {
    if (err) { console.log(err); return; }

    res.on('searchEntry', function(entry) {
      if (typeof entry.object.irc !== 'undefined') {
        names.push({ 
          "name" : entry.object.irc
        });
      }
    });

    // Save to file for quick retrieval next call.
    res.on('end', function(res) {
      karmaSave(names, datafilepath);

      // Return the data from the api call.
      result.json({
        "nicks": names
      });
    });
    
  });

};

function karmaSave (data, filepath) {
  var fs = require('fs');

  // Write the data to file for quick retrieval.
  fs.writeFile(filepath, JSON.stringify({"nicks": data}, null, 4), function(err) {
    if (err) { console.log(err); return; } 
    console.log("The file was saved!");  
  });

};