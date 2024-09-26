const _ = require('lodash');
const mongoose = require('mongoose');


class Client{
    constructor(config,options){
        this.config = config;
        this.options = options;
    }

    connect(){
        let connString = `mongodb://${this.config.host}/${this.config.db}?${this.config.options}`;
        if (_.size(this.config.user) && _.size(this.config.pass)) {
			connString = `mongodb://${this.config.user}:${this.config.pass}@${this.config.host}/${this.config.db}?${this.config.options}`;
		}
		if (_.size(this.options) == 0) {
			this.options = {}
		}
        console.log("This is connection string ",connString)
		return mongoose.createConnection(connString, this.options);
    }
}

module.exports = Client;