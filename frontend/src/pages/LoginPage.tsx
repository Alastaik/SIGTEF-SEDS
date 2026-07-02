import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { api } from '../lib/api';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      navigate(res.data.userType === 'EXTERNO' ? '/portal' : '/admin');
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data || 'Erro ao realizar login.');
      } else {
        setError('Erro de conexão.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="flex flex-col items-center justify-center mb-6">
          <img 
            src="/logo-seds.png" 
            alt="SEDS Logo" 
            className="h-16 mb-4 object-contain" 
          />
          <h1 className="text-center text-2xl font-bold text-slate-800">Login SIGTEF</h1>
        </div>
        
        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Esqueci a senha
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
