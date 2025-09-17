import express from 'express';
import Class from '../models/Class.js';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/classes - Get all classes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { className: { $regex: search, $options: 'i' } },
        { classCode: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const classes = await Class.find(query)
      .populate('students', 'firstName lastName studentId email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Class.countDocuments(query);

    res.json({
      success: true,
      data: classes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching classes',
      error: error.message 
    });
  }
});

// GET /api/classes/:id - Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate('students', 'firstName lastName studentId email status');
    
    if (!classDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    res.json({ success: true, data: classDoc });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching class',
      error: error.message 
    });
  }
});

// POST /api/classes - Create new class
router.post('/', async (req, res) => {
  try {
    const classData = req.body;
    const newClass = new Class(classData);
    await newClass.save();

    res.status(201).json({ 
      success: true, 
      message: 'Class created successfully',
      data: newClass 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class code already exists' 
      });
    }
    
    res.status(400).json({ 
      success: false, 
      message: 'Error creating class',
      error: error.message 
    });
  }
});

// PUT /api/classes/:id - Update class
router.put('/:id', async (req, res) => {
  try {
    const classDoc = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('students');

    if (!classDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Class updated successfully',
      data: classDoc 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error updating class',
      error: error.message 
    });
  }
});

// DELETE /api/classes/:id - Delete class
router.delete('/:id', async (req, res) => {
  try {
    const classDoc = await Class.findByIdAndDelete(req.params.id);
    
    if (!classDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Remove class from all enrolled students
    await Student.updateMany(
      { classes: classDoc._id },
      { $pull: { classes: classDoc._id } }
    );

    res.json({ 
      success: true, 
      message: 'Class deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting class',
      error: error.message 
    });
  }
});

// GET /api/classes/:id/students - Get students enrolled in a class
router.get('/:id/students', async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate({
        path: 'students',
        select: 'firstName lastName studentId email status',
        options: { sort: { firstName: 1 } }
      });
    
    if (!classDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    res.json({ 
      success: true, 
      data: classDoc.students 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching class students',
      error: error.message 
    });
  }
});

// POST /api/classes/:id/enroll - Enroll a student in a class
router.post('/:id/enroll', async (req, res) => {
  try {
    const classId = req.params.id;
    const { studentId } = req.body;

    // Check if class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Check if student exists
    const studentDoc = await Student.findById(studentId);
    if (!studentDoc) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Add student to class (avoid duplicates)
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: studentId }
    });

    // Add class to student (avoid duplicates)
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { classes: classId }
    });

    res.json({ success: true, message: 'Student enrolled in class successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enrolling student',
      error: error.message
    });
  }
});

// Get all students in a class
router.get('/:id/students', async (req, res) => {
  try {
    const classId = req.params.id;

    const classDoc = await Class.findById(classId).populate('students');
    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.json({
      success: true,
      data: classDoc.students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students for class',
      error: error.message
    });
  }
});


export default router;