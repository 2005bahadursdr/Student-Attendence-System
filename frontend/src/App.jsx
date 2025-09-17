import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;