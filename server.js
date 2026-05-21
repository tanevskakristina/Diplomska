const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const testimonialsRoutes = require("./routes/testimonials");
const trainersRoutes = require("./routes/trainers");
const transformationsRoutes = require("./routes/transformations");
const { initializeTransporter } = require("./emailService");

dotenv.config();

// Initialize email service after dotenv.config()
initializeTransporter();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/trainers", trainersRoutes);
app.use("/api/transformations", transformationsRoutes);

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log("MongoDB connected");
    
    // Seed admin user if none exist
    const User = require("./models/User");
    const adminExists = await User.findOne({ email: "admin@planeti.mk" });
    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);
        
        const admin = new User({
            name: "Admin",
            surname: "Account",
            age: 30,
            address: "Planet Fitness",
            email: "admin@planeti.mk",
            password: hashedPassword,
            parking: "Да",
            gymTime: "Сабајле",
            role: "admin"
        });
        
        await admin.save();
        console.log("Admin account created - Email: admin@planeti.mk, Password: admin123");
    }
    
    // Seed initial products if none exist
    const Product = require("./models/Product");
    const count = await Product.countDocuments();
    if (count === 0) {
        console.log("No products found. Add products through admin panel.");
    }
})
.catch((err) => console.log(err));

app.listen(5000, () => {
    console.log("Server running on port 5000");
    console.log("http://localhost:5000");
});