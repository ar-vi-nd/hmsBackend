const Router = require("koa-router");
const Controller = require("../controllers");


let r = new Router();

r.post("/auth/register", async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    // await is must here as otherwise the rest of the code will run and you get an error that response would already had been sent
    await controller.execute('register');
});

r.get("/auth/arvind",async(ctx,next)=>{
   
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('callUpendra');
    ctx.body = controller.arvind;
})

r.post("/auth/login",async(ctx,next)=>{
    let controller = new Controller.Auth(ctx,next)
    await controller.execute("login")
})

r.get("/auth/home",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('home');
});

module.exports = r;