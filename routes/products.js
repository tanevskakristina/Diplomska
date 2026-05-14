const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
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

// POST add new product
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
    try {
        const { name, price } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : "";

        const product = new Product({
            name,
            price: parseInt(price),
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

module.exports = router;