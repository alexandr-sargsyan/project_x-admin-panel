import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Categories from './pages/Categories';
import Login from './pages/Login';
import VideoReferences from './pages/VideoReferences';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/video-references" replace />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/video-references" element={<VideoReferences />} />
                  </Routes>
                </div>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
