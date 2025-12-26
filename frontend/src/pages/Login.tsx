import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      login(res.data.accessToken, res.data.user);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Magic Sandbox</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-80">
        <h2 className="text-xl mb-4">Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded font-bold">Log In</button>
        <div className="mt-4 text-sm text-center">
          <Link to="/register" className="text-blue-400 hover:underline">Create account</Link>
        </div>
      </form>
    </div>
  );
}
