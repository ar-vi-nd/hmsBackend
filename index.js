const _ = require('lodash');
const path = require('path');
const env = process.env.NODE_ENV||'development';
const config = require(`./config/env/${env}.config.json`);
const utilities = require("./src/utilities");

utilities.Registry.set("config", config);
utilities.Registry.set("env", env);

const schemaList = require("./src/models")
// console.log(schemaList)
utilities.Registry.set("schemas", schemaList);
// console.log(utilities)

// console.log(utilities?.Client?.MongoDB?.Client)

let mongoConn = new (utilities?.Client?.MongoDB?.Client)(config.mongo_instances.primary_1,{}).connect()

// console.log(mongoConn)


let models ={}
// here the first parameter is value and the second one is the key
_.each(schemaList, (value,key)=>{
    // console.log("this is the key",key)
    // console.log("this is the value",value)

    models[key] = mongoConn.model(key,value.schema.schema)

})
// console.log("These are models: ",models)
utilities.Registry.set("models", models);


const Koa = require('koa')
const app = new Koa()
const { koaBody } = require('koa-body');
require('koa-qs')(app, 'extended');
app.use(koaBody());

app.use(async (ctx, next) => {
	try {
		ctx.set('Access-Control-Allow-Origin', '*');
		ctx.set('Access-Control-Allow-Methods', '*');
		ctx.set('Access-Control-Allow-Headers', '*');
		await next();
		console.log("printing something")
	} catch (error) {
		console.log('Process.Error', error);
		ctx.status = error.status || 500;
		ctx.body = {
			success: false,
			message: 'Internal Server error, dev team has been notified. Please try again after sometime!!'
		};
		ctx.app.emit('error', error);
	}
});

// route middleware and initialization
const routesList = require('./src/routes');
_.each(routesList, (router, key) => {
	app.use(router.routes());
	app.use(router.allowedMethods());
});

let server = app.listen(config.application.port, () => {
	console.log(`[Started] Application started listening on port ${config.application.port} mode`);
});

module.exports = server;
