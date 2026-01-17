import React from 'react';
import './TutorialEditor.css';

const TutorialEditor = ({
  tutorial,
  index,
  availableTutorials = [],
  onChange,
  onRemove,
}) => {
  const mode = tutorial.mode || 'new';

  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className="tutorial-item">
      <div className="tutorial-header">
        <h4>Tutorial {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="btn btn-delete-small"
        >
          Remove
        </button>
      </div>
      
      {/* Переключатель New/Select */}
      <div className="form-group">
        <label>Mode</label>
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'new' ? 'active' : ''}`}
            onClick={() => handleChange('mode', 'new')}
          >
            New
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'select' ? 'active' : ''}`}
            onClick={() => handleChange('mode', 'select')}
          >
            Select
          </button>
        </div>
      </div>

      {mode === 'select' ? (
        // Режим Select: показываем селектор существующих tutorials
        <div className="form-group">
          <label>Select Tutorial *</label>
          <select
            value={tutorial.tutorial_id || ''}
            onChange={(e) => handleChange('tutorial_id', e.target.value)}
          >
            <option value="">Select Tutorial</option>
            {availableTutorials.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label || `Tutorial #${t.id}`}
              </option>
            ))}
          </select>
        </div>
      ) : (
        // Режим New: показываем поля для создания нового tutorial
        <>
          <div className="form-group">
            <label>Tutorial URL *</label>
            <input
              type="url"
              value={tutorial.tutorial_url || ''}
              onChange={(e) => handleChange('tutorial_url', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Label *</label>
            <input
              type="text"
              value={tutorial.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              required
            />
          </div>
        </>
      )}

      {/* Поля start_sec и end_sec доступны в обоих режимах */}
      <div className="form-row">
        <div className="form-group">
          <label>Start (sec)</label>
          <input
            type="number"
            value={tutorial.start_sec || ''}
            onChange={(e) => handleChange('start_sec', e.target.value)}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>End (sec)</label>
          <input
            type="number"
            value={tutorial.end_sec || ''}
            onChange={(e) => handleChange('end_sec', e.target.value)}
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default TutorialEditor;
