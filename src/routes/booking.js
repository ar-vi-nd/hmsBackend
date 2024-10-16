const Router = require('koa-router')
const Controller = require('../controllers')

const r = new Router()

r.post('/api/booking', (ctx,next) => {
    console.log(ctx.request)
    let controller = new Controller.Booking(ctx, next)
    return controller.execute('bookRoom')

})
r.patch('/api/booking/:bookingId', (ctx,next) => {
    let controller = new Controller.Booking(ctx, next)
    return controller.execute('cancelBooking')
    })


r.get('/api/booking/:bookingId', (ctx, next) => {
    let controller = new Controller.Booking(ctx, next)
    return controller.execute('getBookingDetails')
    })

r.get('/api/bookings/:userId', (ctx, next) => {
    let controller = new Controller.Booking(ctx, next)
    return controller.execute('getAllBookings')
    })

module.exports = r