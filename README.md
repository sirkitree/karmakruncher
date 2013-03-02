## KarmaKruncher
_Displays karma in a pie chart and list._

![](https://api.monosnap.com/image/download?id=zPuNpf9MBg192odT6k5mvL0sY)

### Installation
	~$ git checkout
	~$ npm install
	~$ cp routes/data.json.template routes/data.json
	~$ cp routes/config.json.template routes/config.json

Open the config.json file and fill out the LDAP details.
	
	~$ node app.js

### Technicals
1. Read nick and karma data from data.json
1. If the file has no nicks it will attempt to connect to your ldap server to retrieve them
1. Currently randomizes karma.

### Plans
1. Gather a list of IRC bots, grab and add up the Karma values for the nicks given.
