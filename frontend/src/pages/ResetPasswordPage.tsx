import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { AxiosError } from 'axios';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de redefinição não fornecido na URL.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('As senhas não coincidem.');
      return;
    }

    setStatus('loading');
    setMessage('');
    
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      setStatus('success');
      setMessage(res.data || 'Senha redefinida com sucesso.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus('error');
      if (err instanceof AxiosError && err.response) {
        setMessage(err.response.data || 'Erro ao redefinir a senha.');
      } else {
        setMessage('Erro de conexão.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">Redefinir Senha</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Informe sua nova senha abaixo.
        </p>
        
        {status === 'success' && <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">{message} Redirecionando para o login...</div>}
        {status === 'error' && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nova Senha</label>
            <input
              type="password"
              className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!token || status === 'success'}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirmar Nova Senha</label>
            <input
              type="password"
              className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!token || status === 'success'}
            />
          </div>
          
          <button
            type="submit"
            disabled={!token || status === 'loading' || status === 'success'}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {status === 'loading' ? 'Salvando...' : 'Salvar Nova Senha'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Ir para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
