import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { entityService } from '../services/entity.service';
import type { LegalEntityCreateDTO } from '../types/entity';
import { Save, X } from 'lucide-react';
import { api } from '../../../lib/api';

export function EntityForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [cities, setCities] = useState<any[]>([]);
  const [natures, setNatures] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<LegalEntityCreateDTO>({
    cnpj: '',
    corporateName: '',
    tradeName: ''
  });

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [citiesRes, naturesRes] = await Promise.all([
          api.get('/cities'),
          api.get('/domain-data/type/NATUREZA_ATENDIMENTO')
        ]);
        setCities(citiesRes.data);
        setNatures(naturesRes.data);
      } catch (err) {
        console.error('Error fetching select options:', err);
      }
    };
    fetchSelectData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // CNPJ Mask
    if (name === 'cnpj') {
      let v = value.replace(/\D/g, '');
      if (v.length > 14) v = v.substring(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
      setFormData(prev => ({ ...prev, [name]: v }));
      return;
    }

    if (name === 'attendanceNatureId' || name === 'mainCityId') {
      const field = name === 'attendanceNatureId' ? 'attendanceNature' : 'mainCity';
      setFormData(prev => ({
        ...prev,
        [field]: value ? { id: value } : undefined
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remove mask before sending
      const submitData = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, '')
      };

      if (submitData.cnpj.length !== 14) {
        throw new Error('CNPJ deve conter 14 dígitos.');
      }
      
      if (!submitData.mainCity?.id) {
        throw new Error('Selecione o Município Sede.');
      }
      if (!submitData.attendanceNature?.id) {
        throw new Error('Selecione a Natureza de Atendimento.');
      }

      const created = await entityService.create(submitData);
      // Redireciona para a tela de detalhes da nova entidade
      navigate(`/admin/entities/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao criar entidade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nova Entidade</h1>
        <p className="text-slate-500">Cadastre os dados base de uma nova organização.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-slate-700 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                required
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="corporateName" className="block text-sm font-medium text-slate-700 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                id="corporateName"
                name="corporateName"
                required
                value={formData.corporateName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="tradeName" className="block text-sm font-medium text-slate-700 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                id="tradeName"
                name="tradeName"
                value={formData.tradeName || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="attendanceNatureId" className="block text-sm font-medium text-slate-700 mb-1">
                  Natureza de Atendimento *
                </label>
                <select
                  id="attendanceNatureId"
                  name="attendanceNatureId"
                  required
                  value={formData.attendanceNature?.id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Selecione...</option>
                  {natures.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mainCityId" className="block text-sm font-medium text-slate-700 mb-1">
                  Município Sede *
                </label>
                <select
                  id="mainCityId"
                  name="mainCityId"
                  required
                  value={formData.mainCity?.id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Selecione o Município...</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.stateCode}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/entities')}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Salvando...' : 'Salvar Entidade'}
          </button>
        </div>
      </form>
    </div>
  );
}
