import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react';
import { classesAPI, attendanceAPI } from '../services/api';
import Loading from '../components/Loading';

const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [summary, setSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchReportData();
    }
  }, [selectedClass, dateRange]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll({ limit: 100 });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      if (selectedClass) {
        params.classId = selectedClass;
      }

      // Fetch summary
      const summaryResponse = await attendanceAPI.getSummary(params);
      setSummary(summaryResponse.data);

      // Fetch detailed records
      const recordsResponse = await attendanceAPI.getAll({
        ...params,
        limit: 100
      });
      setAttendanceRecords(recordsResponse.data);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const exportData = () => {
    // Simple CSV export
    const csvData = attendanceRecords.map(record => ({
      Date: new Date(record.date).toLocaleDateString(),
      Student: `${record.student.firstName} ${record.student.lastName}`,
      StudentID: record.student.studentId,
      Class: record.class.className,
      ClassCode: record.class.classCode,
      Status: record.status,
      TimeMarked: new Date(record.timeMarked).toLocaleString()
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View attendance statistics and generate reports</p>
        </div>
        <button
          onClick={exportData}
          disabled={!attendanceRecords.length}
          className="btn btn-primary disabled:opacity-50"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class (Optional)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input"
            >
              <option value="">All Classes</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.className} ({classItem.classCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loading size="large" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Records</p>
                    <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Present</p>
                    <p className="text-3xl font-bold text-green-600">{summary.present}</p>
                    <p className="text-sm text-green-600">
                      {calculatePercentage(summary.present, summary.total)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Absent</p>
                    <p className="text-3xl font-bold text-red-600">{summary.absent}</p>
                    <p className="text-sm text-red-600">
                      {calculatePercentage(summary.absent, summary.total)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-red-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Late + Excused</p>
                    <p className="text-3xl font-bold text-yellow-600">{summary.late + summary.excused}</p>
                    <p className="text-sm text-yellow-600">
                      {calculatePercentage(summary.late + summary.excused, summary.total)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Records */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
              <div className="text-sm text-gray-600">
                {attendanceRecords.length} records found
              </div>
            </div>

            {attendanceRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Status</th>
                      <th>Time Marked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.slice(0, 50).map((record, index) => (
                      <tr key={index}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>
                          <div>
                            <div className="font-medium text-gray-900">
                              {record.student.firstName} {record.student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {record.student.studentId}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="font-medium text-gray-900">
                              {record.class.className}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.class.classCode}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`
                            px-2 py-1 text-xs font-medium rounded-full
                            ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'}
                          `}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="text-sm text-gray-600">
                          {new Date(record.timeMarked).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {attendanceRecords.length > 50 && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Showing first 50 records. Export CSV for complete data.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-500">
                  No attendance records found for the selected criteria
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;