const mongoose = require('mongoose');


// Schema for classes
const ClassSchema = new mongoose.Schema({
  monday: {
    type:Array,default:[]
  },
  tuesday:{
    type:Array,default:[]
  },
  wednesday:{
    type:Array,default:[]
  },
  thursday:{
    type:Array,default:[]
  },
  friday:{
    type:Array,default:[]
  },
  saturday:{
    type:Array,default:[]
  },
  sunday:{
    type:Array,default:[]
  },
  classes:{
    type:Array,default:[]
  },
  attendance:{
    type:Array,default:[]
  },stats:{
    type:Array,default:[]
  }
})

const dayEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  classes: { type: [String], default: [] },
  classes_held: { type: [String], default: [] },
  classes_attended: { type: [String], default: [] }
});

const daysDataSchema = new mongoose.Schema({
  id: { type: String, required: true },
  entries: { type: [dayEntrySchema], default: [] }
});

const DayData = mongoose.model('DayData', daysDataSchema);

const attendanceSchema = new mongoose.Schema({
  id:{type:String, required:true},
  entries:[{
    classname:{type:String, required:true},
    held:{type: Number,default:0},
    attended:{type: Number,default:0}
  }]
})
const Attendance = mongoose.model("Attendance", attendanceSchema)

// User Schema with authentication fields
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  classSchema: {type:ClassSchema,default: () => ({}), required: false},
});

UserSchema.post('save', async function (doc, next) {
  try {
    // Check if DayData already exists
    const dayDataExists = await DayData.findOne({ id: doc.id });
    if (!dayDataExists) {
      await DayData.create({ id: doc.id });
    }

    // Check if Attendance already exists
    const attendanceExists = await Attendance.findOne({ id: doc.id });
    if (!attendanceExists) {
      await Attendance.create({ id: doc.id });
    }

    next();
  } catch (err) {
    console.error("Error creating related documents:", err);
    next(err); // Pass error to Mongoose
  }
});



const User = mongoose.model('User', UserSchema);
module.exports = {User, DayData, Attendance};