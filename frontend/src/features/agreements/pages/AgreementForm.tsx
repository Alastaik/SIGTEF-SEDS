import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agreementService } from '../services/agreementService';
import { entityService } from '../../entities/services/entity.service';
import type { LegalEntity } from '../../entities/types/entity';
import { ArrowLeft, Save } from 'lucide-react';

export function AgreementForm() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    legalEntityId: '',
    agreementNumber: '',
    year: new Date().getFullYear(),
    seiProcessNumber: '',
    objectDescription: '',
    signatureDate: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const data = await entityService.getAll();
      // Only active entities should be able to get an agreement, but we fetch all and let the backend/user decide for now
      setEntities(data);
    } catch (err) {
      console.error('Failed to fetch entities', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.legalEntityId) throw new Error("Selecione uma Entidade");

      const created = await agreementService.createAgreement({
        legalEntityId: formData.legalEntityId,
        agreementNumber: formData.agreementNumber,
        year: formData.year,
        seiProcessNumber: formData.seiProcessNumber,
        objectDescription: formData.objectDescription,
        signatureDate: formData.signatureDate || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      });

      // Redirect to details
      navigate(`/admin/agreements/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar termo de fomento.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/agreements')}
          className="text-slate-400 hover:text-slate-600 transition-colors bg-white border border-slate-200 p-2 rounded-md"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Novo Termo de Fomento</h1>
          <p className="text-slate-500 mt-1">Crie um novo instrumento (Status Inicial: Rascunho)</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Entidade Vinculada <span className="text-red-500">*</span>
              </label>
              <select
                name="legalEntityId"
                value={formData.legalEntityId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Selecione a Entidade</option>
                {entities.map(ent => (
                  <option key={ent.id} value={ent.id}>
                    {ent.corporateName} (CNPJ: {ent.cnpj})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número do Termo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="agreementNumber"
                  value={formData.agreementNumber}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ano <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Processo SEI
                </label>
                <input
                  type="text"
                  name="seiProcessNumber"
                  value={formData.seiProcessNumber}
                  onChange={handleChange}
                  placeholder="Ex: 2024000000000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Objeto (Descrição)
              </label>
              <textarea
                name="objectDescription"
                value={formData.objectDescription}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Descrição resumida do objeto do termo de fomento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de Assinatura
                </label>
                <input
                  type="date"
                  name="signatureDate"
                  value={formData.signatureDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de Fim (Opcional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/agreements')}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar Termo (Rascunho)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
