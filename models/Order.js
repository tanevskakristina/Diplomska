const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productImage: { type: String },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerPhone: { type: String, required: true },
    paymentMethod: { type: String, default: "Плаќање при достава" },
    status: { type: String, enum: ['pending', 'processing', 'delivered', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
