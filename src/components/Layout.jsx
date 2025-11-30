import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="bg-gray-900 min-h-screen">
      <Sidebar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 rounded-lg dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
