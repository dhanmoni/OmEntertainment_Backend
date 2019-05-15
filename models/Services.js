const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    short_description: {
        type: String,

    },
    public: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String,

    },
    about: {
        type: String,

    },
    mediaPhoto: {
        type: []
    },
    mediaVideo: {
        type: []
    },
    banner: String,

    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Service = mongoose.model('services', ServiceSchema)