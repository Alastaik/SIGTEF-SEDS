import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { entityService } from '../entities/services/entity.service';
import { Building2 } from 'lucide-react';

export function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!formData.acceptedTerms) {
      setError('Você deve aceitar os termos de responsabilidade.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await entityService.acceptInvitation({
        token: token!,
        password: formData.password,
        acceptedTerms: formData.acceptedTerms
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar o convite. Ele pode ter expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Acesso Liberado!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sua conta foi criada e vinculada com sucesso. Você será redirecionado para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <Building2 size={32} />
            <span className="text-2xl font-bold tracking-tight">SIGTEF</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mb-6">
          <img 
            src="https://goias.gov.br/social/wp-content/uploads/sites/24/2019/07/logo_seds_-_aplicacao_brasao_b-510-768x434.png" 
            alt="SEDS Logo" 
            className="h-16 mb-4 object-contain" 
          />
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Aceitar Convite
          </h2>
        </div>
        <p className="mt-2 text-center text-sm text-slate-600">
          Crie sua senha de acesso ao Portal da Entidade
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Nova Senha</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="block w-full rounded-lg border-slate-300 py-2.5 px-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirmar Senha</label>
              <div className="mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="block w-full rounded-lg border-slate-300 py-2.5 px-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                />
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={formData.acceptedTerms}
                  onChange={e => setFormData({...formData, acceptedTerms: e.target.checked})}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-slate-700">
                  Aceito os termos de responsabilidade
                </label>
                <p className="text-slate-500 mt-1">
                  Declaro que as informações enviadas por mim neste portal são verdadeiras e me responsabilizo legalmente pelas prestações de contas enviadas em nome da entidade.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center items-center gap-2 rounded-lg bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Processando...' : (
                <>Aceitar e Entrar <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
