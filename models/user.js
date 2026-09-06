const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: [
            "health",
            "fitness",
            "beach",
            "traveler",
            "family",
            "agriculture",
            "commuter",
            "event"
        ],
        default: null
    },
    favouriteCities: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model("User", userSchema);