import React, { useState, useEffect } from 'react';
import './CategoryModal.css';

const CategoryModal = ({ 
  isOpen, 
  onClose, 
  categories = [], 
  selectedCategoryIds = [], 
  onSave 
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedCategoryIds);

  // Синхронизируем с пропсами
  useEffect(() => {
    setLocalSelectedIds(selectedCategoryIds);
  }, [selectedCategoryIds]);

  // Восстанавливаем состояние открытых категорий из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('expandedCategories');
    if (saved) {
      try {
        setExpandedCategories(JSON.parse(saved));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const toggleCategory = (categoryId) => {
    setLocalSelectedIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) => {
      const newState = {
        ...prev,
        [categoryId]: !prev[categoryId],
      };
      localStorage.setItem('expandedCategories', JSON.stringify(newState));
      return newState;
    });
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && Array.isArray(category.children) && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];
    const isSelected = localSelectedIds.includes(category.id);

    return (
      <div key={category.id} className="category-item">
        <div
          className={`category-row ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              toggleCategory(category.id);
            }}
            onClick={(e) => e.stopPropagation()}
            className="category-checkbox"
          />
          
          <label
            onClick={() => toggleCategory(category.id)}
            className="category-label"
          >
            {category.name}
          </label>
          
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategoryExpand(category.id);
              }}
              className="category-expand-btn"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="category-children">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootCategories = categories.filter(cat => !cat.parent_id);

  const handleSave = () => {
    onSave(localSelectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="category-modal-overlay" onClick={onClose}>
      <div className="category-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="category-modal-header">
          <h3>Select Categories</h3>
          <button
            onClick={onClose}
            className="category-modal-close-btn"
          >
            ×
          </button>
        </div>
        
        <div className="category-modal-body">
          {rootCategories.length > 0 ? (
            rootCategories.map((category) => renderCategory(category))
          ) : (
            <div className="category-empty-message">
              No categories available
            </div>
          )}
        </div>

        <div className="category-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="category-modal-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="category-modal-save-btn"
          >
            Save ({localSelectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
