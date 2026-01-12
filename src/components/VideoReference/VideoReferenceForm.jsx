import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { videoReferencesAPI, categoriesAPI, tutorialsAPI } from '../../services/api';
import './VideoReferenceForm.css';

const VideoReferenceForm = ({ video, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    source_url: '',
    preview_url: '',
    public_summary: '',
    duration_sec: '',
    category_id: '',
    platform: '',
    pacing: '',
    hook_type: '',
    production_level: '',
    has_visual_effects: false,
    has_3d: false,
    has_animations: false,
    has_typography: false,
    has_sound_design: false,
    search_profile: '',
    search_metadata: '',
    tags: '',
    tutorials: [],
  });

  useEffect(() => {
    loadCategories();
    loadTutorials();
    if (video) {
      loadVideoData();
    }
  }, [video]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTutorials = async () => {
    try {
      const response = await tutorialsAPI.getAll();
      setTutorials(response.data.data);
    } catch (error) {
      console.error('Error loading tutorials:', error);
    }
  };

  const loadVideoData = async () => {
    try {
      const response = await videoReferencesAPI.getById(video.id);
      const data = response.data.data;
      
      // Format tags as comma-separated string
      const tagsString = data.tags?.map(tag => tag.name).join(', ') || '';

      setFormData({
        title: data.title || '',
        source_url: data.source_url || '',
        preview_url: data.preview_url || '',
        public_summary: data.public_summary || '',
        duration_sec: data.duration_sec || '',
        category_id: data.category_id || '',
        platform: data.platform || '',
        pacing: data.pacing || '',
        hook_type: data.hook_type || '',
        production_level: data.production_level || '',
        has_visual_effects: data.has_visual_effects || false,
        has_3d: data.has_3d || false,
        has_animations: data.has_animations || false,
        has_typography: data.has_typography || false,
        has_sound_design: data.has_sound_design || false,
        search_profile: data.search_profile || '',
        search_metadata: data.search_metadata || '',
        tags: tagsString,
        tutorials: (data.tutorials || []).map(t => ({
          mode: 'select', // При редактировании всегда select, так как tutorial уже существует
          tutorial_id: t.id,
          tutorial_url: t.tutorial_url || '',
          label: t.label || '',
          start_sec: t.start_sec || '',
          end_sec: t.end_sec || '',
        })),
      });
    } catch (error) {
      console.error('Error loading video data:', error);
      toast.error('Error loading video data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTutorialChange = (index, field, value) => {
    setFormData(prev => {
      const tutorials = [...prev.tutorials];
      const currentTutorial = tutorials[index] || {};
      
      if (field === 'mode') {
        // При переключении mode очищаем соответствующие поля
        if (value === 'select') {
          // Переключаемся на select - очищаем tutorial_url и label
          tutorials[index] = {
            ...currentTutorial,
            mode: 'select',
            tutorial_id: '',
            tutorial_url: '',
            label: '',
            // Сохраняем start_sec и end_sec
            start_sec: currentTutorial.start_sec || '',
            end_sec: currentTutorial.end_sec || '',
          };
        } else {
          // Переключаемся на new - очищаем tutorial_id
          tutorials[index] = {
            ...currentTutorial,
            mode: 'new',
            tutorial_id: '',
            tutorial_url: currentTutorial.tutorial_url || '',
            label: currentTutorial.label || '',
            // Сохраняем start_sec и end_sec
            start_sec: currentTutorial.start_sec || '',
            end_sec: currentTutorial.end_sec || '',
          };
        }
      } else {
        tutorials[index] = {
          ...currentTutorial,
          [field]: value,
        };
      }
      
      return { ...prev, tutorials };
    });
  };

  const addTutorial = () => {
    setFormData(prev => ({
      ...prev,
      tutorials: [...prev.tutorials, { 
        mode: 'new', 
        tutorial_id: '', 
        tutorial_url: '', 
        label: '', 
        start_sec: '', 
        end_sec: '' 
      }],
    }));
  };

  const removeTutorial = (index) => {
    setFormData(prev => ({
      ...prev,
      tutorials: prev.tutorials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Подготавливаем теги: разбиваем строку на массив имен
      const tagNames = formData.tags
        ? formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
        : [];

      // Prepare tutorials data с учетом mode
      const tutorials = formData.tutorials
        .filter(t => {
          // Фильтруем только заполненные tutorials
          if (t.mode === 'select') {
            return t.tutorial_id; // В режиме select нужен tutorial_id
          } else {
            return t.tutorial_url && t.label; // В режиме new нужны оба поля
          }
        })
        .map(t => {
          const tutorial = {
            mode: t.mode || 'new',
          };
          
          if (t.mode === 'select') {
            tutorial.tutorial_id = parseInt(t.tutorial_id);
          } else {
            tutorial.tutorial_url = t.tutorial_url.trim();
            tutorial.label = t.label.trim();
          }
          
          // Добавляем start_sec и end_sec если они заполнены
          if (t.start_sec && t.start_sec.toString().trim()) {
            const startSec = parseInt(t.start_sec);
            if (!isNaN(startSec) && startSec >= 0) {
              tutorial.start_sec = startSec;
            }
          }
          if (t.end_sec && t.end_sec.toString().trim()) {
            const endSec = parseInt(t.end_sec);
            if (!isNaN(endSec) && endSec >= 0) {
              tutorial.end_sec = endSec;
            }
          }
          
          return tutorial;
        });

      // Формируем объект данных, исключая null и пустые значения
      const data = {
        title: formData.title,
        source_url: formData.source_url,
        category_id: parseInt(formData.category_id),
        has_visual_effects: formData.has_visual_effects,
        has_3d: formData.has_3d,
        has_animations: formData.has_animations,
        has_typography: formData.has_typography,
        has_sound_design: formData.has_sound_design,
        search_profile: formData.search_profile,
        tags: tagNames, // Теги всегда отправляем (валидация требует минимум 1 при создании)
      };

      // Добавляем опциональные поля только если они не пустые
      if (formData.preview_url && formData.preview_url.trim()) {
        data.preview_url = formData.preview_url.trim();
      }

      if (formData.public_summary && formData.public_summary.trim()) {
        data.public_summary = formData.public_summary.trim();
      }

      if (formData.duration_sec && formData.duration_sec.trim()) {
        const duration = parseInt(formData.duration_sec);
        if (!isNaN(duration) && duration > 0) {
          data.duration_sec = duration;
        }
      }

      if (formData.pacing && formData.pacing.trim()) {
        data.pacing = formData.pacing.trim();
      }

      if (formData.hook_type && formData.hook_type.trim()) {
        data.hook_type = formData.hook_type.trim();
      }

      if (formData.production_level && formData.production_level.trim()) {
        data.production_level = formData.production_level.trim();
      }

      if (formData.search_metadata && formData.search_metadata.trim()) {
        data.search_metadata = formData.search_metadata.trim();
      }

      // Всегда отправляем tutorials (даже если пустой массив) для явной синхронизации
      data.tutorials = tutorials;

      if (video) {
        await videoReferencesAPI.update(video.id, data);
        toast.success('Video reference updated successfully');
      } else {
        await videoReferencesAPI.create(data);
        toast.success('Video reference created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving video reference:', error);
      toast.error(error.response?.data?.message || 'Error saving video reference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{video ? 'Edit Video Reference' : 'Add Video Reference'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="video-reference-form">
          <div className="form-section">
            <h3>Display Fields</h3>
            
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Source URL *</label>
              <input
                type="url"
                name="source_url"
                value={formData.source_url}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Preview URL</label>
              <input
                type="url"
                name="preview_url"
                value={formData.preview_url}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Public Summary</label>
              <textarea
                name="public_summary"
                value={formData.public_summary}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Duration (seconds)</label>
              <input
                type="number"
                name="duration_sec"
                value={formData.duration_sec}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="cinematic, vfx, typography"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Filter Fields</h3>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Platform (auto-detected)</label>
              <input
                type="text"
                name="platform"
                value={formData.platform}
                readOnly
                className="readonly"
              />
            </div>

            <div className="form-group">
              <label>Pacing</label>
              <select
                name="pacing"
                value={formData.pacing}
                onChange={handleChange}
              >
                <option value="">Select Pacing</option>
                <option value="slow">Slow</option>
                <option value="fast">Fast</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hook Type</label>
              <input
                type="text"
                name="hook_type"
                value={formData.hook_type}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Production Level</label>
              <select
                name="production_level"
                value={formData.production_level}
                onChange={handleChange}
              >
                <option value="">Select Level</option>
                <option value="low">Low</option>
                <option value="mid">Mid</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group checkboxes">
              <label>Flags:</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="has_visual_effects"
                    checked={formData.has_visual_effects}
                    onChange={handleChange}
                  />
                  Has Visual Effects
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="has_3d"
                    checked={formData.has_3d}
                    onChange={handleChange}
                  />
                  Has 3D
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="has_animations"
                    checked={formData.has_animations}
                    onChange={handleChange}
                  />
                  Has Animations
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="has_typography"
                    checked={formData.has_typography}
                    onChange={handleChange}
                  />
                  Has Typography
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="has_sound_design"
                    checked={formData.has_sound_design}
                    onChange={handleChange}
                  />
                  Has Sound Design
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Search Fields</h3>

            <div className="form-group">
              <label>Search Profile *</label>
              <textarea
                name="search_profile"
                value={formData.search_profile}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Search Metadata</label>
              <textarea
                name="search_metadata"
                value={formData.search_metadata}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Tutorials (Optional)</h3>
            {formData.tutorials.map((tutorial, index) => (
              <div key={index} className="tutorial-item">
                <div className="tutorial-header">
                  <h4>Tutorial {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeTutorial(index)}
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
                      className={`mode-btn ${(tutorial.mode || 'new') === 'new' ? 'active' : ''}`}
                      onClick={() => handleTutorialChange(index, 'mode', 'new')}
                    >
                      New
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${(tutorial.mode || 'new') === 'select' ? 'active' : ''}`}
                      onClick={() => handleTutorialChange(index, 'mode', 'select')}
                    >
                      Select
                    </button>
                  </div>
                </div>

                {(tutorial.mode || 'new') === 'select' ? (
                  // Режим Select: показываем селектор существующих tutorials
                  <>
                    <div className="form-group">
                      <label>Select Tutorial *</label>
                      <select
                        value={tutorial.tutorial_id || ''}
                        onChange={(e) => handleTutorialChange(index, 'tutorial_id', e.target.value)}
                      >
                        <option value="">Select Tutorial</option>
                        {tutorials.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label || `Tutorial #${t.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  // Режим New: показываем поля для создания нового tutorial
                  <>
                    <div className="form-group">
                      <label>Tutorial URL *</label>
                      <input
                        type="url"
                        value={tutorial.tutorial_url || ''}
                        onChange={(e) => handleTutorialChange(index, 'tutorial_url', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Label *</label>
                      <input
                        type="text"
                        value={tutorial.label || ''}
                        onChange={(e) => handleTutorialChange(index, 'label', e.target.value)}
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
                      onChange={(e) => handleTutorialChange(index, 'start_sec', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>End (sec)</label>
                    <input
                      type="number"
                      value={tutorial.end_sec || ''}
                      onChange={(e) => handleTutorialChange(index, 'end_sec', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTutorial}
              className="btn btn-secondary"
            >
              Add Tutorial
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : video ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoReferenceForm;

