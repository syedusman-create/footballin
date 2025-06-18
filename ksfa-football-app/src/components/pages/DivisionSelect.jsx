import React from 'react';

const divisions = [
  { id: 'U15', name: 'Under 15' },
  { id: 'U17', name: 'Under 17' },
  { id: 'U21', name: 'Under 21' },
  { id: 'B_Division', name: 'B Division' },
  { id: 'A_Division', name: 'A Division' },
  { id: 'Super_Division', name: 'Super Division' }
];

const DivisionSelect = ({ stateName, onDivisionSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center capitalize">
        {stateName} Football Divisions
      </h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {divisions.map((division) => (
          <button
            key={division.id}
            onClick={() => onDivisionSelect(division.id)}
            className="p-6 bg-green-800/30 backdrop-blur-sm rounded-lg border border-green-700/50 
                     hover:bg-green-700/30 transition-colors text-white text-xl font-semibold
                     flex items-center justify-center min-h-[120px]"
          >
            {division.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DivisionSelect;