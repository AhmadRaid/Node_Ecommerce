const mongoose = require('mongoose')


const connectDB = (url) =>{
    mongoose.connect(url,{
        autoIndex: true,
    })
}

module.exports= connectDB