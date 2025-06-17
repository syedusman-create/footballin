import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const StateLeaguePage = ({ stateName, divisionName, appId }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!stateName || !divisionName || !appId) {
        console.error('Missing props:', { stateName, divisionName, appId });
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        // Modify the path to match your Firestore structure
        const path = `Rankings/${stateName.toLowerCase()}/${divisionName}`;
        console.log('Attempting to fetch from path:', path);
        
        const teamsRef = collection(db, ...path.split('/'));
        
        // Add more detailed logging
        console.log('Collection reference:', {
          path: teamsRef.path,
          parent: teamsRef.parent?.path
        });

        const snapshot = await getDocs(teamsRef);
        
        console.log('Snapshot details:', {
          empty: snapshot.empty,
          size: snapshot.size,
          exists: snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        });

        if (snapshot.empty) {
          console.warn(`No teams found at path: ${teamsRef.path}`);
          setTeams([]);
          return;
        }

        const teamsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Match the exact field names from your Firestore document
          return {
            id: doc.id,
            Team: data.Team || doc.id.replace(/_/g, ' '), // Use document ID as fallback
            Rank: parseInt(data.Rank) || 0,
            Played: parseInt(data['Matches Played']) || 0,
            Won: parseInt(data.Wins) || 0,
            Draw: parseInt(data.Draws) || 0,
            Lost: parseInt(data.Losses) || 0,
            Points: parseInt(data.Points) || 0,
            division: data.division || divisionName
          };
        });

        // Double check we have data
        console.log('Processed teams data:', teamsData);

        // Sort teams by points first, then by goal difference if you have it
        const sortedTeams = teamsData.sort((a, b) => {
          if (b.Points !== a.Points) {
            return b.Points - a.Points;
          }
          return b.Won - a.Won; // Secondary sort by wins if points are equal
        });

        setTeams(sortedTeams);
      } catch (err) {
        console.error('Fetch error:', {
          message: err.message,
          code: err.code,
          path: path
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [stateName, divisionName, appId]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading {divisionName} teams in {stateName}...</div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-red-500 text-xl">Error: {error}</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center capitalize">
        {stateName} - {divisionName.replace('_', ' ')} League Table
      </h1>

      {teams.length === 0 ? (
        <div className="text-center text-xl text-gray-400">
          No teams found for {divisionName} in {stateName}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-900 rounded-lg overflow-hidden">
            <thead className="bg-green-600">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Team</th>
                <th className="px-6 py-3 text-center">Played</th>
                <th className="px-6 py-3 text-center">Won</th>
                <th className="px-6 py-3 text-center">Draw</th>
                <th className="px-6 py-3 text-center">Lost</th>
                <th className="px-6 py-3 text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="px-6 py-4">{team.Rank}</td>
                  <td className="px-6 py-4">{team.Team}</td>
                  <td className="px-6 py-4 text-center">{team.Played}</td>
                  <td className="px-6 py-4 text-center">{team.Won}</td>
                  <td className="px-6 py-4 text-center">{team.Draw}</td>
                  <td className="px-6 py-4 text-center">{team.Lost}</td>
                  <td className="px-6 py-4 text-center">{team.Points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StateLeaguePage;
