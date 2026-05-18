const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const Order = require("../models/Order");
const adminAuth = require("../middleware/adminAuth");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET all orders (admin only)
router.get("/orders", adminAuth, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST add new product
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
    try {
        const { name, price, category } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : "";

        const product = new Product({
            name,
            price: parseInt(price),
            category,
            image
        });

        await product.save();

        res.status(201).json({
            message: "Product added successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new order
router.post("/orders", async (req, res) => {
    try {
        const { productName, productId, customerName, customerAddress, customerPhone } = req.body;

        if ((!productName && !productId) || !customerName || !customerAddress || !customerPhone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Prefer productId for lookup when provided
        let product = null;
        if (productId) {
            try {
                product = await Product.findById(productId);
            } catch (err) {
                product = null;
            }
        }

        if (!product && productName) {
            product = await Product.findOne({ name: productName });
        }

        const order = new Order({
            productName: product ? product.name : productName,
            productId: product ? product._id : undefined,
            productImage: product ? product.image : undefined,
            customerName,
            customerAddress,
            customerPhone,
            paymentMethod: "Плаќање при достава"
        });

        await order.save();

        res.status(201).json({
            message: "Order created successfully",
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;