
async function authMiddleware(ctx,next){
    console.log(ctx.request)
    const token = ctx.request?.header?.authorization.split(' ')[1]
    console.log(token)
    if (!token) {
        this.throwError("401", "Token not provided");
    }
    // verify token

    J

    await next()

}


module.exports = {authMiddleware}

