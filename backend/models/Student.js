import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }]
}, {
  timestamps: true
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Student', studentSchema);


