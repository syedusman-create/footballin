// src/components/pages/PlayerPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase.js'; // Ensure this path is correct: src/utils/firebase.js
import { showMessageModal } from '../../utils/helpers.js'; // Ensure this path is correct: src/utils/helpers.js
import { initialData } from '../../data/initialData.js'; // Ensure this path is correct: src/data/initialData.js

// Import PlayerEditModal for editing functionality
import PlayerEditModal from '../models/PlayerEditModal.jsx'; // Ensure this path is correct: src/components/models/PlayerEditModal.jsx
import FootballLoader from '../common/FootballLoader.jsx';

const PlayerPage = ({ appId, useHardcodedData, isAdmin }) => {
  const { stateName, divisionName, teamName } = useParams();
  const navigate = useNavigate();

  // Convert underscores to spaces for Firestore lookup
  const firestoreTeamName = teamName.replace(/_/g, ' ');

  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [errorLoadingPlayers, setErrorLoadingPlayers] = useState(null);
  const [isPlayerEditModalOpen, setIsPlayerEditModalOpen] = useState(false);

  useEffect(() => {
    /**
     * Fetches player data for the selected team from Firestore or uses hardcoded data.
     */
    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      setErrorLoadingPlayers(null);
      if (useHardcodedData) {
        // Access hardcoded data based on the full path
        const divisionData = initialData.stateLeagues[stateName]?.[divisionName];
        if (divisionData && divisionData.teams) {
          // Use firestoreTeamName for lookup
          const team = divisionData.teams.find(t => t.teamName === firestoreTeamName);
          if (team) {
            setPlayers((team.players || []).map(normalizePlayer));
          } else {
            setPlayers([]);
            showMessageModal(`Team '${firestoreTeamName}' not found in hardcoded data for ${stateName}/${divisionName}.`, 'warning');
          }
        } else {
          setPlayers([]);
          showMessageModal(`No hardcoded data for ${stateName}/${divisionName}.`, 'warning');
        }
        setLoadingPlayers(false);
      } else {
        try {
          // Use firestoreTeamName for Firestore lookup
          const teamDocRef = doc(db, `artifacts/${appId}/public/data/${stateName.toLowerCase()}/${divisionName}/Teams`, firestoreTeamName);
          const teamDoc = await getDoc(teamDocRef);
          if (teamDoc.exists()) {
            setPlayers((teamDoc.data().players || []).map(normalizePlayer));
          } else {
            setPlayers([]);
            showMessageModal(`No player data found for ${firestoreTeamName} in ${stateName}/${divisionName}.`, 'info');
          }
        } catch (e) {
          console.error('Error fetching players:', e);
          setErrorLoadingPlayers('Failed to fetch players: ' + e.message);
          showMessageModal('Failed to fetch players: ' + e.message, 'error');
        } finally {
          setLoadingPlayers(false);
        }
      }
    };

    if (stateName && divisionName && teamName) {
      fetchPlayers();
    } else {
      setLoadingPlayers(false);
      setErrorLoadingPlayers("Missing state, division, or team name in URL.");
    }
  }, [stateName, divisionName, teamName, appId, useHardcodedData]);

  /**
   * Handles saving updated player data to Firestore.
   * @param {Array} updatedPlayers - The array of updated player objects.
   */
  const handleSavePlayers = async (updatedPlayers) => {
    if (useHardcodedData) {
      showMessageModal('Cannot save changes when using sample data.', 'error');
      return;
    }
    try {
      // Use firestoreTeamName for Firestore save
      const teamDocRef = doc(db, `artifacts/${appId}/public/data/${stateName.toLowerCase()}/${divisionName}/Teams`, firestoreTeamName);
      await setDoc(teamDocRef, { players: updatedPlayers }, { merge: true });
      setPlayers(updatedPlayers);
      showMessageModal('Players updated successfully!', 'info');
      setIsPlayerEditModalOpen(false);
    } catch (e) {
      console.error('Error saving players:', e);
      showMessageModal('Failed to save players: ' + e.message, 'error');
    }
  };

  // Helper to map player fields from CSV/Firestore to UI
  function normalizePlayer(player) {
    return {
      name: player.name || player.Name || '',
      position: player.position || player.Position || '',
      number: player.number || player['Jersey Number'] || '',
      age: player.age || player.Age || '',
      stats: player.stats || undefined,
    };
  }

  if (loadingPlayers) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-400">
        <FootballLoader />
      </div>
    );
  }

  if (errorLoadingPlayers) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-xl text-red-500 p-4 text-center">
        <p>{errorLoadingPlayers}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 rounded-lg shadow-xl mt-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">
        Players for {teamName}
      </h2>
      <p className="text-center text-gray-300 mb-8">
        State: <span className="font-semibold text-yellow-400">{stateName}</span> | 
        Division: <span className="font-semibold text-yellow-400">{divisionName}</span>
      </p>

      {players.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No players found for this team.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 hover:border-blue-500 transition duration-300">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">{player.name}</h3>
              <p className="text-gray-300">Position: <span className="font-medium">{player.position}</span></p>
              <p className="text-gray-300">Number: <span className="font-medium">{player.number}</span></p>
              {player.stats && (
                <div className="mt-3">
                  <h4 className="text-md font-medium text-gray-400">Stats:</h4>
                  <ul className="list-disc list-inside text-gray-400">
                    {Object.entries(player.stats).map(([key, value]) => (
                      <li key={key}>{key}: {value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8 space-x-4">
        {isAdmin && (
          <button
            onClick={() => setIsPlayerEditModalOpen(true)}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
          >
            Edit Players
          </button>
        )}
        <button
          onClick={() => navigate(-1)} // Go back to the previous page (StateLeaguePage)
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
        >
          Back to Leagues
        </button>
      </div>

      {isPlayerEditModalOpen && (
        <PlayerEditModal
          teamName={teamName}
          players={players} // Pass the currently loaded players to the modal
          onClose={() => setIsPlayerEditModalOpen(false)}
          onSave={handleSavePlayers}
          useHardcodedData={useHardcodedData}
        />
      )}

      {isAdmin ? <div>ADMIN MODE</div> : <div>VIEWER MODE</div>}
    </div>
  );
};

export default PlayerPage;
