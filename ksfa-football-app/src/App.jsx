// src/App.jsx
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
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

const App = () => {
  const { user, loading, error } = useFirebaseAuth();
  const [appId, setAppId] = useState('1:140722212660:web:4dbae5a944e96a5c135f61'); // Replace with your actual app ID
  const [useHardcodedData, setUseHardcodedData] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPage, setCurrentPage] = useState('league'); // 'home' or 'league'

  const handleSelectTeam = (teamName) => {
    setSelectedTeam(teamName);
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

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'fixtures':
        return <FixturesPage />;
      case 'national':
        return (
          <LeaguePage
            onSelectTeam={handleSelectTeam}
            useHardcodedData={useHardcodedData}
            appId={appId}
            db={db}
            isNational={true}
          />
        );
      case 'karnataka':
      case 'kerala':
      case 'tamilnadu':
      case 'delhi':
        return (
          <LeaguePage
            onSelectTeam={handleSelectTeam}
            useHardcodedData={useHardcodedData}
            appId={appId}
            db={db}
            stateName={currentPage}
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
          players={useHardcodedData ? (initialData.teamPlayers[selectedTeam] || []) : []} // Fetch live data if not hardcoded
          onClose={handleClosePlayerEditModal}
          onSave={handleSavePlayers}
          useHardcodedData={useHardcodedData}
        />
      )}
    </div>
  );
};

export default App;

