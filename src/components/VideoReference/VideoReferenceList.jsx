import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { videoReferencesAPI } from '../../services/api';
import VideoReferenceForm from './VideoReferenceForm';
import ConfirmModal from '../ConfirmModal';
import './VideoReferenceList.css';

const VideoReferenceList = () => {
  const [videoReferences, setVideoReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchSourceUrl, setSearchSourceUrl] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, videoId: null, videoTitle: '' });

  useEffect(() => {
    loadVideoReferences();
  }, []);

  const loadVideoReferences = async () => {
    try {
      setLoading(true);
      const response = await videoReferencesAPI.getAll();
      setVideoReferences(response.data.data);
    } catch (error) {
      console.error('Error loading video references:', error);
      toast.error('Error loading video references');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId && !searchSourceUrl) {
      loadVideoReferences();
      return;
    }

    try {
      setLoading(true);
      const response = await videoReferencesAPI.search(searchId, searchSourceUrl);
      setVideoReferences(response.data.data);
    } catch (error) {
      console.error('Error searching video references:', error);
      toast.error('Error searching video references');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVideo(null);
    setShowForm(true);
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleDeleteClick = (id, title) => {
    setConfirmModal({
      isOpen: true,
      videoId: id,
      videoTitle: title,
    });
  };

  const handleDeleteConfirm = async () => {
    const { videoId } = confirmModal;
    
    try {
      await videoReferencesAPI.delete(videoId);
      toast.success('Video reference deleted successfully');
      setConfirmModal({ isOpen: false, videoId: null, videoTitle: '' });
      loadVideoReferences();
    } catch (error) {
      console.error('Error deleting video reference:', error);
      toast.error('Error deleting video reference');
      setConfirmModal({ isOpen: false, videoId: null, videoTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, videoId: null, videoTitle: '' });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVideo(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadVideoReferences();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="video-reference-list">
      <div className="page-header">
        <h1>Video References</h1>
        <button onClick={handleAdd} className="btn btn-primary">
          Add Video Reference
        </button>
      </div>

      <div className="search-section">
        <div className="search-group">
          <label>Search by ID:</label>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter ID"
          />
        </div>
        <div className="search-group">
          <label>Search by Source URL:</label>
          <input
            type="text"
            value={searchSourceUrl}
            onChange={(e) => setSearchSourceUrl(e.target.value)}
            placeholder="Enter Source URL"
          />
        </div>
        <button onClick={handleSearch} className="btn btn-search">
          Search
        </button>
        <button onClick={loadVideoReferences} className="btn btn-secondary">
          Reset
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Source URL</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videoReferences.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-state">
                No video references found
              </td>
            </tr>
          ) : (
            videoReferences.map((video) => (
              <tr key={video.id}>
                <td>{video.id}</td>
                <td>{video.title}</td>
                <td>
                  <a href={video.source_url} target="_blank" rel="noopener noreferrer">
                    {video.source_url}
                  </a>
                </td>
                <td>{video.category?.name || '-'}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleEdit(video)}
                    className="btn btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(video.id, video.title)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showForm && (
        <VideoReferenceForm
          video={editingVideo}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Video Reference"
        message={`Are you sure you want to delete video reference "${confirmModal.videoTitle}"?`}
      />
    </div>
  );
};

export default VideoReferenceList;

