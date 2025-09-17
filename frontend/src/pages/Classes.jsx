import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users, Clock } from 'lucide-react';
import { classesAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const ClassForm = ({ classData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    subject: '',
    instructor: '',
    schedule: {
      dayOfWeek: [],
      startTime: '',
      endTime: ''
    },
    semester: '',
    academicYear: '',
    maxStudents: 30,
    status: 'active',
    ...classData
  });
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (classData?._id) {
        await classesAPI.update(classData._id, formData);
      } else {
        await classesAPI.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving class:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('schedule.')) {
      const scheduleField = name.split('.')[1];
      setFormData({
        ...formData,
        schedule: { ...formData.schedule, [scheduleField]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDayChange = (day) => {
    const currentDays = formData.schedule.dayOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, dayOfWeek: newDays }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Name *
          </label>
          <input
            type="text"
            name="className"
            value={formData.className}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Code *
          </label>
          <input
            type="text"
            name="classCode"
            value={formData.classCode}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructor *
          </label>
          <input
            type="text"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schedule Days *
        </label>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {daysOfWeek.map(day => (
            <label key={day} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.schedule.dayOfWeek || []).includes(day)}
                onChange={() => handleDayChange(day)}
                className="mr-2"
              />
              <span className="text-sm">{day.slice(0, 3)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <input
            type="time"
            name="schedule.startTime"
            value={formData.schedule.startTime}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time *
          </label>
          <input
            type="time"
            name="schedule.endTime"
            value={formData.schedule.endTime}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester *
          </label>
          <input
            type="text"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Fall 2024"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year *
          </label>
          <input
            type="text"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className="input"
            placeholder="e.g., 2024-2025"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Students
          </label>
          <input
            type="number"
            name="maxStudents"
            value={formData.maxStudents}
            onChange={handleChange}
            className="input"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="input"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? <Loading size="small" /> : (classData?._id ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    fetchClasses();
  }, [searchTerm, statusFilter, pagination.currentPage]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getAll({
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });
      setClasses(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      await classesAPI.delete(classId);
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert(error.message);
    }
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingClass(null);
    fetchClasses();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">Manage classes and course information</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {pagination.totalItems} classes
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full">
            <Loading />
          </div>
        ) : classes.length > 0 ? (
          classes.map((classItem) => (
            <div key={classItem._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {classItem.className}
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{classItem.classCode}</span> • {classItem.subject}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(classItem.status)}`}>
                    {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingClass(classItem);
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(classItem._id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Instructor: {classItem.instructor}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    {classItem.schedule.dayOfWeek?.join(', ')} • {classItem.schedule.startTime} - {classItem.schedule.endTime}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{classItem.students?.length || 0} / {classItem.maxStudents} students</span>
                </div>

                <div className="text-sm text-gray-500">
                  {classItem.semester} • {classItem.academicYear}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No classes found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClass(null);
        }}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
        size="large"
      >
        <ClassForm
          classData={editingClass}
          onSave={handleModalSave}
          onCancel={() => {
            setShowModal(false);
            setEditingClass(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Classes;

