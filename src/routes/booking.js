const Router = require('koa-router')
const Controller = require('../controllers')

const r = new Router()

r.post('/booking', (ctx,next) => {
    let controller = new Controller.Booking(ctx, next)
    return controller.execute('bookRoom')

})
r.delete('/booking/:bookingId', (ctx,next) => {
    let controller = new Controller.Booking(ctx, next)
    return controller.execute('cancelBooking')
    })


r.get('/booking/:bookingId', (ctx, next) => {
    let controller = new Controller.Booking(ctx, next)
    return controller.execute('getBookingDetails')
    })

r.get('/bookings', (ctx, next) => {
    let controller = new Controller.Booking(ctx, next)
    return controller.execute('getAllBookings')
    })

module.exports = r