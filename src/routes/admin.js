const Router = require("koa-router");
const Controller = require("../controllers");

let r = new Router();

r.post("/admin/hotels",async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('addHotel');
});

r.get("/admin/hotels",async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('getHotelsAll');
})

r.patch("/admin/hotels/:id",async (ctx, next) =>{
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('updateHotel');
})

r.delete("/admin/hotels/:id",async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('removeHotel');
})

r.post("/admin/register", async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('register');
})

r.post("/admin/login", async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('login');
})

r.get("/admin/users", async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('getAllUsers');
});


module.exports = r;