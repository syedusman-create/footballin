import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { initialData } from '../../data/initialData.js'; // Import initialData
import { db } from '../../utils/firebase.js'; // Import db
import FootballLoader from '../common/FootballLoader.jsx';

const StateLeaguePage = ({ appId, useHardcodedData, isAdmin }) => { // Add useHardcodedData to props
  const navigate = useNavigate();
  const { stateName, division } = useParams(); // Use useParams to get stateName and division
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [addTeamLoading, setAddTeamLoading] = useState(false);
  const [addTeamError, setAddTeamError] = useState(null);
  const [newTeam, setNewTeam] = useState({
    Team: '',
    Rank: '',
    Played: '',
    Won: '',
    Draw: '',
    Lost: '',
    Points: '',
  });

  const resetNewTeam = () => setNewTeam({
    Team: '',
    Rank: '',
    Played: '',
    Won: '',
    Draw: '',
    Lost: '',
    Points: '',
  });

  useEffect(() => {
    const fetchTeams = async () => {
      if (!stateName || !division) { // Use division from useParams
        console.error('Missing props:', { stateName, division });
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      if (useHardcodedData) {
        // Fetch hardcoded data
        const divisionData = initialData.stateLeagues[stateName]?.[division];
        if (divisionData && divisionData.teams) {
          const teamsData = divisionData.teams.map(team => ({
            id: team.teamName, // Using teamName as id for consistency
            Team: team.teamName,
            Rank: team.rank,
            Played: team.matchesPlayed,
            Won: team.wins,
            Draw: team.draws,
            Lost: team.losses,
            Points: team.points
          })).sort((a, b) => b.Points - a.Points);
          setTeams(teamsData);
        } else {
          setTeams([]);
          console.warn(`No hardcoded data found for ${stateName}/${division}`);
        }
        setLoading(false);
        return; // Exit if using hardcoded data
      }

      try {
        // Use the imported db instance directly
        // const db = getFirestore(); // No longer needed
        
        // Fix: Restructure path to have odd number of segments
        // The path should directly point to the collection 'Rankings' within the division
        const collectionPath = `artifacts/${appId}/public/data/${stateName.toLowerCase()}/${division}/Rankings`;
        
        console.log('Fetching teams from:', {
          path: collectionPath,
          state: stateName,
          division: division,
          segments: collectionPath.split('/').length
        });

        const teamsRef = collection(db, collectionPath); // Use the correct collection path
        const snapshot = await getDocs(teamsRef);

        if (snapshot.empty) {
          console.warn(`No teams found in collection: ${collectionPath}`);
          setTeams([]);
          return;
        }

        const teamsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            Team: data.Team || doc.id,
            Rank: parseInt(data.Rank) || 0,
            Played: parseInt(data['Matches Played']) || 0,
            Won: parseInt(data.Wins) || 0,
            Draw: parseInt(data.Draws) || 0,
            Lost: parseInt(data.Losses) || 0,
            Points: parseInt(data.Points) || 0
          };
        });

        const sortedTeams = teamsData.sort((a, b) => b.Points - a.Points);
        setTeams(sortedTeams);
      } catch (err) {
        console.error('Fetch error:', {
          message: err.message,
          code: err.code,
          state: stateName,
          division: division
        });
        setError(`Failed to fetch teams: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [stateName, division, appId, useHardcodedData]); // Add appId and useHardcodedData to dependencies

  // Update back button handler to go back one step
  const handleBack = () => {
    navigate(-1); // This will go back to previous page
  };

  // Function to navigate to the PlayerPage for a specific team
  const handleViewPlayers = (teamName) => {
    navigate(`/players/${stateName}/${division}/${teamName}`); // Use division from useParams
  };

  // Function to handle adding a new team (admin only)
  const handleAddTeam = () => setShowAddTeam(true);

  const handleCloseAddTeam = () => {
    setShowAddTeam(false);
    setAddTeamError(null);
    resetNewTeam();
  };

  const handleAddTeamSubmit = async (e) => {
    e.preventDefault();
    setAddTeamLoading(true);
    setAddTeamError(null);
    try {
      const collectionPath = `artifacts/${appId}/public/data/${stateName.toLowerCase()}/${division}/Rankings`;
      await addDoc(collection(db, collectionPath), {
        Team: newTeam.Team,
        Rank: parseInt(newTeam.Rank),
        'Matches Played': parseInt(newTeam.Played),
        Wins: parseInt(newTeam.Won),
        Draws: parseInt(newTeam.Draw),
        Losses: parseInt(newTeam.Lost),
        Points: parseInt(newTeam.Points),
      });
      setShowAddTeam(false);
      resetNewTeam();
      setAddTeamLoading(false);
      setAddTeamError(null);
      setLoading(true);
      await fetchTeams();
    } catch (err) {
      setAddTeamError('Failed to add team: ' + err.message);
      setAddTeamLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    setLoading(true);
    try {
      const collectionPath = `artifacts/${appId}/public/data/${stateName.toLowerCase()}/${division}/Rankings`;
      await deleteDoc(doc(db, collectionPath, teamId));
      await fetchTeams();
    } catch (err) {
      setError('Failed to delete team: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Replace the simple loading and error states with better UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-8 flex flex-col items-center justify-center">
        <FootballLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-8 flex flex-col items-center justify-center">
        <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-6 max-w-md w-full">
          <p className="text-red-100 text-center mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-b from-green-900 to-green-800 min-h-screen">
      <button
        onClick={handleBack}
        className="mb-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                  transition-colors flex items-center gap-2 shadow-lg"
      >
        <span>←</span> Back
      </button>
      
      <h2 className="text-3xl font-bold mb-6 text-white text-center">
        {stateName} - {division} League Table {/* Use division from useParams */}
      </h2>
      {teams.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow-xl">
          <table className="min-w-full bg-white/10 backdrop-blur-sm">
            <thead>
              <tr className="border-b border-green-600/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-300">Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-300">Team</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-green-300">P</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-green-300">W</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-green-300">D</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-green-300">L</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-green-300">PTS</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-green-300">Actions</th> {/* New column */}
              </tr>
            </thead>
            <tbody className="divide-y divide-green-600/20">
              {teams.map((team, index) => (
                <tr key={team.id} className={`
                  ${index === 0 ? 'bg-green-500/10' : ''}
                  ${index === 1 ? 'bg-green-500/5' : ''}
                  ${index === 2 ? 'bg-green-500/5' : ''}
                  hover:bg-green-600/20 transition-colors
                `}>
                  <td className="px-6 py-4 text-green-100 font-semibold">{index + 1}</td>
                  <td className="px-6 py-4 text-green-100 font-medium">{team.Team}</td>
                  <td className="px-6 py-4 text-center text-green-200">{team.Played}</td>
                  <td className="px-6 py-4 text-center text-green-200">{team.Won}</td>
                  <td className="px-6 py-4 text-center text-green-200">{team.Draw}</td>
                  <td className="px-6 py-4 text-center text-green-200">{team.Lost}</td>
                  <td className="px-6 py-4 text-center font-bold text-green-100">{team.Points}</td>
                  <td className="px-6 py-4 text-center flex flex-col gap-2 items-center">
                    <button
                      onClick={() => handleViewPlayers(team.Team)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300 text-sm mb-1"
                    >
                      View Players
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-300 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-green-100 bg-green-800/50 rounded-lg p-8 backdrop-blur-sm">
          No teams found in this division
        </div>
      )}
      {isAdmin && (
        <div className="mt-8 text-center">
          <button
            onClick={handleAddTeam}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition duration-300"
          >
            Add Team
          </button>
          {showAddTeam && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <form
                className="bg-gray-900 p-6 rounded shadow-lg flex flex-col gap-4 w-full max-w-md border border-green-700"
                onSubmit={handleAddTeamSubmit}
              >
                <h2 className="text-xl font-bold mb-2 text-green-200">Add Team</h2>
                <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Team Name" value={newTeam.Team} onChange={e => setNewTeam({ ...newTeam, Team: e.target.value })} required />
                <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Rank" type="number" value={newTeam.Rank} onChange={e => setNewTeam({ ...newTeam, Rank: e.target.value })} required />
                <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Matches Played" type="number" value={newTeam.Played} onChange={e => setNewTeam({ ...newTeam, Played: e.target.value })} required />
                <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Wins" type="number" value={newTeam.Won} onChange={e => setNewTeam({ ...newTeam, Won: e.target.value })} required />
                <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Draws" type="number" value={newTeam.Draw} onChange={e => setNewTeam({ ...newTeam, Draw: e.target.value })} required />
                <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Losses" type="number" value={newTeam.Lost} onChange={e => setNewTeam({ ...newTeam, Lost: e.target.value })} required />
                <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Points" type="number" value={newTeam.Points} onChange={e => setNewTeam({ ...newTeam, Points: e.target.value })} required />
                {addTeamError && <div className="text-red-400 text-sm">{addTeamError}</div>}
                <div className="flex gap-4 mt-2">
                  <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex-1" type="submit" disabled={addTeamLoading}>
                    {addTeamLoading ? 'Adding...' : 'Submit'}
                  </button>
                  <button type="button" className="text-red-400 flex-1" onClick={handleCloseAddTeam}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StateLeaguePage;
