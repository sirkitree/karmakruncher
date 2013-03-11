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
1. Grabs a list of nicks from ldap.
1. Gathers a list of IRC bots we're running out of php.
1. Grabs and adds up all of the Karma values for the nicks given.
1. Writes/reads nick and karma data from data.json on page load.

### Plans
1. Periodically update the data.json file, perhaps nightly.
