const _ = require('lodash');
const path = require('path');
const env = process.env.NODE_ENV||'development';
const config = require(`./config/env/${env}.config.json`);
const utilities = require("./src/utilities");
const { v4: uuidv4 } = require('uuid')

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
const koaBody = require('koa-body').default;
require('koa-qs')(app, 'extended');
app.use(koaBody({
	multipart: true,  // Enables multipart/form-data
	formidable: {
	  uploadDir: './src/uploads',  // Directory where uploaded files will be saved
	  keepExtensions: true,    // Keep file extensions
	  filename: (name, ext, part) => {
		// Create a unique filename using UUID and original extension
		const uniqueName = `${uuidv4()}${ext}`; // e.g., "123e4567-e89b-12d3-a456-426614174000.jpg"
		return uniqueName;
	},

	}
  }));

app.use(async (ctx, next) => {
	try {
		ctx.set('Access-Control-Allow-Origin', 'http://localhost:5173');
		ctx.set('Access-Control-Allow-Methods', 'GET, POST,PATCH, PUT, DELETE, OPTIONS');
		ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		ctx.set('Access-Control-Allow-Credentials', 'true'); 
		await next();
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
