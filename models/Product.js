const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ["Креатин", "Протеин", "Согорувач на масти", "Гејнер", "Аминокиселини"]
    },
    image: { type: String, required: true } // URL to image
});

module.exports = mongoose.model("Product", productSchema);