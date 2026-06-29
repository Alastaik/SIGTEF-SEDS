import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Save, Plus, Trash2 } from 'lucide-react';
import { RequirePermission } from '../../features/auth/RequirePermission';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { useAuth } from '../../features/auth/AuthContext';

interface Region {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface City {
  id: string;
  ibgeCode: string;
  name: string;
  uf: string;
  region: Region | null;
  active: boolean;
}

export function RegionsCitiesPage() {
  const { user } = useAuth();
  const isAdminOrGestor = user?.authorities?.includes('ROLE_ADMIN') || user?.authorities?.includes('ROLE_GESTOR');

  const [activeTab, setActiveTab] = useState<'regions' | 'cities'>('regions');
  
  // Data
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regionsRes, citiesRes] = await Promise.all([
        api.get('/regions'),
        api.get('/cities')
      ]);
      setRegions(regionsRes.data);
      setCities(citiesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Regions ---
  const handleSelectRegion = (r: Region) => setSelectedRegion({ ...r });
  const handleNewRegion = () => {
    setSelectedRegion({
      id: '',
      name: '',
      description: '',
      active: true
    });
  };

  const handleSaveRegion = async () => {
    if (!selectedRegion) return;
    if (!selectedRegion.name) return alert('Nome da região é obrigatório.');
    setSaving(true);
    try {
      if (selectedRegion.id) {
        await api.put(`/regions/${selectedRegion.id}`, selectedRegion);
      } else {
        await api.post('/regions', selectedRegion);
      }
      alert('Região salva com sucesso!');
      await fetchData();
      setSelectedRegion(null);
    } catch (error) {
      alert('Erro ao salvar região.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRegion = async () => {
    if (!selectedRegion?.id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/regions/${selectedRegion.id}`);
      setShowDeleteModal(false);
      setSelectedRegion(null);
      await fetchData();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409 || error.response?.status === 500) {
        setDeleteError('Não é possível excluir esta região pois ela está em uso por um município ou entidade.');
      } else {
        setDeleteError('Erro ao excluir a região.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Handlers for Cities ---
  const handleSelectCity = (c: City) => setSelectedCity({ ...c });
  const handleNewCity = () => {
    setSelectedCity({
      id: '',
      ibgeCode: '',
      name: '',
      uf: 'GO',
      region: null,
      active: true
    });
  };

  const handleSaveCity = async () => {
    if (!selectedCity) return;
    if (!selectedCity.name || !selectedCity.ibgeCode || !selectedCity.region) {
      return alert('Nome, Código IBGE e Região são obrigatórios.');
    }
    setSaving(true);
    try {
      if (selectedCity.id) {
        await api.put(`/cities/${selectedCity.id}`, selectedCity);
      } else {
        await api.post('/cities', selectedCity);
      }
      alert('Município salvo com sucesso!');
      await fetchData();
      setSelectedCity(null);
    } catch (error) {
      alert('Erro ao salvar município.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCity = async () => {
    if (!selectedCity?.id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/cities/${selectedCity.id}`);
      setShowDeleteModal(false);
      setSelectedCity(null);
      await fetchData();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409 || error.response?.status === 500) {
        setDeleteError('Não é possível excluir este município pois ele está em uso.');
      } else {
        setDeleteError('Erro ao excluir o município.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const updateRegionField = (field: keyof Region, value: any) => {
    if (selectedRegion) setSelectedRegion({ ...selectedRegion, [field]: value });
  };

  const updateCityField = (field: keyof City, value: any) => {
    if (selectedCity) setSelectedCity({ ...selectedCity, [field]: value });
  };

  const handleDeleteClick = () => {
    if (!isAdminOrGestor) {
      alert('Você não tem permissão para excluir fisicamente. Use o botão ATIVO/INATIVO para realizar um soft delete.');
      return;
    }
    setShowDeleteModal(true);
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header com Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 pt-4 flex gap-6">
        <button 
          onClick={() => { setActiveTab('regions'); setSelectedCity(null); }}
          className={`pb-3 font-medium transition-colors ${activeTab === 'regions' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Regiões
        </button>
        <button 
          onClick={() => { setActiveTab('cities'); setSelectedRegion(null); }}
          className={`pb-3 font-medium transition-colors ${activeTab === 'cities' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Municípios
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'regions' && (
          <>
            {/* Lista de Regiões */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col h-full bg-white">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Mesorregiões</h3>
                <button onClick={handleNewRegion} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {regions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRegion(r)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selectedRegion?.id === r.id ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{r.name}</span>
                      {!r.active && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold">INATIVO</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form de Edição de Região */}
            <div className="w-2/3 p-6 overflow-y-auto">
              {selectedRegion ? (
                <div className="max-w-xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <h2 className="text-xl font-bold text-slate-800">{selectedRegion.id ? 'Editar Região' : 'Nova Região'}</h2>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-600">Status:</span>
                      <button 
                        onClick={() => updateRegionField('active', !selectedRegion.active)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selectedRegion.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {selectedRegion.active ? 'ATIVO' : 'INATIVO'}
                      </button>
                      {selectedRegion.id && (
                        <button 
                          onClick={handleDeleteClick}
                          className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors ml-2"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Região</label>
                      <input type="text" value={selectedRegion.name} onChange={e => updateRegionField('name', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                      <textarea rows={3} value={selectedRegion.description} onChange={e => updateRegionField('description', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button onClick={handleSaveRegion} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                      <Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  Selecione uma região ao lado para visualizar e editar.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'cities' && (
          <>
            {/* Lista de Municípios */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col h-full bg-white">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Municípios</h3>
                <button onClick={handleNewCity} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {cities.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCity(c)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selectedCity?.id === c.id ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{c.name}</span>
                      {!c.active && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold">INATIVO</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{c.uf} - {c.region?.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form de Edição de Município */}
            <div className="w-2/3 p-6 overflow-y-auto">
              {selectedCity ? (
                <div className="max-w-xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <h2 className="text-xl font-bold text-slate-800">{selectedCity.id ? 'Editar Município' : 'Novo Município'}</h2>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-600">Status:</span>
                      <button 
                        onClick={() => updateCityField('active', !selectedCity.active)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selectedCity.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {selectedCity.active ? 'ATIVO' : 'INATIVO'}
                      </button>
                      {selectedCity.id && (
                        <button 
                          onClick={handleDeleteClick}
                          className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors ml-2"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Município</label>
                      <input type="text" value={selectedCity.name} onChange={e => updateCityField('name', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Código IBGE</label>
                      <input type="text" value={selectedCity.ibgeCode} onChange={e => updateCityField('ibgeCode', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estado (UF)</label>
                      <select value={selectedCity.uf} onChange={e => updateCityField('uf', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2">
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Região</label>
                      <select 
                        value={selectedCity.region?.id || ''} 
                        onChange={e => {
                          const r = regions.find(x => x.id === e.target.value);
                          updateCityField('region', r || null);
                        }} 
                        className="w-full rounded border border-slate-300 px-3 py-2"
                      >
                        <option value="">Selecione uma região...</option>
                        {regions.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button onClick={handleSaveCity} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                      <Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  Selecione um município ao lado para visualizar e editar.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteError(null); }}
        onConfirm={activeTab === 'regions' ? handleDeleteRegion : handleDeleteCity}
        title={`Excluir ${activeTab === 'regions' ? 'Região' : 'Município'}`}
        message={deleteError || `Tem certeza que deseja excluir permanentemente este registro?`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
