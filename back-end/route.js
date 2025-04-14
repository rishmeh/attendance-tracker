const express = require('express');
const router = express.Router();
const User = require('./schema');
const cors = require('cors');
const jwt = require('jsonwebtoken');

router.use(express.json());
router.use(cors());

// JWT Secret key - should be in environment variables in production
const JWT_SECRET = 'your-secret-key-here';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Register a new user
router.post("/register", async (req, res) => {
  const { id, email, password } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { id }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Create new user
    const newUser = new User({
      id,
      email,
      password,
      classes: []
    });
    
    await newUser.save();
    
    // Create JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: newUser._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Registration failed"
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Create JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Login failed"
    });
  }
});

// Add a class to user's schedule
router.post("/classes", verifyToken, async (req, res) => {
  const { name, day, time } = req.body;
  
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.classes.push({
      name,
      schedule: { day, time },
      held: 0,
      attended: 0
    });
    
    await user.save();
    
    res.status(201).json({
      message: "Class added successfully",
      class: user.classes[user.classes.length - 1]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to add class"
    });
  }
});

// Get user's classes
router.get("/classes", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      classes: user.classes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to retrieve classes"
    });
  }
});

// Update class attendance
router.put("/attendance/:classId", verifyToken, async (req, res) => {
  const { classId } = req.params;
  const { attended, held } = req.body;
  
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const classToUpdate = user.classes.id(classId);
    if (!classToUpdate) {
      return res.status(404).json({ message: "Class not found" });
    }
    
    if (attended !== undefined) classToUpdate.attended = attended;
    if (held !== undefined) classToUpdate.held = held;
    
    await user.save();
    
    res.status(200).json({
      message: "Attendance updated successfully",
      class: classToUpdate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update attendance"
    });
  }
});

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to retrieve profile"
    });
  }
});

module.exports = router;