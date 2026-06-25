import { useState } from 'react';
import type { LegalEntity, AddressType } from '../../types/entity';
import { entityService } from '../../services/entity.service';
import { MapPin, Plus, Search, Building2, Map, Home, FileText } from 'lucide-react';

interface Props {
  entity: LegalEntity;
  onUpdate: () => void;
}

export function EntityAddressesTab({ entity, onUpdate }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [cep, setCep] = useState('');
  const [formData, setFormData] = useState({
    addressType: 'SEDE' as AddressType,
    cityId: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    zipCode: '',
    isMain: false,
  });

  const handleCepSearch = async () => {
    if (cep.replace(/\D/g, '').length !== 8) return;
    try {
      const data = await entityService.searchCep(cep);
      setFormData(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        zipCode: data.cep || prev.zipCode,
        // Em um sistema real, aqui você faria o de-para do código IBGE (data.ibge) para o ID da sua tabela City
      }));
    } catch (err) {
      console.error('Erro ao buscar CEP', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await entityService.addAddress(entity.id, {
        ...formData,
        zipCode: cep.replace(/\D/g, ''),
        // Mocking a cityId for now since we don't have the city selector implemented
        cityId: '00000000-0000-0000-0000-000000000000' 
      });
      setIsModalOpen(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar endereço');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAddressIcon = (type: AddressType) => {
    switch(type) {
      case 'SEDE': return <Building2 className="w-5 h-5 text-indigo-500" />;
      case 'FILIAL': return <Map className="w-5 h-5 text-blue-500" />;
      case 'CORRESPONDENCIA': return <FileText className="w-5 h-5 text-emerald-500" />;
      default: return <Home className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Endereços Cadastrados</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Endereço
        </button>
      </div>

      {entity.addresses && entity.addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entity.addresses.map(addr => (
            <div key={addr.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors bg-white relative overflow-hidden group">
              {addr.isMain && (
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-bl-lg">
                  Principal
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                  {getAddressIcon(addr.addressType)}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">{addr.street}, {addr.number}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {addr.neighborhood} - CEP: {addr.zipCode}
                  </p>
                  {addr.complement && (
                    <p className="text-sm text-slate-500">{addr.complement}</p>
                  )}
                  <p className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-wider">
                    {addr.addressType}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-slate-800">Nenhum endereço cadastrado</h3>
          <p className="text-sm text-slate-500 mt-1">Adicione o endereço da sede da organização.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Novo Endereço</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={cep}
                      onChange={e => setCep(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="00000-000"
                    />
                    <button
                      type="button"
                      onClick={handleCepSearch}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Endereço</label>
                  <select
                    required
                    value={formData.addressType}
                    onChange={e => setFormData({...formData, addressType: e.target.value as AddressType})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="SEDE">Sede</option>
                    <option value="FILIAL">Filial</option>
                    <option value="CORRESPONDENCIA">Correspondência</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logradouro</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={e => setFormData({...formData, street: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    required
                    value={formData.neighborhood}
                    onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={e => setFormData({...formData, complement: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMain}
                    onChange={e => setFormData({...formData, isMain: e.target.checked})}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Definir como endereço principal
                </label>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Endereço'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
