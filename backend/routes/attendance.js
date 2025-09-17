import express from 'express';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/attendance - Get attendance records with filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      classId = '', 
      studentId = '', 
      date = '', 
      status = '' 
    } = req.query;
    
    const query = {};
    
    if (classId) query.class = classId;
    if (studentId) query.student = studentId;
    if (status) query.status = status;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('class', 'className classCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, createdAt: -1 });

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
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
      message: 'Error fetching attendance records',
      error: error.message 
    });
  }
});

// GET /api/attendance/:classId/:date - Get attendance for specific class and date
router.get('/:classId/:date', async (req, res) => {
  try {
    const { classId, date } = req.params;
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Get class with students
    const classDoc = await Class.findById(classId).populate('students');
    
    if (!classDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Get attendance records for this class and date
    const attendanceRecords = await Attendance.find({
      class: classId,
      date: { $gte: startDate, $lt: endDate }
    }).populate('student');

    // Create attendance map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.student._id.toString()] = record;
    });

    // Combine student data with attendance status
    const studentsWithAttendance = classDoc.students.map(student => ({
      _id: student._id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      attendance: attendanceMap[student._id.toString()] || null
    }));

   

    res.json({ 
      success: true, 
      data: {
        class: {
          _id: classDoc._id,
          className: classDoc.className,
          classCode: classDoc.classCode,
          instructor: classDoc.instructor
        },
        date: date,
        students: studentsWithAttendance
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching class attendance',
      error: error.message 
    });
  }
});

// POST /api/attendance - Mark attendance
router.post('/', async (req, res) => {
  try {
    const attendanceData = req.body;
    
    // Validate that student is enrolled in the class
    const classDoc = await Class.findById(attendanceData.class);
    if (!classDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    const student = await Student.findById(attendanceData.student);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    if (!classDoc.students.includes(attendanceData.student)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student is not enrolled in this class' 
      });
    }

    // Check if attendance already exists for this student, class, and date
    const existingAttendance = await Attendance.findOne({
      student: attendanceData.student,
      class: attendanceData.class,
      date: new Date(attendanceData.date)
    });

    if (existingAttendance) {
      // Update existing attendance
      Object.assign(existingAttendance, attendanceData);
      existingAttendance.timeMarked = new Date();
      await existingAttendance.save();
      
      const updatedAttendance = await Attendance.findById(existingAttendance._id)
        .populate('student', 'firstName lastName studentId')
        .populate('class', 'className classCode');

      return res.json({ 
        success: true, 
        message: 'Attendance updated successfully',
        data: updatedAttendance 
      });
    } else {
      // Create new attendance record
      const attendance = new Attendance(attendanceData);
      await attendance.save();

      const populatedAttendance = await Attendance.findById(attendance._id)
        .populate('student', 'firstName lastName studentId')
        .populate('class', 'className classCode');

      res.status(201).json({ 
        success: true, 
        message: 'Attendance marked successfully',
        data: populatedAttendance 
      });
    }
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error marking attendance',
      error: error.message 
    });
  }
});

// POST /api/attendance/bulk - Mark attendance for multiple students
router.post('/bulk', async (req, res) => {
  try {
    const { classId, date, attendanceList } = req.body;
    
    const results = [];
    const errors = [];

    for (const attendanceData of attendanceList) {
      try {
        const fullAttendanceData = {
          ...attendanceData,
          class: classId,
          date: new Date(date)
        };

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          student: attendanceData.student,
          class: classId,
          date: new Date(date)
        });

        if (existingAttendance) {
          // Update existing
          Object.assign(existingAttendance, fullAttendanceData);
          existingAttendance.timeMarked = new Date();
          await existingAttendance.save();
          results.push(existingAttendance);
        } else {
          // Create new
          const attendance = new Attendance(fullAttendanceData);
          await attendance.save();
          results.push(attendance);
        }
      } catch (error) {
        errors.push({
          student: attendanceData.student,
          error: error.message
        });
      }
    }

    res.json({ 
      success: true, 
      message: `Attendance processed: ${results.length} successful, ${errors.length} errors`,
      data: { results, errors }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error processing bulk attendance',
      error: error.message 
    });
  }
});

// GET /api/attendance/reports/summary - Get attendance summary
router.get('/reports/summary', async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    
    const matchQuery = {};
    if (classId) matchQuery.class = mongoose.Types.ObjectId(classId);
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRecords = summary.reduce((total, item) => total + item.count, 0);
    
    const formattedSummary = {
      total: totalRecords,
      present: summary.find(item => item._id === 'present')?.count || 0,
      absent: summary.find(item => item._id === 'absent')?.count || 0,
      late: summary.find(item => item._id === 'late')?.count || 0,
      excused: summary.find(item => item._id === 'excused')?.count || 0
    };

    res.json({ 
      success: true, 
      data: formattedSummary 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error generating attendance summary',
      error: error.message 
    });
  }
});

export default router;



