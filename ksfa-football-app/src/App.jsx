// src/App.jsx
import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './utils/firebase';
import { useFirebaseAuth } from './hooks/useFirebaseData';
import { showMessageModal } from './utils/helpers';
import { initialData } from './data/initialData';

// Import components
import Navigation from './Components/common/Navigation';
import HomePage from './Components/pages/HomePage';
import LeaguePage from './Components/pages/LeaguePage';
import PlayerEditModal from './Components/models/PlayerEditModal';
import FixturesPage from './Components/pages/FixturesPage';
import StateLeaguePage from './Components/pages/StateLeaguePage';
import DivisionSelect from './Components/pages/DivisionSelect';

const App = () => {
  const { user, loading, error } = useFirebaseAuth();
  const [appId, setAppId] = useState('1:140722212660:web:4dbae5a944e96a5c135f61'); // Replace with your actual app ID
  const [useHardcodedData, setUseHardcodedData] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPage, setCurrentPage] = useState('league'); // 'home' or 'league'
  const [players, setPlayers] = useState({});
  const [selectedDivision, setSelectedDivision] = useState(null);

  const fetchPlayers = async (teamName) => {
    if (!useHardcodedData) {
      try {
        const teamDocRef = doc(db, `artifacts/${appId}/public/data/teamPlayers`, teamName);
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

  const handleDivisionSelect = (divisionId) => {
    setSelectedDivision(divisionId);
    setCurrentPage('leagueStats');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'karnataka':
      case 'kerala':
      case 'delhi':
        return (
          <DivisionSelect 
            stateName={currentPage}
            onDivisionSelect={handleDivisionSelect}
          />
        );
      case 'leagueStats':
        return (
          <StateLeaguePage 
            stateName={currentPage}
            divisionName={selectedDivision}
            appId={appId}
          />
        );
      default:
        return <HomePage />;
    }
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
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main>
        {renderContent()}
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
