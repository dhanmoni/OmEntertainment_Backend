const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    short_description:{
        type: String,
      
    },
    thumbnail:{
        type: String,
      
    },
    about:{
        type:String,
       
    },
    media:{
        type:[]
    },
   
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = Service = mongoose.model('services', ServiceSchema)