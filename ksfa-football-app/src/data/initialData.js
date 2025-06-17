// src/data/initialData.js

// Initial hardcoded data for demonstration purposes
export const initialData = {
  leagueRankings: [
    { League: 'Premier League', Team: 'Golden Lions', Wins: 10, Draws: 2, Losses: 1, Points: 32 },
    { League: 'Premier League', Team: 'Silver Strikers', Wins: 8, Draws: 3, Losses: 2, Points: 27 },
    { League: 'Premier League', Team: 'Bronze Bombers', Wins: 7, Draws: 4, Losses: 2, Points: 25 },
    { League: 'Division One', Team: 'Rapid Raptors', Wins: 9, Draws: 1, Losses: 3, Points: 28 },
    { League: 'Division One', Team: 'Stealth Serpents', Wins: 6, Draws: 5, Losses: 2, Points: 23 },
  ],
  teamPlayers: {
    'Golden Lions': [
      { 'Player Name': 'Alice Smith', Position: 'Forward', Goals: 15, Assists: 5, 'Matches Played': 13 },
      { 'Player Name': 'Bob Johnson', Position: 'Midfielder', Goals: 8, Assists: 10, 'Matches Played': 12 },
    ],
    'Silver Strikers': [
      { 'Player Name': 'Charlie Brown', Position: 'Defender', Goals: 2, Assists: 3, 'Matches Played': 13 },
      { 'Player Name': 'Diana Prince', Position: 'Goalkeeper', Goals: 0, Assists: 1, 'Matches Played': 13 },
    ],
    'Bronze Bombers': [
      { 'Player Name': 'Eve Adams', Position: 'Forward', Goals: 12, Assists: 4, 'Matches Played': 11 },
      { 'Player Name': 'Frank White', Position: 'Midfielder', Goals: 6, Assists: 7, 'Matches Played': 12 },
    ],
    'Rapid Raptors': [
      { 'Player Name': 'Grace Lee', Position: 'Defender', Goals: 1, Assists: 2, 'Matches Played': 10 },
      { 'Player Name': 'Henry Green', Position: 'Forward', Goals: 9, Assists: 3, 'Matches Played': 11 },
    ],
    'Stealth Serpents': [
      { 'Player Name': 'Ivy Black', Position: 'Midfielder', Goals: 4, Assists: 6, 'Matches Played': 12 },
      { 'Player Name': 'Jack Blue', Position: 'Goalkeeper', Goals: 0, Assists: 0, 'Matches Played': 10 },
    ],
  },
};

