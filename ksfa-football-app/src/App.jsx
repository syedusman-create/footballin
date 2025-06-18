// src/App.jsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './utils/firebase';
import { useFirebaseAuth } from './hooks/useFirebaseData';
import { showMessageModal } from './utils/helpers';
import { initialData } from './data/initialData';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Import components
import Navigation from './components/common/Navigation';
import HomePage from './components/pages/HomePage';
import PlayerEditModal from './components/models/PlayerEditModal';
import FixturesPage from './components/pages/FixturesPage';
import StateLeaguePage from './components/pages/StateLeaguePage';
import DivisionSelect from './components/pages/DivisionSelect';

const App = () => {
  const { user, loading, error } = useFirebaseAuth();
  const [appId, setAppId] = useState('1:140722212660:web:4dbae5a944e96a5c135f61'); // Replace with your actual app ID
  const [useHardcodedData, setUseHardcodedData] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPage, setCurrentPage] = useState('league'); // 'home' or 'league'
  const [players, setPlayers] = useState({});
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchPlayers = async (teamName) => {
    if (!useHardcodedData) {
      try {
        const teamDocRef = doc(db, `artifacts/${appId}/public/data/${stateName.toLowerCase()}/${divisionName}/Teams/${teamName}`, teamName);
        const teamDoc = await getDoc(teamDocRef);
        if (teamDoc.exists()) {
          setPlayers(teamDoc.data().players || []);
        }
      } catch (e) {
        console.error('Error fetching players:', e);
        showMessageModal('Failed to fetch players: ' + e.message, 'error');
      }
    }
  };

  const handleSelectTeam = (teamName) => {
    setSelectedTeam(teamName);
    fetchPlayers(teamName);
  };

  const handleClosePlayerEditModal = () => {
    setSelectedTeam(null);
  };

  const handleSavePlayers = async (updatedPlayers) => {
    if (useHardcodedData) {
      showMessageModal('Cannot save changes when using sample data.', 'error');
      return;
    }
    try {
      const teamDocRef = doc(db, `artifacts/${appId}/public/data/teamPlayers`, selectedTeam);
      await setDoc(teamDocRef, { players: updatedPlayers }, { merge: true });
      showMessageModal('Players updated successfully!', 'info');
      handleClosePlayerEditModal();
    } catch (e) {
      console.error('Error saving players:', e);
      showMessageModal('Failed to save players: ' + e.message, 'error');
    }
  };

  // Update handleStateSelect
  const handleStateSelect = (stateId) => {
    setSelectedState(stateId);
    setCurrentPage(stateId); // Update currentPage when state is selected
    navigate(`/state/${stateId}`);
  };

  // Update handleDivisionSelect
  const handleDivisionSelect = (divisionId) => {
    setSelectedDivision(divisionId);
    // Navigate to leagues page with current state
    navigate(`/leagues/${selectedState}/${divisionId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-2xl text-gray-700">Loading application...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-2xl text-red-600">Error: {error}</div>;
  }

  return (
    <div className="App">
      <div id="message-modal-container"></div> {/* Container for the modal */}
      
      <Navigation 
        user={user}
        useHardcodedData={useHardcodedData}
        setUseHardcodedData={setUseHardcodedData}
        selectedState={selectedState}
        selectedDivision={selectedDivision}
        onStateSelect={handleStateSelect} // Pass the handler function
      />

      <main className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/state/:stateName" 
            element={
              <DivisionSelect 
                stateName={selectedState} 
                onDivisionSelect={handleDivisionSelect}
              />
            } 
          />
          <Route 
            path="/leagues/:stateName/:division" 
            element={
              <StateLeaguePage 
                stateName={selectedState}
                divisionName={selectedDivision}
                appId={appId}
              />
            } 
          />
          <Route 
            path="/fixtures/:stateName/:division" 
            element={
              <FixturesPage 
                stateName={selectedState} 
                divisionName={selectedDivision} 
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {selectedTeam && (
        <PlayerEditModal
          teamName={selectedTeam}
          players={useHardcodedData ? (initialData.teamPlayers[selectedTeam] || []) : players}
          onClose={handleClosePlayerEditModal}
          onSave={handleSavePlayers}
          useHardcodedData={useHardcodedData}
        />
      )}
    </div>
  );
};

export default App;
