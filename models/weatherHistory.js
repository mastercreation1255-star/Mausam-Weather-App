const mongoose = require("mongoose");

const weatherHistorySchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    city: {
        type: String,
        required: true,
        trim: true
    },

    temperature: {
        type: Number
    },

    feelsLike: {
        type: Number
    },

    humidity: {
        type: Number
    },

    windSpeed: {
        type: Number
    },

    weather: {
        type: String
    },

    icon: {
        type: String
    },

    searchedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    "WeatherHistory",
    weatherHistorySchema
);