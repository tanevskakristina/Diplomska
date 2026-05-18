const express = require("express");
const router = express.Router();
const Testimonial = require("../models/Testimonial");

// GET all testimonials (public)
router.get("/", async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create testimonial (public)
router.post("/", async (req, res) => {
    try {
        const { name, message, rating } = req.body;
        if (!name || !message || rating == null) return res.status(400).json({ message: "Name, message and rating are required" });

        const r = parseInt(rating, 10);
        if (isNaN(r) || r < 1 || r > 5) return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });

        const t = new Testimonial({ name, message, rating: r });
        await t.save();
        res.status(201).json({ message: "Testimonial saved", testimonial: t });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
