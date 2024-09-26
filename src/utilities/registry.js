class Registry{
    constructor(){
        this._data={}
    }
    set(key,value){
        this._data[key]=value
    }
    get(key,defaultValue= null){
        return this._data[key] || defaultValue
    }
    delete(key){
        delete this._data[key]
    }
}

module.exports = new Registry();