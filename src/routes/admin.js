const Router = require("koa-router");
const Controller = require("../controllers");

let r = new Router();

r.post("/admin/hotels",async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('addHotel');
});

r.get("/admin/hotels",async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('getHotels');
})

r.patch("/admin/hotels/:id",async (ctx, next) =>{
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('updateHotel');
})

r.delete("/admin/hotels/:id",async (ctx, next) => {
    let controller = new Controller.Admin(ctx, next);
    await controller.execute('removeHotel');
})


module.exports = r;