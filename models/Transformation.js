const mongoose = require("mongoose");

const transformationSchema = new mongoose.Schema({
    trainerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Trainer",
        required: true 
    },
    clientName: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    photo: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Transformation", transformationSchema);
