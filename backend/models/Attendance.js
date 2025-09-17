import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  markedBy: {
    type: String,
    default: 'system'
  },
  timeMarked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per student per class per date
attendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ class: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);

