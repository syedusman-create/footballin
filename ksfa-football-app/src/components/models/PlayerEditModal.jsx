// src/components/modals/PlayerEditModal.jsx
import React, { useState } from 'react';
import { showMessageModal } from '../../utils/helpers';

const POSITION_OPTIONS = [
  '', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger', 'Striker', 'Attacker', 'Sweeper', 'Wing Back', 'Full Back', 'Center Back', 'Central Midfielder', 'Attacking Midfielder', 'Defensive Midfielder', 'Other'
];

const PlayerEditModal = ({ teamName, players, onClose, onSave, useHardcodedData }) => {
  const [editedPlayers, setEditedPlayers] = useState(players.map(p => ({ ...p })));
  const [newPlayer, setNewPlayer] = useState({
    'Player Name': '',
    Position: '',
    'Jersey Number': '',
    Age: '',
    Goals: 0,
    Assists: 0,
    'Matches Played': 0
  });

  // If using hardcoded data, editing is not possible
  if (useHardcodedData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto backdrop-blur-sm">
        <div className="bg-green-950 rounded-2xl shadow-2xl p-8 max-w-3xl w-full border border-green-700 transform scale-95 transition-transform duration-300 ease-out">
          <h3 className="text-3xl font-bold text-green-200 mb-8 text-center">Edit Players for {teamName}</h3>
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
    setNewPlayer({ 'Player Name': '', Position: '', 'Jersey Number': '', Age: '', Goals: 0, Assists: 0, 'Matches Played': 0 });
  };

  const removePlayer = (index) => {
    const updatedPlayers = editedPlayers.filter((_, i) => i !== index);
    setEditedPlayers(updatedPlayers);
  };

  const handleSave = () => {
    onSave(editedPlayers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto backdrop-blur-sm">
      <div className="bg-green-950 rounded-2xl shadow-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-green-700 transform scale-95 transition-transform duration-300 ease-out">
        <h3 className="text-3xl font-bold text-green-200 mb-8 text-center">Edit Players for {teamName}</h3>
        
        {/* Existing Players */}
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-green-100 mb-4">Current Players</h4>
          <div className="space-y-4">
            {editedPlayers.map((player, index) => (
              <div key={index} className="bg-green-900 p-4 rounded-lg border border-green-700">
                <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
                  <div className="flex flex-col">
                    <label className="text-green-300 text-xs mb-1">Player Name</label>
                    <input
                      type="text"
                      value={player['Player Name']}
                      onChange={(e) => handlePlayerChange(index, 'Player Name', e.target.value)}
                      className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Player Name"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-green-300 text-xs mb-1">Position</label>
                    <select
                      value={player.Position}
                      onChange={e => handlePlayerChange(index, 'Position', e.target.value)}
                      className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {POSITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Select Position'}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-green-300 text-xs mb-1">Jersey #</label>
                    <input
                      type="number"
                      value={player['Jersey Number'] || ''}
                      onChange={e => handlePlayerChange(index, 'Jersey Number', e.target.value)}
                      className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Jersey #"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-green-300 text-xs mb-1">Age</label>
                    <input
                      type="number"
                      value={player.Age || ''}
                      onChange={e => handlePlayerChange(index, 'Age', e.target.value)}
                      className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Age"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-green-300 text-xs mb-1">Goals</label>
                    <input
                      type="number"
                      value={player.Goals}
                      onChange={e => handlePlayerChange(index, 'Goals', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Goals"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-green-300 text-xs mb-1">Assists</label>
                    <input
                      type="number"
                      value={player.Assists}
                      onChange={e => handlePlayerChange(index, 'Assists', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Assists"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-green-300 text-xs mb-1">Matches</label>
                    <input
                      type="number"
                      value={player['Matches Played']}
                      onChange={e => handlePlayerChange(index, 'Matches Played', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Matches"
                    />
                  </div>
                  <button
                    onClick={() => removePlayer(index)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors mt-6"
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
          <h4 className="text-xl font-semibold text-green-100 mb-4">Add New Player</h4>
          <div className="bg-green-900 p-4 rounded-lg border border-green-700">
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
              <div className="flex flex-col">
                <label className="text-green-300 text-xs mb-1">Player Name</label>
                <input
                  type="text"
                  value={newPlayer['Player Name']}
                  onChange={e => handleNewPlayerChange('Player Name', e.target.value)}
                  className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Player Name"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-green-300 text-xs mb-1">Position</label>
                <select
                  value={newPlayer.Position}
                  onChange={e => handleNewPlayerChange('Position', e.target.value)}
                  className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {POSITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Select Position'}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-green-300 text-xs mb-1">Jersey #</label>
                <input
                  type="number"
                  value={newPlayer['Jersey Number']}
                  onChange={e => handleNewPlayerChange('Jersey Number', e.target.value)}
                  className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Jersey #"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-green-300 text-xs mb-1">Age</label>
                <input
                  type="number"
                  value={newPlayer.Age}
                  onChange={e => handleNewPlayerChange('Age', e.target.value)}
                  className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Age"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-green-300 text-xs mb-1">Goals</label>
                <input
                  type="number"
                  value={newPlayer.Goals}
                  onChange={e => handleNewPlayerChange('Goals', parseInt(e.target.value) || 0)}
                  className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Goals"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-green-300 text-xs mb-1">Assists</label>
                <input
                  type="number"
                  value={newPlayer.Assists}
                  onChange={e => handleNewPlayerChange('Assists', parseInt(e.target.value) || 0)}
                  className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Assists"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-green-300 text-xs mb-1">Matches</label>
                <input
                  type="number"
                  value={newPlayer['Matches Played']}
                  onChange={e => handleNewPlayerChange('Matches Played', parseInt(e.target.value) || 0)}
                  className="px-3 py-2 border border-green-700 rounded-md bg-green-950 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Matches"
                />
              </div>
              <button
                onClick={addNewPlayer}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md transition-colors mt-6"
              >
                Add Player
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-green-800">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-green-800 hover:bg-green-900 text-green-200 font-semibold rounded-lg shadow-md transition-colors transform hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-green-700 to-green-900 hover:from-green-800 hover:to-green-950 text-white font-semibold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerEditModal;

