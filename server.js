const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

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
        const initialProducts = [
            { name: "Whey Protein", price: 2500, image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500" },
            { name: "Creatine", price: 1200, image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500" },
            { name: "Pre Workout", price: 1500, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500" }
        ];
        await Product.insertMany(initialProducts);
        console.log("Initial products added");
    }
})
.catch((err) => console.log(err));

app.listen(5000, () => {
    console.log("Server running on port 5000");
    console.log("http://localhost:5000");
});