import React from 'react';


function SettingsModal({ isOpen, onClose, settings, onSettingChange }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Settings</h2>
        <label>
          Time Delay:
          <input
            type="number"
            value={settings.world_game_delay}
            onChange={e => onSettingChange('world_game_delay', e.target.value)}
          /> seconds
        </label>
        <label>
          Units:
          <select
            value={settings.world_game_units}
            onChange={e => onSettingChange('world_game_units', e.target.value)}
          >
            <option value="km">km</option>
            <option value="miles">miles</option>
          </select>
        </label>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default SettingsModal;
