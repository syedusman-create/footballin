import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const StateLeaguePage = ({ stateName, divisionName, appId }) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!stateName || !divisionName) {
        console.error('Missing props:', { stateName, divisionName });
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        // Fix: Restructure path to have odd number of segments
        const docPath = `artifacts/${appId}/public/data/${stateName.toLowerCase()}/${divisionName}/Rankings`;
        
        console.log('Fetching teams from:', {
          path: docPath,
          state: stateName,
          division: divisionName,
          segments: docPath.split('/').length
        });

        const teamsRef = collection(db, ...docPath.split('/'));
        const snapshot = await getDocs(teamsRef);

        if (snapshot.empty) {
          console.warn(`No teams found in collection: ${docPath}`);
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
          division: divisionName
        });
        setError(`Failed to fetch teams: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [stateName, divisionName]);

  // Update back button handler to go back one step
  const handleBack = () => {
    navigate(-1); // This will go back to previous page
  };

  // Replace the simple loading and error states with better UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-8 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-green-100 text-xl font-semibold">Loading teams...</p>
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
        {stateName} - {divisionName} League Table
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
              </tr>
            </thead>
            <tbody className="divide-y divide-green-600/20">
              {teams.map((team, index) => (
                <tr 
                  key={team.id}
                  className={`
                    ${index === 0 ? 'bg-green-500/10' : ''}
                    ${index === 1 ? 'bg-green-500/5' : ''}
                    ${index === 2 ? 'bg-green-500/5' : ''}
                    hover:bg-green-600/20 transition-colors
                  `}
                >
                  <td className="px-6 py-4 text-green-100 font-semibold">{index + 1}</td>
                  <td className="px-6 py-4 text-green-100 font-medium">{team.Team}</td>
                  <td className="px-6 py-4 text-center text-green-200">{team.Played}</td>
                  <td className="px-6 py-4 text-center text-green-200">{team.Won}</td>
                  <td className="px-6 py-4 text-center text-green-200">{team.Draw}</td>
                  <td className="px-6 py-4 text-center text-green-200">{team.Lost}</td>
                  <td className="px-6 py-4 text-center font-bold text-green-100">{team.Points}</td>
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
    </div>
  );
};

export default StateLeaguePage;
