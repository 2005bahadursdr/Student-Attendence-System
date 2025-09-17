import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    trim: true
  },
  classCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: String,
    required: true,
    trim: true
  },
  schedule: {
    dayOfWeek: {
      type: [String],
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true
});

// Index for faster queries

// Index for faster queries
classSchema.index({ classCode: 1 } , { unique: true });
classSchema.index({ semester: 1, academicYear: 1 });

export default mongoose.model('Class', classSchema);



