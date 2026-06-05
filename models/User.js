const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    parking: { type: String, enum: ['Да', 'Не'], required: true },
    gymTime: { type: String, enum: ['Сабајле', 'Навечер'], required: true },
    pricingPlan: { type: String, enum: ['Basic', 'Premium', 'VIP'], required: true },
    personalTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', default: null },
    trainerAppointment: { type: String, default: null }, // Selected appointment time
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    membersCount: { type: Number, default: 0 },
    profilePicture: { type: String, default: null }
});

module.exports = mongoose.model("User", userSchema);