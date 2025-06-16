import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, onSnapshot } from 'firebase/firestore';

// Helper function for a custom alert modal
const showMessageModal = (message, type = 'info', duration = 3000) => {
  const modalContainer = document.getElementById('message-modal-container');
  if (!modalContainer) {
    console.error('Message modal container not found.');
    return;
  }

  // Remove any existing modals to ensure only one is active
  const existingModal = modalContainer.querySelector('.fixed.inset-0');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = `fixed inset-0 z-50 flex items-center justify-center p-4 ${
    type === 'error' ? 'bg-red-800 bg-opacity-75' : 'bg-gray-900 bg-opacity-75'
  }`; // Darker overlay
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 transition-transform duration-300 ease-out">
      <p class="text-lg font-semibold ${type === 'error' ? 'text-red-700' : 'text-gray-800'}">${message}</p>
      <button class="mt-5 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-medium text-base">Close</button>
    </div>
  `;

  modalContainer.appendChild(modal);

  // Add a slight animation for the modal appearing
  setTimeout(() => {
      modal.querySelector('div').classList.remove('scale-95');
      modal.querySelector('div').classList.add('scale-100');
  }, 50);

  const closeButton = modal.querySelector('button');
  closeButton.onclick = () => {
    modal.querySelector('div').classList.remove('scale-100');
    modal.querySelector('div').classList.add('scale-95');
    modal.addEventListener('transitionend', () => modal.remove()); // Remove after animation
  };

  if (duration > 0) {
    setTimeout(() => {
      if (modal.parentNode) {
        modal.querySelector('div').classList.remove('scale-100');
        modal.querySelector('div').classList.add('scale-95');
        modal.addEventListener('transitionend', () => modal.remove());
      }
    }, duration);
  }
};

// HomePage Component
const HomePage = () => {
  const newsArticles = [
    {
      id: 1,
      title: "KSFA League Kicks Off with Thrilling Matches!",
      date: "June 12, 2025",
      content: "The highly anticipated KSFA Football League has officially commenced, delivering an exhilarating opening weekend. Fans witnessed nail-biting finishes and spectacular goals across all divisions. Early contenders are already making their mark, promising a season full of excitement and fierce competition. Stay tuned for more updates as the league progresses!"
    },
    {
      id: 2,
      title: "Golden Lions Dominate Opening Fixtures",
      date: "June 11, 2025",
      content: "The Golden Lions have started their KSFA Premier League campaign with a commanding performance, securing two dominant victories. Their formidable offense and stout defense have put the league on notice. Coach's strategic prowess seems to be paying off early in the season. Will they maintain this winning streak?"
    },
    {
      id: 3,
      title: "New Talent Shines in Division One",
      date: "June 10, 2025",
      content: "Several new faces in KSFA Division One have delivered breakout performances in the initial matches. Young players are showcasing immense potential, contributing significantly to their teams' successes. This influx of fresh talent promises a vibrant future for KSFA football. We'll be keeping a close eye on these rising stars!"
    },
    {
      id: 4,
      title: "Injury Update: Key Players Out for Next Round",
      date: "June 9, 2025",
      content: "Unfortunately, a few key players from various teams have sustained injuries during the demanding opening fixtures and will be sidelined for the upcoming matches. Their respective clubs are working diligently on their recovery. We wish them a speedy return to the pitch. Teams will need to adjust their strategies accordingly."
    }
  ];

  return (
    <div className="min-h-screen bg-[url('/stadium.jpg')] bg-cover bg-center">
      <div className="bg-black/50 min-h-screen">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              
              <img src="/football-logo.png" alt="KSFA Logo" className="inline-block h-50 md:h-50 ml-4" />
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12">
              Experience Karnataka's Premier Football League
            </p>
          
          </div>
        </div>

        {/* News Section */}
        <div className="bg-gradient-to-b from-black/50 to-green-900">
          <div className="max-w-7xl mx-auto px-4 py-20">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">Latest Updates</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.map(article => (
                <div key={article.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:transform hover:scale-105 transition-all">
                  <div className="text-green-400 text-sm mb-3">{article.date}</div>
                  <h3 className="text-xl font-bold text-white mb-4">{article.title}</h3>
                  <p className="text-gray-300 mb-6">{article.content}</p>
                  <button className="text-black border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-green-900 transition-all">
                    Read More →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// LeaguePage Component
const LeaguePage = ({ onSelectTeam, useHardcodedData, appId, db }) => {
  const [leagueRankings, setLeagueRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] = useState(true);
  const [errorRankings, setErrorRankings] = useState(null);

  useEffect(() => {
    if (useHardcodedData) {
      setLeagueRankings(initialData.leagueRankings);
      setLoadingRankings(false);
      return;
    }

    // Only attempt to fetch from Firestore if db prop is initialized
    if (!db) {
      setLoadingRankings(false);
      setErrorRankings("Firebase DB not available. Cannot fetch live data.");
      return;
    }

    if (!appId || appId === 'default-app-id') {
      setLoadingRankings(false);
      console.log("LeaguePage: App ID not ready, waiting.");
      return; // Wait for appId to be properly set
    }

    const rankingsCollectionRef = collection(db, `artifacts/${appId}/public/data/leagueRankings`);
    const q = query(rankingsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const rankings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeagueRankings(rankings);
        setLoadingRankings(false);
      } catch (err) {
        console.error("Error fetching league rankings: ", err);
        setErrorRankings("Failed to load live league rankings.");
        setLoadingRankings(false);
      }
    }, (err) => {
      console.error("Error with onSnapshot for league rankings: ", err);
      setErrorRankings("Failed to listen for live league ranking updates.");
      setLoadingRankings(false);
    });

    return () => unsubscribe();
  }, [db, useHardcodedData, appId]);

  const groupedRankings = leagueRankings.reduce((acc, team) => {
    if (!acc[team.League]) {
      acc[team.League] = [];
    }
    acc[team.League].push(team);
    return acc;
  }, {});

  if (loadingRankings) {
    return <div className="text-center p-12 text-gray-600 text-xl font-medium">Loading rankings...</div>;
  }

  if (errorRankings) {
    return <div className="text-center p-12 text-red-600 text-xl font-medium">Error: {errorRankings}</div>;
  }

  if (leagueRankings.length === 0 && !useHardcodedData) {
    return (
      <div className="p-8 md:p-12 bg-gray-50 min-h-screen text-center flex flex-col items-center justify-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
          KSFA League Rankings
        </h2>
        <p className="text-xl text-gray-600 mb-8">No league rankings available. Please upload data via the Python script or check your Firebase connection.</p>
      </div>
    );
  }

  return (
  <div className="w-full bg-gradient-to-b from-green-900 via-green-800 to-green-900 px-4 py-8">
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 text-center">
      KSFA League Rankings
    </h2>

    {Object.entries(groupedRankings).map(([leagueName, teams]) => (
      <div key={leagueName} className="mb-12">
        <h3 className="text-xl sm:text-2xl font-bold text-green-100 mb-6 text-center">
          {leagueName}
        </h3>

        <div className="overflow-x-auto bg-green-800/30 backdrop-blur-sm rounded-lg border border-green-700/50 max-w-6xl mx-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-green-700/50">
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-green-100">Rank</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-green-100">Team</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-green-100">W</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-green-100">D</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-green-100">L</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-green-100">Pts</th>
              </tr>
            </thead>
            <tbody>
              {teams
                .sort((a, b) => b.Points - a.Points)
                .map((team, index) => (
                  <tr 
                    key={team.Team}
                    className="border-b border-green-700/30 hover:bg-green-700/30 transition-colors"
                  >
                    <td className="px-2 md:px-4 py-2 text-white text-xs md:text-base">{index + 1}</td>
                    <td className="px-2 md:px-4 py-2">
                      <button
                        onClick={() => onSelectTeam(team.Team)}
                        className="text-black-100 hover:text-white transition-colors font-medium text-xs md:text-base"
                      >
                        {team.Team}
                      </button>
                    </td>
                    <td className="px-2 md:px-4 py-2 text-green-100">{team.Wins}</td>
                    <td className="px-2 md:px-4 py-2 text-green-100">{team.Draws}</td>
                    <td className="px-2 md:px-4 py-2 text-green-100">{team.Losses}</td>
                    <td className="px-2 md:px-4 py-2 text-white font-bold">{team.Points}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
);

};

// PlayerEditModal Component
const PlayerEditModal = ({ teamName, players, onClose, onSave, useHardcodedData }) => {
  const [editedPlayers, setEditedPlayers] = useState(players.map(p => ({ ...p })));
  const [newPlayer, setNewPlayer] = useState({ 'Player Name': '', Position: '', Goals: 0, Assists: 0, 'Matches Played': 0 });

  // If using hardcoded data, editing is not possible
  if (useHardcodedData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-80 overflow-y-auto backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full border border-gray-100 transform scale-95 transition-transform duration-300 ease-out">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Edit Players for {teamName}</h3>
          <p className="text-center text-xl text-gray-600 mb-8">
            Editing is disabled when using sample data. Please connect to Firebase for full functionality.
          </p>
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md transition-colors transform hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...editedPlayers];
    updatedPlayers[index][field] = value;
    setEditedPlayers(updatedPlayers);
  };

  const handleNewPlayerChange = (field, value) => {
    setNewPlayer({ ...newPlayer, [field]: value });
  };

  const addNewPlayer = () => {
    if (newPlayer['Player Name'].trim() === '') {
      showMessageModal('Player name is required.', 'error');
      return;
    }
    setEditedPlayers([...editedPlayers, { ...newPlayer }]);
    setNewPlayer({ 'Player Name': '', Position: '', Goals: 0, Assists: 0, 'Matches Played': 0 });
  };

  const removePlayer = (index) => {
    const updatedPlayers = editedPlayers.filter((_, i) => i !== index);
    setEditedPlayers(updatedPlayers);
  };

  const handleSave = () => {
    onSave(editedPlayers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-80 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 transform scale-95 transition-transform duration-300 ease-out">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Edit Players for {teamName}</h3>
        
        {/* Existing Players */}
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Current Players</h4>
          <div className="space-y-4">
            {editedPlayers.map((player, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <input
                    type="text"
                    value={player['Player Name']}
                    onChange={(e) => handlePlayerChange(index, 'Player Name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Player Name"
                  />
                  <input
                    type="text"
                    value={player.Position}
                    onChange={(e) => handlePlayerChange(index, 'Position', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Position"
                  />
                  <input
                    type="number"
                    value={player.Goals}
                    onChange={(e) => handlePlayerChange(index, 'Goals', parseInt(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Goals"
                  />
                  <input
                    type="number"
                    value={player.Assists}
                    onChange={(e) => handlePlayerChange(index, 'Assists', parseInt(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Assists"
                  />
                  <input
                    type="number"
                    value={player['Matches Played']}
                    onChange={(e) => handlePlayerChange(index, 'Matches Played', parseInt(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Matches"
                  />
                  <button
                    onClick={() => removePlayer(index)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Player */}
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Add New Player</h4>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <input
                type="text"
                value={newPlayer['Player Name']}
                onChange={(e) => handleNewPlayerChange('Player Name', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Player Name"
              />
              <input
                type="text"
                value={newPlayer.Position}
                onChange={(e) => handleNewPlayerChange('Position', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Position"
              />
              <input
                type="number"
                value={newPlayer.Goals}
                onChange={(e) => handleNewPlayerChange('Goals', parseInt(e.target.value) || 0)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Goals"
              />
              <input
                type="number"
                value={newPlayer.Assists}
                onChange={(e) => handleNewPlayerChange('Assists', parseInt(e.target.value) || 0)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Assists"
              />
              <input
                type="number"
                value={newPlayer['Matches Played']}
                onChange={(e) => handleNewPlayerChange('Matches Played', parseInt(e.target.value) || 0)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Matches"
              />
              <button
                onClick={addNewPlayer}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
              >
                Add Player
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md transition-colors transform hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// TeamDetailPage Component
const TeamDetailPage = ({ teamName, onBack, useHardcodedData, appId, db }) => {
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [errorPlayers, setErrorPlayers] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (useHardcodedData) {
      setPlayers(initialData.teamPlayers[teamName] || []);
      setLoadingPlayers(false);
      return;
    }

    if (!db) {
      setLoadingPlayers(false);
      setErrorPlayers("Firebase DB not available. Cannot fetch live data.");
      return;
    }

    if (!appId || appId === 'default-app-id') {
      setLoadingPlayers(false);
      console.log("TeamDetailPage: App ID not ready, waiting.");
      return;
    }

    const teamDocRef = doc(db, `artifacts/${appId}/public/data/teamPlayers`, teamName);
    
    const unsubscribe = onSnapshot(teamDocRef, (docSnapshot) => {
      try {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const playersData = data.players ? JSON.parse(data.players) : [];
          setPlayers(playersData);
        } else {
          setPlayers([]);
        }
        setLoadingPlayers(false);
      } catch (err) {
        console.error("Error fetching team players: ", err);
        setErrorPlayers("Failed to load team players.");
        setLoadingPlayers(false);
      }
    }, (err) => {
      console.error("Error with onSnapshot for team players: ", err);
      setErrorPlayers("Failed to listen for team player updates.");
      setLoadingPlayers(false);
    });

    return () => unsubscribe();
  }, [teamName, db, useHardcodedData, appId]);

  const handleSavePlayers = async (updatedPlayers) => {
    if (useHardcodedData) {
      showMessageModal('Cannot save changes when using sample data.', 'error');
      return;
    }

    if (!db) {
      showMessageModal('Firebase DB not available. Cannot save changes.', 'error');
      return;
    }

    try {
      const teamDocRef = doc(db, `artifacts/${appId}/public/data/teamPlayers`, teamName);
      await setDoc(teamDocRef, {
        players: JSON.stringify(updatedPlayers)
      }, { merge: true });
      
      showMessageModal('Players updated successfully!', 'info');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving players: ', error);
      showMessageModal('Failed to save players. Please try again.', 'error');
    }
  };

  if (loadingPlayers) {
    return <div className="text-center p-12 text-gray-600 text-xl font-medium">Loading team details...</div>;
  }

  if (errorPlayers) {
    return <div className="text-center p-12 text-red-600 text-xl font-medium">Error: {errorPlayers}</div>;
  }

  return (
    <div className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 border border-gray-200"
        >
          ← Back to Rankings
        </button>
        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 text-center leading-tight tracking-tight">
          {teamName}
        </h2>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
        >
          Edit Players
        </button>
      </div>

      {players.length === 0 ? (
        <div className="text-center p-12">
          <p className="text-xl text-gray-600 mb-8">No player data available for {teamName}.</p>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Add Players
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-2xl border border-gray-100 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-xl">Player Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Goals</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assists</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-xl">Matches Played</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {players.map((player, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900 font-medium">{player['Player Name']}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{player.Position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{player.Goals}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{player.Assists}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{player['Matches Played']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditModal && (
        <PlayerEditModal
          teamName={teamName}
          players={players}
          onClose={() => setShowEditModal(false)}
          onSave={handleSavePlayers}
          useHardcodedData={useHardcodedData}
        />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [useHardcodedData, setUseHardcodedData] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [appId, setAppId] = useState('default-app-id'); // Default app ID
  const [userId, setUserId] = useState(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);
  
  // Firebase instances - will be set after initialization
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);

  // Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
  const firebaseConfig = {
    apiKey: "AIzaSyDspDWr-naHJL4A7WwmzLflo5jytvL45OY",
  authDomain: "footballdemo-5db1f.firebaseapp.com",
  projectId: "footballdemo-5db1f",
  storageBucket: "footballdemo-5db1f.firebasestorage.app",
  messagingSenderId: "140722212660",
  appId: "1:140722212660:web:4dbae5a944e96a5c135f61",
  measurementId: "G-TGWTQNDNDK"
  };

  // Helper function to check if Firebase config is valid
  const hasValidFirebaseConfig = (config) => {
    return config && 
           config.apiKey && 
           config.authDomain && 
           config.projectId && 
           config.storageBucket && 
           config.messagingSenderId && 
           config.appId &&
           config.apiKey !== "your-api-key-here"; // Check if it's still placeholder
  };

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if we have a valid Firebase configuration
        if (!hasValidFirebaseConfig(firebaseConfig)) {
          console.warn('Firebase configuration is missing or invalid. Using hardcoded data.');
          setUseHardcodedData(true);
          setIsAuthReady(true);
          setFirebaseError('Firebase configuration not found. Using sample data.');
          return;
        }

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const firestoreInstance = getFirestore(app);
        const authInstance = getAuth(app);

        // Set Firebase instances in state
        setDb(firestoreInstance);
        setAuth(authInstance);
        setFirebaseInitialized(true);

        // Set app ID directly from firebaseConfig.appId or use a default
        setAppId(firebaseConfig.appId || 'default-app-id');

        // Set up authentication state listener
        const unsubscribeAuth = onAuthStateChanged(authInstance, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log('User signed in:', user.uid);
          } else {
            setUserId(crypto.randomUUID());
            console.log('No user signed in, generated UUID');
          }
        });

        // Sign in anonymously
        try {
          await signInAnonymously(authInstance);
          console.log('Anonymous sign-in successful');
        } catch (authError) {
          console.error('Anonymous sign-in failed:', authError);
          // Continue anyway, some operations might still work
        }

        setIsAuthReady(true);

        // Cleanup function
        return () => {
          unsubscribeAuth();
        };

      } catch (error) {
        console.error('Firebase initialization failed:', error);
        setFirebaseError(`Firebase initialization failed: ${error.message}`);
        setUseHardcodedData(true);
        setIsAuthReady(true);
      }
    };

    initializeFirebase();
  }, []);

  const handleSelectTeam = (teamName) => {
    setSelectedTeam(teamName);
    setCurrentPage('team');
  };

  const handleBackToRankings = () => {
    setCurrentPage('league');
    setSelectedTeam(null);
  };

  // Show loading screen while Firebase is initializing
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message Modal Container */}
      <div id="message-modal-container"></div>

      {/* Firebase Status Banner */}
      {(useHardcodedData || firebaseError) && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                {firebaseError || 'Using sample data. Firebase connection not available.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Footballin
                 <img src="/football-logo.png" alt="KSFA Logo" className="inline-block h-8 ml-2" /> 
                 </h1>
            </div>
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('league')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentPage === 'league' || currentPage === 'team'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                League
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'league' && (
          <LeaguePage
            onSelectTeam={handleSelectTeam}
            useHardcodedData={useHardcodedData}
            appId={appId}
            db={db}
          />
        )}
        {currentPage === 'team' && selectedTeam && (
          <TeamDetailPage
            teamName={selectedTeam}
            onBack={handleBackToRankings}
            useHardcodedData={useHardcodedData}
            appId={appId}
            db={db}
          />
        )}
      </main>
    </div>
  );
};

export default App;

