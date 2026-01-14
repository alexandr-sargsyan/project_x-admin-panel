import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, getAdminMe } from '../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Логинимся
      const loginResponse = await login({ email, password });
      const { access_token } = loginResponse.data;

      // Сохраняем токен
      localStorage.setItem('auth_token', access_token);

      // Проверяем, является ли пользователь админом
      try {
        await getAdminMe();
        // Если успешно - пользователь админ, перенаправляем в админку
        navigate('/video-references');
        toast.success('Успешный вход в админ-панель');
      } catch (error) {
        // Если не админ - удаляем токен и показываем ошибку
        localStorage.removeItem('auth_token');
        toast.error('Доступ запрещен. Требуется роль администратора.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Ошибка входа';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Админ-панель</h1>
        <h2>Вход</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
