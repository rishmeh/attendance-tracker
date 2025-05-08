const express = require('express');
const router = express.Router();
const {User,DayData,Attendance} = require('./schema');
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
  const { id, password } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({  id  });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Create new user
    const newUser = new User({
      id,
      password
    });
    
    await newUser.save();
    
    
    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.id,
      token: "your-jwt-token"
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
  const { id, password } = req.body;
  
  try {
    // Find user
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Verify password
    if (user.password === password){
      res.status(200).json({
        message: "Login successful",
        userId: user.id,
        token: "your-jwt-token"
      });
    }
    else{
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Login failed"
    });
  }
});

router.delete("/classes", async (req, res) => {
  const { className, id } = req.body;
  try {
    // Update User
    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ message: "User not found in User collection" });

    user.classSchema.classes = user.classSchema.classes.filter(cls => cls !== className);
    await user.save();

    // Update Attendance
    const attendance = await Attendance.findOne({ id });
    if (!attendance) return res.status(404).json({ message: "User not found in Attendance collection" });

    attendance.entries = attendance.entries.filter(cls => cls.classname !== className);
    await attendance.save();

    return res.status(200).json({ message: "Class removed successfully from both collections" });

  } catch (err) {
    console.error("Error removing class:", err);
    return res.status(500).json({ message: "Failed to remove class" });
  }
});

// Add a class to user's schedule
router.post("/classes", async (req, res) => {
  const { className, id } = req.body;
  try {
    // Update User
    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ message: "User not found in User collection" });
    user.classSchema.classes.push(className);
    await user.save();

    // Update Attendance
    const attendance = await Attendance.findOne({ id });
    if (!attendance) return res.status(404).json({ message: "User not found in Attendance collection" });

    attendance.entries.push({
      classname: className,
      held: 0,
      attended: 0
    });
    await attendance.save();

    return res.status(201).json({ message: "Class added successfully to both collections" });

  } catch (err) {
    console.error("Error adding class:", err);
    return res.status(500).json({ message: "Failed to add class" });
  }
});



router.post("/schedule", async(req,res)=>{
  const {id, day, classname} = req.body;
  try{
    const user = await User.findOne({id});
    if(!user){
      return res.status(404).json({message: "User not found"})
    }
    user.classSchema[day].push(classname);
    await user.save();

    return res.status(200).json({ message: "Class added successfully" }); 
  } 
  catch(err){
    console.error("Error adding class to day", err);
    return res.status(500).json({ message: "Internal server error" }); 
  }
})

router.delete("/schedule", async(req,res)=>{
  const {id, day, classname} = req.body;
  try{
    const user = await User.findOne({id});
    if(!user){
      return res.status(404).json({message: "User not found"})
    }
    const index = user.classSchema[day].indexOf(classname);
    if (index > -1) {
      user.classSchema[day].splice(index, 1);
    
    await user.save();

    return res.status(200).json({ message: "Class removed successfully" }); 
  }}
  catch(err){
    console.error("Error removing class to day", err);
    return res.status(500).json({ message: "Internal server error" }); 
  }
})

router.post("/held", async (req, res) => {
  const { id, classname, date, status } = req.body;

  try {
    const user = await DayData.findOne({ id });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find or create entry for the specific date
    let entry = user.entries.find((dt) => dt.date === date);

    if (!entry) {
      user.entries.push({
        date,
        classes: [],
        classes_held: [],
        classes_attended: []
      });
      entry = user.entries[user.entries.length - 1];
    
    }

    if (!entry.classes_held) entry.classes_held = [];

    if (status === "add") {
      if (!entry.classes_held.includes(classname)) entry.classes_held.push(classname);
    } else if (status === "remove") {
      entry.classes_held = entry.classes_held.filter(c => c !== classname);
    }

    const attendance = await Attendance.findOne({ id });
    if (!attendance) return res.status(404).json({ message: "User not found in Attendance collection" });
    const className = attendance.entries.find(entry => entry.classname === classname);
    if (status === "add"){
      className.held = className.held + 1;
    }
    if (status === "remove"){
      className.held = className.held - 1;
    }
    await attendance.save();

    await user.save();
    res.status(200).json({ message: "Updated classes_held successfully" });
  } catch (err) {
    console.error("Error updating classes_held:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



router.post("/attended", async (req, res) => {
  const { id, classname, date, status } = req.body;

  try {
    const user = await DayData.findOne({ id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let entry = user.entries.find((dt) => dt.date === date);
    if (!entry) {
      user.entries.push({
        date,
        classes: [],
        classes_held: [],
        classes_attended: []
      });
      entry = user.entries[user.entries.length - 1];
    }

    if (status === "add") {
      entry.classes_attended.push(classname);
    } else if (status === "remove") {
      const index = entry.classes_attended.indexOf(classname);
      if (index !== -1) {
        entry.classes_attended.splice(index, 1);
      }
    }

    const attendance = await Attendance.findOne({ id });
    if (!attendance) return res.status(404).json({ message: "User not found in Attendance collection" });
    const className = attendance.entries.find(entry => entry.classname === classname);
    if (status === "add"){
      className.attended = className.attended + 1;
    }
    if (status === "remove"){
      className.attended = className.attended - 1;
    }
    await attendance.save();
    await user.save();
    return res.status(200).json({ message: "Updated classes_held successfully" });
  } catch (err) {
    console.error("Error updating classes_held:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/user-class-data", async (req, res) => {
  const { id } = req.body;

  try {
    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user.classSchema || {});
  } catch (err) {
    console.error("Error fetching class schema:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add this to your route.js file

// Fetch attendance data for a specific date
router.get("/attendance-by-date", async (req, res) => {
  const { id, date } = req.query;

  if (!id || !date) {
    return res.status(400).json({ message: "Both user ID and date are required" });
  }

  try {
    const dayData = await DayData.findOne({ id });
    if (!dayData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the entry for the specific date
    const dateEntry = dayData.entries.find(entry => entry.date === date) || {
      date,
      classes: [],
      classes_held: [],
      classes_attended: []
    };

    // Get user's class schedule for the day
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the day of the week from the date
    const dayOfWeek = new Date(date).getDay();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = days[dayOfWeek];
    
    const classesForDay = user.classSchema[dayName] || [];

    // Build the response with detailed attendance info
    const attendanceData = {};
    
    // For each class on that day, check if it was held and attended
    classesForDay.forEach((className, index) => {
      const uniqueKey = `${className}-${index}`;
      attendanceData[uniqueKey] = {
        held: dateEntry.classes_held.includes(className),
        attended: dateEntry.classes_attended.includes(className)
      };
    });

    return res.status(200).json({
      date,
      day: dayName,
      attendanceData
    });
  } catch (err) {
    console.error("Error fetching attendance data:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;