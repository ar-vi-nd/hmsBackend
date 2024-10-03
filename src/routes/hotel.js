const Router = require('koa-router')
const Controller = require('../controllers')


const r = new Router()

r.get('/api/hotels', (ctx, next) => {
    let controller = new Controller.Hotel(ctx, next)
    return controller.execute('getHotelsAll')
})

r.get('/api/hotels/:hotelId', (ctx, next) => {
    let controller = new Controller.Hotel(ctx, next)
    return controller.execute('getHotelDetails')
})

r.post('/api/hotels', (ctx, next) => {
    let controller = new Controller.Hotel(ctx, next)
    return controller.execute('addHotel')
})

r.patch('/api/hotels/:hotelId', (ctx, next) =>{
    let controller = new Controller.Hotel(ctx, next)
    return controller.execute('updateHotel')
})

r.delete('/api/hotels/:hotelId', (ctx, next) => {
    let controller = new Controller.Hotel(ctx, next)
    return controller.execute('removeHotel')
})

module.exports = r