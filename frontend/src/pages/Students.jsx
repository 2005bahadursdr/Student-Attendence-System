import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { studentsAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const StudentForm = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    status: 'active',
    ...student
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student?._id) {
        await studentsAPI.update(student._id, formData);
      } else {
        await studentsAPI.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving student:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student ID *
          </label>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="input"
            required
          />
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
            <option value="graduated">Graduated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
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
          {loading ? <Loading size="small" /> : (student?._id ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, statusFilter, pagination.currentPage]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll({
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });
      setStudents(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await studentsAPI.delete(studentId);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(error.message);
    }
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingStudent(null);
    fetchStudents();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student records and information</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search students..."
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
            <option value="graduated">Graduated</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {pagination.totalItems} students
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        {loading ? (
          <Loading />
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Enrollment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="font-medium">{student.studentId}</td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="mr-1 h-3 w-3" />
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="mr-1 h-3 w-3" />
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setShowModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No students found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalItems)} of {pagination.totalItems} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        size="large"
      >
        <StudentForm
          student={editingStudent}
          onSave={handleModalSave}
          onCancel={() => {
            setShowModal(false);
            setEditingStudent(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Students;
