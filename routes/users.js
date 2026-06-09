const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
    try {
        const { name, surname, age, address, email, password, parking, gymTime, pricingPlan, personalTrainer, trainerAppointment } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            surname,
            age,
            address,
            email,
            password: hashedPassword,
            parking,
            gymTime,
            pricingPlan,
            personalTrainer: personalTrainer || null,
            trainerAppointment: trainerAppointment || null,
            role: 'user'
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

        res.json({
            message: "Login successful",
            token,
           user: {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        age: user.age,
        address: user.address,
        email: user.email,
        pricingPlan: user.pricingPlan,
        personalTrainer: user.personalTrainer,
        trainerAppointment: user.trainerAppointment,
        role: user.role,
        profilePicture: user.profilePicture
}
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/members/count", async (req, res) => {
    try {
        const count = await User.countDocuments({ role: 'user' });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload/Update profile picture
router.post("/upload-picture", async (req, res) => {
    try {
        const { userId, profilePicture } = req.body;

        if (!userId || !profilePicture) {
            return res.status(400).json({ message: "User ID and profile picture are required" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Profile picture saved successfully",
            user: {
                id: user._id,
                name: user.name,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get parking availability for morning and evening
router.get("/parking/availability", async (req, res) => {
    try {
        const PARKING_LIMIT = 10;
        
        const morningCount = await User.countDocuments({ 
            gymTime: 'Сабајле', 
            parking: 'Да',
            role: 'user'
        });
        
        const eveningCount = await User.countDocuments({ 
            gymTime: 'Навечер', 
            parking: 'Да',
            role: 'user'
        });
        
        res.json({
            morning: {
                count: morningCount,
                isFull: morningCount >= PARKING_LIMIT,
                available: Math.max(0, PARKING_LIMIT - morningCount)
            },
            evening: {
                count: eveningCount,
                isFull: eveningCount >= PARKING_LIMIT,
                available: Math.max(0, PARKING_LIMIT - eveningCount)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/profile/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("personalTrainer");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.put("/cancel-membership/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                pricingPlan: "Basic",
                personalTrainer: null,
                trainerAppointment: null
            },
            { new: true }
        );

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// UPDATE USER (plan / trainer / appointment / profile edits)
router.put("/update/:id", async (req, res) => {
    try {
        const {
            pricingPlan,
            personalTrainer,
            trainerAppointment,
            name,
            surname,
            age,
            address
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                pricingPlan,
                personalTrainer,
                trainerAppointment,
                name,
                surname,
                age,
                address
            },
            { new: true }
        ).populate("personalTrainer");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;