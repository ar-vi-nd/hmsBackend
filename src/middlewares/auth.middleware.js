async function authMiddleware(ctx,next){
    console.log(this.ctx.request)
    const token = this.ctx.request.header?.authorization.split(' ')[1]
    console.log(token)
    if (!token) {
        this.throwError("401", "Token not provided");
    }
    // verify token

    await next()

}


module.exports = {authMiddleware}

