const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    age: { type: Number, required: true },
    yearsOfExperience: { type: Number, required: true },
    photo: { type: String, required: true }, // URL or file path
    specialty: { type: String, default: "" }, // Optional specialty
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trainer", trainerSchema);
