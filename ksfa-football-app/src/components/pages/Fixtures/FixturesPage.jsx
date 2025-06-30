import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { useAdminCheck } from '../../../hooks/useAdminCheck';
import { useFirebaseAuth } from '../../../hooks/useFirebaseData';

const STATES = ['Karnataka', 'Delhi', 'Maharashtra', 'Tamil Nadu', 'Kerala'];
const DIVISIONS = ['A_Division', 'B_Division', 'C_Division', 'U15', 'U21', 'U17'];

const FixturesPage = () => {
  const { user } = useFirebaseAuth();
  const isAdmin = useAdminCheck(user);
  const [completed, setCompleted] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFixture, setShowAddFixture] = useState(false);
  const [fixtureData, setFixtureData] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    venue: '',
    state: STATES[0],
    division: DIVISIONS[0],
    status: 'upcoming',
  });

  // Fetch fixtures from Firestore
  const fetchFixtures = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'fixtures'));
    const allFixtures = [];
    snapshot.forEach(doc => {
      allFixtures.push({ id: doc.id, ...doc.data() });
    });

    // Separate and sort fixtures
    const completedMatches = allFixtures
      .filter(f => f.status === 'completed')
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

    const upcomingMatches = allFixtures
      .filter(f => f.status !== 'completed')
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Soonest first

    setCompleted(completedMatches);
    setUpcoming(upcomingMatches);
    setLoading(false);
  };

  useEffect(() => {
    fetchFixtures();
  }, []);

  // Add fixture to Firestore
  const handleAddFixture = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "fixtures"), {
      homeTeam: fixtureData.homeTeam,
      awayTeam: fixtureData.awayTeam,
      date: fixtureData.date,
      venue: fixtureData.venue,
      state: fixtureData.state,
      division: fixtureData.division,
      status: fixtureData.status,
    });
    setShowAddFixture(false);
    setFixtureData({
      homeTeam: '',
      awayTeam: '',
      date: '',
      venue: '',
      state: STATES[0],
      division: DIVISIONS[0],
      status: 'upcoming',
    });
    fetchFixtures();
  };

  return (
    <div className="p-6 pt-24 max-w-4xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-8 text-green-300 drop-shadow-lg bg-green-900/70 border-b-4 border-green-700 rounded-t-lg py-4 px-6 shadow-lg">
        Fixtures
      </h2>
      {loading ? (
        <div className="text-green-400 text-lg animate-pulse">Loading fixtures...</div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-green-200 mb-4 mt-8 border-l-4 border-green-600 pl-4 bg-green-900/40 py-2 rounded-r-lg shadow">
            Completed Matches
          </h3>
          {completed.length === 0 ? (
            <div className="text-gray-200 mb-6">No completed matches.</div>
          ) : (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {completed.map(f => (
                <div key={f.id} className="bg-gray-900 p-5 rounded-xl shadow-lg border-2 border-green-700 hover:scale-105 transition-transform duration-200">
                  <div className="text-green-200 font-semibold mb-1">{f.state} - {f.division}</div>
                  <div className="text-lg text-white mb-1 flex items-center justify-between">
                    <span>{f.homeTeam}</span>
                    <span className="font-bold text-green-400 text-xl mx-2">{f.homeScore} - {f.awayScore}</span>
                    <span>{f.awayTeam}</span>
                  </div>
                  <div className="text-gray-100 mb-1 text-sm">{new Date(f.date).toLocaleString()} | {f.venue}</div>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-2xl font-bold text-green-200 mb-4 mt-8 border-l-4 border-green-600 pl-4 bg-green-900/40 py-2 rounded-r-lg shadow">
            Upcoming Matches
          </h3>
          {upcoming.length === 0 ? (
            <div className="text-gray-200">No upcoming matches.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map(f => (
                <div key={f.id} className="bg-gray-900 p-5 rounded-xl shadow-lg border-2 border-green-700 hover:scale-105 transition-transform duration-200">
                  <div className="text-green-200 font-semibold mb-1">{f.state} - {f.division}</div>
                  <div className="text-lg text-white mb-1 flex items-center justify-between">
                    <span>{f.homeTeam}</span>
                    <span className="font-bold text-green-400 text-xl mx-2">vs</span>
                    <span>{f.awayTeam}</span>
                  </div>
                  <div className="text-gray-100 mb-1 text-sm">{new Date(f.date).toLocaleString()} | {f.venue}</div>
                  <div className="text-yellow-300 text-sm">Status: {f.status}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <button
          className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 mb-4"
          onClick={() => setShowAddFixture(true)}
        >
          Add Fixture
        </button>
      )}

      {showAddFixture && isAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            className="bg-gray-900 p-6 rounded shadow-lg flex flex-col gap-4 w-full max-w-md border border-green-700"
            onSubmit={handleAddFixture}
          >
            <h2 className="text-xl font-bold mb-2 text-green-200">Add Fixture</h2>
            <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Home Team" value={fixtureData.homeTeam} onChange={e => setFixtureData({ ...fixtureData, homeTeam: e.target.value })} required />
            <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Away Team" value={fixtureData.awayTeam} onChange={e => setFixtureData({ ...fixtureData, awayTeam: e.target.value })} required />
            <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Date" type="datetime-local" value={fixtureData.date} onChange={e => setFixtureData({ ...fixtureData, date: e.target.value })} required />
            <input className="border p-2 rounded bg-gray-800 text-green-100 placeholder-green-300" placeholder="Venue" value={fixtureData.venue} onChange={e => setFixtureData({ ...fixtureData, venue: e.target.value })} required />

            {/* State Dropdown */}
            <select
              className="border p-2 rounded bg-gray-800 text-green-100"
              value={fixtureData.state}
              onChange={e => setFixtureData({ ...fixtureData, state: e.target.value })}
              required
            >
              {STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            {/* Division Dropdown */}
            <select
              className="border p-2 rounded bg-gray-800 text-green-100"
              value={fixtureData.division}
              onChange={e => setFixtureData({ ...fixtureData, division: e.target.value })}
              required
            >
              {DIVISIONS.map(division => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              className="border p-2 rounded bg-gray-800 text-green-100"
              value={fixtureData.status}
              onChange={e => setFixtureData({ ...fixtureData, status: e.target.value })}
              required
            >
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>

            <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" type="submit">
              Submit
            </button>
            <button type="button" className="text-red-400" onClick={() => setShowAddFixture(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FixturesPage;