import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  X,
  GraduationCap
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Classes', href: '/classes', icon: BookOpen },
  { name: 'Attendance', href: '/attendance', icon: CheckSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">AttendanceSystem</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <item.icon className={`
                  mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                  ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white text-sm">
            <div className="font-medium">Need Help?</div>
            <div className="text-primary-100 mt-1">
              Contact support for assistance with the attendance system.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;