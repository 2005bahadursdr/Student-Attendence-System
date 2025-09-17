import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, X, Clock, FileText } from 'lucide-react';
import { classesAPI, attendanceAPI } from '../services/api';
import Loading from '../components/Loading';

const AttendanceMarking = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);




  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll({ status: 'active', limit: 100 });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getByClassAndDate(selectedClass, selectedDate);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    if (!attendanceData) return;

    const updatedStudents = attendanceData.students.map(student =>
      student._id === studentId 
        ? { ...student, attendance: { ...student.attendance, status } }
        : student
    );

    setAttendanceData({
      ...attendanceData,
      students: updatedStudents
    });
  };

  const handleSaveAttendance = async () => {
    if (!attendanceData || !selectedClass || !selectedDate) return;

    try {
      setSaving(true);
      
      const attendanceList = attendanceData.students.map(student => ({
        student: student._id,
        status: student.attendance?.status || 'absent'
      }));

      await attendanceAPI.markBulk({
        classId: selectedClass,
        date: selectedDate,
        attendanceList
      });

      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      case 'excused': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-700';
      case 'absent': return 'text-red-700';
      case 'late': return 'text-yellow-700';
      case 'excused': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  const attendanceOptions = [
    { value: 'present', label: 'Present', icon: CheckSquare },
    { value: 'absent', label: 'Absent', icon: X },
    { value: 'late', label: 'Late', icon: Clock },
    { value: 'excused', label: 'Excused', icon: FileText }
  ];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
        <p className="text-gray-600">Select a class and date to mark student attendance</p>
      </div>

      {/* Class and Date Selection */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input"
              required
            >
              <option value="">Choose a class...</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.className} ({classItem.classCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input pl-10"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Marking Interface */}
      {selectedClass && selectedDate && (
        <div className="card">
          {loading ? (
            <Loading />
          ) : attendanceData ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {attendanceData.class.className} ({attendanceData.class.classCode})
                  </h2>
                  <p className="text-sm text-gray-600">
                    Instructor: {attendanceData.class.instructor} • Date: {new Date(selectedDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? <Loading size="small" /> : 'Save Attendance'}
                </button>
              </div>

              {/* Attendance Grid */}
              <div className="space-y-4">
                {attendanceData.students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-3 h-3 rounded-full
                        ${getStatusColor(student.attendance?.status || 'absent')}
                      `} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {student.studentId}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {attendanceOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleAttendanceChange(student._id, option.value)}
                          className={`
                            flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${student.attendance?.status === option.value
                              ? `${getStatusColor(option.value)} text-white`
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                            }
                          `}
                        >
                          <option.icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {attendanceOptions.map((option) => {
                    const count = attendanceData.students.filter(s => 
                      (s.attendance?.status || 'absent') === option.value
                    ).length;
                    return (
                      <div key={option.value} className="space-y-1">
                        <div className={`text-2xl font-bold ${getStatusTextColor(option.value)}`}>
                          {count}
                        </div>
                        <div className="text-sm text-gray-600">{option.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found for this class</p>
            </div>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="card text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Class and Date</h3>
          <p className="text-gray-500">Choose a class and date to begin marking attendance</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;

