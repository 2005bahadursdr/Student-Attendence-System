import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CheckSquare, TrendingUp } from 'lucide-react';
import { studentsAPI, classesAPI, attendanceAPI } from '../services/api';
import Loading from '../components/Loading';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    todayAttendance: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentAttendance, setRecentAttendance] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const [studentsResponse, classesResponse, attendanceResponse] = await Promise.all([
        studentsAPI.getAll({ limit: 1 }),
        classesAPI.getAll({ limit: 1 }),
        attendanceAPI.getAll({ 
          limit: 10,
          date: new Date().toISOString().split('T')[0]
        })
      ]);

      // Get attendance summary for rate calculation
      const summaryResponse = await attendanceAPI.getSummary({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });

      const totalAttendanceToday = summaryResponse.data.total;
      const presentToday = summaryResponse.data.present;
      const attendanceRate = totalAttendanceToday > 0 
        ? Math.round((presentToday / totalAttendanceToday) * 100) 
        : 0;

      setStats({
        totalStudents: studentsResponse.pagination.totalItems,
        totalClasses: classesResponse.pagination.totalItems,
        todayAttendance: presentToday,
        attendanceRate
      });

      setRecentAttendance(attendanceResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Student Attendance Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="bg-blue-500"
          trend="+12% from last month"
        />
        <StatCard
          title="Active Classes"
          value={stats.totalClasses}
          icon={BookOpen}
          color="bg-green-500"
          trend="+5% from last month"
        />
        <StatCard
          title="Today's Present"
          value={stats.todayAttendance}
          icon={CheckSquare}
          color="bg-purple-500"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h2>
          {recentAttendance.length > 0 ? (
            <div className="space-y-3">
              {recentAttendance.slice(0, 5).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {record.student?.firstName} {record.student?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.class?.className} - {record.class?.classCode}
                    </p>
                  </div>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'}
                  `}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance records for today</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full btn btn-primary text-left">
              <CheckSquare className="mr-3 h-5 w-5" />
              Mark Attendance
            </button>
            <button className="w-full btn btn-secondary text-left">
              <Users className="mr-3 h-5 w-5" />
              Add New Student
            </button>
            <button className="w-full btn btn-secondary text-left">
              <BookOpen className="mr-3 h-5 w-5" />
              Create New Class
            </button>
            <button className="w-full btn btn-secondary text-left">
              <TrendingUp className="mr-3 h-5 w-5" />
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;