const Router = require("koa-router");
let r = new Router();

r.get("/api/status", (ctx, next) => {
	ctx.body = {
		success: true,
		message: "Backend API is operating normally"
	};
});

module.exports = r;