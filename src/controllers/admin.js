const BaseClass = require('./base')

class Admin extends BaseClass{
    constructor(ctx, next) {
        super(ctx,next)
        this._beforeMethods = {
            addHotel : ['authMiddleware','isAdmin'],
            removeHotel : ['authMiddleware','isAdmin'],
            getHotels : ['authMiddleware','isAdmin'],
            updateHotel : ['authMiddleware','isAdmin']
        }
 
    }

    async isAdmin(){
        if(!this.ctx.user?.isAdmin){
            this.throwError("403")
        }
    }

    async addHotel(){
        // add hotel logic here

        this.ctx.body = {
            success: true,
            message: "Hotel added successfully",
            data: {
               
            }
        }
    }

    async removeHotel(){
        // remove hotel logic here

        this.ctx.body = {
            success: true,
            message: "Hotel removed successfully",
            data: {
               
            }
        }
    }

    async updateHotel(){
        // update hotel logic here

        this.ctx.body = {
            success: true,
            message: "Hotel updated successfully",
            data: {
               
            }
        }
    }

    async getHotels(){
        // get hotels logic here

        this.ctx.body = {
            success: true,
            message: "Hotels fetched successfully",
            data: {
               
            }
        }
    }

    


}

module.exports = Admin;