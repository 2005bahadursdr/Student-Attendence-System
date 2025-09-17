import express from 'express';
import Student from '../models/Student.js';
import Class from '../models/Class.js';

const router = express.Router();

// GET /api/students - Get all students
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const students = await Student.find(query)
      .populate('classes', 'className classCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
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
      message: 'Error fetching students',
      error: error.message 
    });
  }
});

// GET /api/students/:id - Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('classes');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching student',
      error: error.message 
    });
  }
});

// POST /api/students - Create new student
router.post('/', async (req, res) => {
  try {
    const studentData = req.body;
    const student = new Student(studentData);
    await student.save();

    res.status(201).json({ 
      success: true, 
      message: 'Student created successfully',
      data: student 
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    
    res.status(400).json({ 
      success: false, 
      message: 'Error creating student',
      error: error.message 
    });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('classes');

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Student updated successfully',
      data: student 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error updating student',
      error: error.message 
    });
  }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Remove student from all classes
    await Class.updateMany(
      { students: student._id },
      { $pull: { students: student._id } }
    );

    res.json({ 
      success: true, 
      message: 'Student deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting student',
      error: error.message 
    });
  }
});

// POST /api/students/:id/enroll - Enroll student in class
router.post('/:id/enroll', async (req, res) => {
  try {
    const { classId } = req.body;
    
    const student = await Student.findById(req.params.id);
    const classDoc = await Class.findById(classId);
    
    if (!student || !classDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student or class not found' 
      });
    }

    // Check if student is already enrolled
    if (student.classes.includes(classId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student already enrolled in this class' 
      });
    }

    // Check class capacity
    if (classDoc.students.length >= classDoc.maxStudents) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class is at maximum capacity' 
      });
    }

    // Enroll student
    student.classes.push(classId);
    classDoc.students.push(student._id);
    
    await Promise.all([student.save(), classDoc.save()]);

    res.json({ 
      success: true, 
      message: 'Student enrolled successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error enrolling student',
      error: error.message 
    });
  }
});




export const createStudent = async (req, res) => {
  try {
    const { studentId, firstName, lastName, email, phone, dateOfBirth, status, classId } = req.body;

    // 1️⃣ Create student
    const student = new Student({
      studentId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      status,
      classes: classId ? [classId] : []
    });

    await student.save();

    // 2️⃣ Add student to class if classId provided
    if (classId) {
      const classObj = await Class.findById(classId);
      if (!classObj) return res.status(404).json({ message: 'Class not found' });

      classObj.students.push(student._id);
      await classObj.save();
    }

    res.status(201).json(student);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export default router;