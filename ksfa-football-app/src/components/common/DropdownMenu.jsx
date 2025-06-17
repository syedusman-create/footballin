import React, { useState } from 'react';

const DropdownMenu = ({ setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);

  const states = [
    { id: 'karnataka', name: 'Karnataka' },
    { id: 'kerala', name: 'Kerala' },
    { id: 'tamilnadu', name: 'Tamil Nadu' },
    { id: 'delhi', name: 'Delhi' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-black bg-white hover:bg-green-500"
      >
        Tournaments ▼
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div
            className="relative px-4 py-2 text-black hover:bg-green-500 cursor-pointer"
            onMouseEnter={() => setIsStateOpen(true)}
            onMouseLeave={() => setIsStateOpen(false)}
          >
            State Level ▶
            
            {isStateOpen && (
              <div className="absolute left-full top-0 w-48 bg-white rounded-md shadow-lg">
                {states.map(state => (
                  <div
                    key={state.id}
                    onClick={() => {
                      setCurrentPage(state.id);
                      setIsOpen(false);
                      setIsStateOpen(false);
                    }}
                    className="px-4 py-2 text-black hover:bg-green-500 cursor-pointer"
                  >
                    {state.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div
            onClick={() => {
              setCurrentPage('national');
              setIsOpen(false);
            }}
            className="px-4 py-2 text-black hover:bg-green-500 cursor-pointer"
          >
            National Level
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;