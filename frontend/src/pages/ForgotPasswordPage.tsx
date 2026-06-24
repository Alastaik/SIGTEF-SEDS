import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { AxiosError } from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data || 'Se o e-mail existir, um link será enviado.');
    } catch (err) {
      setStatus('error');
      if (err instanceof AxiosError && err.response) {
        setMessage(err.response.data || 'Erro ao solicitar redefinição.');
      } else {
        setMessage('Erro de conexão.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">Esqueci a Senha</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Informe seu e-mail para receber as instruções.
        </p>
        
        {status === 'success' && <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">{message}</div>}
        {status === 'error' && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{message}</div>}

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
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {status === 'loading' ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
