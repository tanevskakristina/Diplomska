const express = require("express");
const router = express.Router();
const Transformation = require("../models/Transformation");
const adminAuth = require("../middleware/adminAuth");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Get all transformations for a specific trainer
router.get("/trainer/:trainerId", async (req, res) => {
    try {
        const transformations = await Transformation.find({ trainerId: req.params.trainerId })
            .sort({ createdAt: -1 });
        res.json(transformations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all transformations (for admin overview)
router.get("/", async (req, res) => {
    try {
        const transformations = await Transformation.find()
            .populate('trainerId')
            .sort({ createdAt: -1 });
        res.json(transformations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get transformation by ID
router.get("/:id", async (req, res) => {
    try {
        const transformation = await Transformation.findById(req.params.id)
            .populate('trainerId');
        if (!transformation) {
            return res.status(404).json({ message: "Transformation not found" });
        }
        res.json(transformation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add transformation (admin only)
router.post("/", adminAuth, upload.single('photo'), async (req, res) => {
    try {
        const { trainerId, clientName, description } = req.body;

        if (!trainerId || !clientName || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Photo is required" });
        }

        const transformation = new Transformation({
            trainerId,
            clientName,
            description,
            photo: `/uploads/${req.file.filename}`
        });

        await transformation.save();

        res.status(201).json({
            message: "Transformation added successfully",
            transformation
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update transformation (admin only)
router.put("/:id", adminAuth, upload.single('photo'), async (req, res) => {
    try {
        const { clientName, description } = req.body;

        const updateData = {
            clientName,
            description
        };

        if (req.file) {
            updateData.photo = `/uploads/${req.file.filename}`;
        }

        const transformation = await Transformation.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!transformation) {
            return res.status(404).json({ message: "Transformation not found" });
        }

        res.json({
            message: "Transformation updated successfully",
            transformation
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete transformation (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const transformation = await Transformation.findByIdAndDelete(req.params.id);

        if (!transformation) {
            return res.status(404).json({ message: "Transformation not found" });
        }

        res.json({ message: "Transformation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
