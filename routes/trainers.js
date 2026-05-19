const express = require("express");
const router = express.Router();
const Trainer = require("../models/Trainer");
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

// Get all trainers
router.get("/", async (req, res) => {
    try {
        const trainers = await Trainer.find().sort({ createdAt: -1 });
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get trainers count
router.get("/count/total", async (req, res) => {
    try {
        const count = await Trainer.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get total experience
router.get("/experience/total", async (req, res) => {
    try {
        const result = await Trainer.aggregate([
            {
                $group: {
                    _id: null,
                    totalExperience: { $sum: "$yearsOfExperience" }
                }
            }
        ]);
        const totalExperience = result.length > 0 ? result[0].totalExperience : 0;
        res.json({ totalExperience });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get trainer by ID
router.get("/:id", async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        res.json(trainer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add trainer (admin only)
router.post("/", adminAuth, upload.single("photo"), async (req, res) => {
    try {
        const { name, surname, age, yearsOfExperience, specialty } = req.body;

        if (!name || !surname || !age || !yearsOfExperience) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const photo = req.file ? `/uploads/${req.file.filename}` : req.body.photoUrl;

        const trainer = new Trainer({
            name,
            surname,
            age: parseInt(age),
            yearsOfExperience: parseInt(yearsOfExperience),
            photo,
            specialty: specialty || ""
        });

        await trainer.save();

        res.status(201).json({
            message: "Trainer added successfully",
            trainer
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update trainer (admin only)
router.put("/:id", adminAuth, upload.single("photo"), async (req, res) => {
    try {
        const { name, surname, age, yearsOfExperience, specialty } = req.body;

        const updateData = {
            name,
            surname,
            age: parseInt(age),
            yearsOfExperience: parseInt(yearsOfExperience),
            specialty: specialty || ""
        };

        if (req.file) {
            updateData.photo = `/uploads/${req.file.filename}`;
        }

        const trainer = await Trainer.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }

        res.json({
            message: "Trainer updated successfully",
            trainer
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete trainer (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const trainer = await Trainer.findByIdAndDelete(req.params.id);

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }

        res.json({ message: "Trainer deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
