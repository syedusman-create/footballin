// src/components/pages/LeaguePage.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { initialData } from '../../data/initialData';

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

export default LeaguePage;

