import React from 'react';

const FixturesPage = () => {
  const fixtures = [
    {
      id: 1,
      date: "2025-06-20",
      time: "19:00",
      homeTeam: "Bengaluru FC",
      awayTeam: "Kerala Blasters",
      venue: "Sree Kanteerava Stadium",
      competition: "Karnataka Premier League",
      status: "Upcoming"
    },
    {
      id: 2,
      date: "2025-06-22",
      time: "17:30",
      homeTeam: "Mangalore United",
      awayTeam: "Mysuru Warriors",
      venue: "Mangala Stadium",
      competition: "Karnataka Premier League",
      status: "Upcoming"
    },
    {
      id: 3,
      date: "2025-06-25",
      time: "20:00",
      homeTeam: "Hubli Tigers",
      awayTeam: "Bengaluru FC",
      venue: "Hubli Stadium",
      competition: "Karnataka Premier League",
      status: "Upcoming"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Upcoming Fixtures</h1>
        
        <div className="grid gap-6">
          {fixtures.map((fixture) => (
            <div 
              key={fixture.id} 
              className="bg-gray-900 rounded-lg p-6 shadow-lg hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-green-500">{fixture.date}</span>
                <span className="text-green-500">{fixture.time}</span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-semibold">{fixture.homeTeam}</div>
                <div className="text-2xl font-bold text-gray-400">VS</div>
                <div className="text-xl font-semibold">{fixture.awayTeam}</div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <div>Venue: {fixture.venue}</div>
                <div>{fixture.competition}</div>
              </div>
              
              <div className="mt-4 text-center">
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300">
                  Match Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FixturesPage;