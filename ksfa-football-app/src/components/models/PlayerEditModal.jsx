// src/components/modals/PlayerEditModal.jsx
import React, { useState } from 'react';
import { showMessageModal } from '../../utils/helpers';

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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Player Name"
              />
              <input
                type="text"
                value={newPlayer.Position}
                onChange={(e) => handleNewPlayerChange('Position', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Position"
              />
              <input
                type="number"
                value={newPlayer.Goals}
                onChange={(e) => handleNewPlayerChange('Goals', parseInt(e.target.value) || 0)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Goals"
              />
              <input
                type="number"
                value={newPlayer.Assists}
                onChange={(e) => handleNewPlayerChange('Assists', parseInt(e.target.value) || 0)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assists"
              />
              <input
                type="number"
                value={newPlayer['Matches Played']}
                onChange={(e) => handleNewPlayerChange('Matches Played', parseInt(e.target.value) || 0)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Matches"
              />
              <button
                onClick={addNewPlayer}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
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

export default PlayerEditModal;

