// src/components/common/Navigation.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DropdownMenu from './DropdownMenu';
import PropTypes from 'prop-types';

const statePages = [
  { id: 'karnataka', name: 'Karnataka League' },
  { id: 'kerala', name: 'Kerala League' },
  { id: 'delhi', name: 'Delhi League' }
];

const Navigation = ({ 
  user,
  useHardcodedData,
  setUseHardcodedData,
  selectedState,
  selectedDivision,
  onStateSelect
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTournamentDropdown, setShowTournamentDropdown] = useState(false);

  return (
    <header className="bg-black text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Left side - Logo */}
        <div className="flex-shrink-0">
          <Link to="/">
            <img 
              src="/football-logo.png" 
              alt="KSFA Logo" 
              className="h-20 w-auto" 
            />
          </Link>
        </div>

        {/* Right side - Navigation Options */}
        <div className="flex items-center space-x-6">
          {/* Home Link */}
          <Link 
            to="/"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-black 
              ${location.pathname === '/' ? 'bg-green-500' : 'bg-white hover:bg-green-500'}`}
          >
            Home
          </Link>

          {/* Tournaments Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTournamentDropdown(!showTournamentDropdown)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-black 
                ${location.pathname.includes('/tournament') ? 'bg-green-500' : 'bg-white hover:bg-green-500'}`}
            >
              Tournaments
            </button>
            
            {showTournamentDropdown && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white z-50">
                <Link
                  to="/tournament/national"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-500 hover:text-white"
                  onClick={() => setShowTournamentDropdown(false)}
                >
                  National
                </Link>
                <div className="relative group">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-500 
                             hover:text-white flex justify-between items-center"
                  >
                    State <span>→</span>
                  </button>
                  <div className="absolute left-full top-0 w-48 rounded-md shadow-lg bg-white 
                              invisible group-hover:visible">
                    {statePages.map(state => (
                      <button
                        key={state.id}
                        onClick={() => {
                          onStateSelect(state.id);
                          setShowTournamentDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 
                                 hover:bg-green-500 hover:text-white"
                      >
                        {state.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Fixtures Link - Always visible */}
          <Link 
            to="/fixtures"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-black
              ${location.pathname.includes('/fixtures') ? 'bg-green-500' : 'bg-white hover:bg-green-500'}`}
          >
            Fixtures
          </Link>
        </div>
      </nav>
    </header>
  );
};

Navigation.propTypes = {
  user: PropTypes.object,
  useHardcodedData: PropTypes.bool.isRequired,
  setUseHardcodedData: PropTypes.func.isRequired,
  selectedState: PropTypes.string,
  selectedDivision: PropTypes.string,
  onStateSelect: PropTypes.func.isRequired
};

Navigation.defaultProps = {
  selectedState: null,
  selectedDivision: null
};

export default Navigation;

