// src/App.jsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Keep for other potential uses or remove if not needed elsewhere
import { db } from './utils/firebase.js'; // Added .js extension
import { useFirebaseAuth } from './hooks/useFirebaseData.js'; // Added .js extension
import { showMessageModal } from './utils/helpers.js'; // Added .js extension
import { initialData } from './data/initialData.js'; // Added .js extension
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminCheck } from './hooks/useAdminCheck';

// Import components
import Navigation from './components/common/Navigation.jsx'; // Added .jsx extension
import HomePage from './components/pages/Home/HomePage.jsx'; // Added .jsx extension
// PlayerEditModal and related player states/functions are moved to PlayerPage
import FixturesPage from './components/pages/Fixtures/FixturesPage.jsx'; // Added .jsx extension
import StateLeaguePage from './components/pages/StateLeaguePage.jsx'; // Added .jsx extension
import DivisionSelect from './components/pages/DivisionSelect.jsx'; // Added .jsx extension
import PlayerPage from './components/pages/PlayerPage.jsx'; // Added .jsx extension // New PlayerPage component
import SignInPage from './components/pages/SignInPage.jsx';

const App = () => {
  const { user, loading, error } = useFirebaseAuth();
  const isAdmin = useAdminCheck(user);
  // Using the global __app_id variable if available, otherwise a default
  const appId = '1:140722212660:web:4dbae5a944e96a5c135f61';
  const [useHardcodedData, setUseHardcodedData] = useState(false);
  // Removed selectedTeam and players states
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Removed fetchPlayers, handleSelectTeam, handleClosePlayerEditModal, handleSavePlayers
  // These will now reside in the PlayerPage component

  const handleStateSelect = (stateId) => {
    setSelectedState(stateId);
    navigate(`/state/${stateId}`);
  };

  const handleDivisionSelect = (divisionId) => {
    setSelectedDivision(divisionId);
    navigate(`/leagues/${selectedState}/${divisionId}`);
  };

  // Effect to set initial selected state/division from URL if navigating directly
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments[0] === 'state' && pathSegments[1]) {
      setSelectedState(pathSegments[1]);
    }
    if (pathSegments[0] === 'leagues' && pathSegments[1] && pathSegments[2]) {
      setSelectedState(pathSegments[1]);
      setSelectedDivision(pathSegments[2]);
    }
    // No need to handle player route here as it will manage its own state
  }, [location.pathname]);


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-2xl text-gray-700">Loading application...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-2xl text-red-600">Error: {error}</div>;
  }

  return (
    <div className="App font-inter"> {/* Added font-inter class */}
      <div id="message-modal-container"></div> {/* Container for the modal */}
      
      <Navigation
        user={user}
        isAdmin={isAdmin}
        useHardcodedData={useHardcodedData}
        setUseHardcodedData={setUseHardcodedData}
        selectedState={selectedState}
        selectedDivision={selectedDivision}
        onStateSelect={handleStateSelect}
      />

      <main className="w-full min-h-screen bg-black text-white p-4"> {/* Added padding */}
        <Routes>
          <Route path="/" element={<HomePage onStateSelect={handleStateSelect} />} />
          <Route 
            path="/state/:stateName" 
            element={
              <DivisionSelect 
                // stateName is now derived from URL params in DivisionSelect directly
                onDivisionSelect={handleDivisionSelect}
              />
            } 
          />
          <Route 
            path="/leagues/:stateName/:division" 
            element={
              <StateLeaguePage 
                appId={appId}
                useHardcodedData={useHardcodedData}
                isAdmin={isAdmin}
              />
            } 
          />
          <Route 
            path="/players/:stateName/:divisionName/:teamName" 
            element={
              <PlayerPage 
                appId={appId} 
                useHardcodedData={useHardcodedData} 
                isAdmin={isAdmin}
              />
            } 
          />
          <Route 
            path="/fixtures" 
            element={<FixturesPage />} 
          />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* PlayerEditModal is now rendered within PlayerPage */}
    </div>
  );
};

export default App;
