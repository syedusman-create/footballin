// src/components/common/Navigation.jsx
import React from 'react';
import DropdownMenu from './DropdownMenu';

const statePages = [
  { id: 'karnataka', name: 'Karnataka League' },
  { id: 'kerala', name: 'Kerala League' },
  { id: 'delhi', name: 'Delhi League' }
];

const Navigation = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="bg-black text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Left side - Logo */}
        <div className="flex-shrink-0">
          <img 
            src="/football-logo.png" 
            alt="KSFA Logo" 
            className="h-20 w-auto" 
          />
        </div>

        {/* Right side - Navigation Options */}
        <div className="flex items-center justify-end space-x-6">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-black ${
              currentPage === 'home' 
                ? 'bg-green-500' 
                : 'bg-white hover:bg-green-500'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentPage('fixtures')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-black ${
              currentPage === 'fixtures' 
                ? 'bg-green-500' 
                : 'bg-white hover:bg-green-500'
            }`}
          >
            Fixtures
          </button>
          <DropdownMenu setCurrentPage={setCurrentPage} />
        </div>
      </nav>
    </header>
  );
};

export default Navigation;

