import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Save, Plus } from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  code: string;
  context: string;
  description: string;
  requiresExpiration: boolean;
  requiresSei: boolean;
  requiresSignature: boolean;
  
  // Novos campos de Expurgo
  categoriaDocumento: string;
  exigeDadosNotaFiscal: boolean;
  exigeChaveAcessoNfe: boolean;
  ehXmlFiscal: boolean;
  ehAnexoPesado: boolean;
  expurgavel: boolean;
  retencaoDias: number | null;
  compactarAposUpload: boolean;
  permiteMultiplosAnexos: boolean;
  
  active: boolean;
}

export function DocumentTypesPage() {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DocumentType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await api.get('/document-types');
      setTypes(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (t: DocumentType) => {
    setSelected({ ...t }); // copia
  };

  const handleNew = () => {
    setSelected({
      id: '',
      name: '',
      code: '',
      context: 'PRESTACAO',
      description: '',
      requiresExpiration: false,
      requiresSei: false,
      requiresSignature: false,
      categoriaDocumento: 'GERAL',
      exigeDadosNotaFiscal: false,
      exigeChaveAcessoNfe: false,
      ehXmlFiscal: false,
      ehAnexoPesado: true,
      expurgavel: true,
      retencaoDias: 90,
      compactarAposUpload: false,
      permiteMultiplosAnexos: true,
      active: true
    });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (selected.id) {
        await api.put(`/document-types/${selected.id}`, selected);
      } else {
        await api.post('/document-types', selected);
      }
      alert('Salvo com sucesso!');
      await fetchTypes();
      setSelected(null);
    } catch (error) {
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof DocumentType, value: any) => {
    if (selected) {
      setSelected({ ...selected, [field]: value });
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="flex h-full">
      {/* Lista lateral */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col h-full bg-white">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Tipos Documento</h3>
          <button onClick={handleNew} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selected?.id === t.id ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}
            >
              <div className="flex justify-between items-center">
                <span>{t.name}</span>
                {!t.active && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold">INATIVO</span>}
              </div>
              <div className="text-xs text-slate-400 mt-1">{t.code}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form de edição */}
      <div className="w-2/3 p-6 overflow-y-auto bg-slate-50/50">
        {selected ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-800">{selected.id ? 'Editar Documento' : 'Novo Documento'}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-600">Status:</span>
                <button 
                  onClick={() => updateField('active', !selected.active)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selected.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {selected.active ? 'ATIVO' : 'INATIVO'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Documento</label>
                <input type="text" value={selected.name} onChange={e => updateField('name', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código Único</label>
                <input type="text" value={selected.code} onChange={e => updateField('code', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contexto / Módulo</label>
                <select value={selected.context} onChange={e => updateField('context', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2">
                  <option value="PRESTACAO">PRESTACAO</option>
                  <option value="TERMO">TERMO</option>
                  <option value="ENTIDADE">ENTIDADE</option>
                  <option value="FISCALIZACAO">FISCALIZACAO</option>
                </select>
              </div>
            </div>

            {/* Configurações de Retenção e Expurgo */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Save size={18} className="text-slate-500" />
                Retenção e Expurgo (Storage Local)
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.expurgavel} onChange={e => updateField('expurgavel', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Expurgável</span>
                    <span className="text-xs text-slate-500">Apagar arquivo após prazo?</span>
                  </div>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dias de Retenção (após aprovação)</label>
                  <input type="number" disabled={!selected.expurgavel} value={selected.retencaoDias || ''} onChange={e => updateField('retencaoDias', parseInt(e.target.value))} className="w-full rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.ehAnexoPesado} onChange={e => updateField('ehAnexoPesado', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Anexo Pesado</span>
                    <span className="text-xs text-slate-500">Afeta cálculo de limite de disco.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.compactarAposUpload} onChange={e => updateField('compactarAposUpload', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Compactar (ZIP)</span>
                    <span className="text-xs text-slate-500">Compactar silenciosamente após upload.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Regras de Validação NF-e */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Regras de Validação Fiscal</h3>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.exigeDadosNotaFiscal} onChange={e => updateField('exigeDadosNotaFiscal', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Exige Dados da NF</span>
                    <span className="text-xs text-slate-500">Formulário extra de valores da nota.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.exigeChaveAcessoNfe} onChange={e => updateField('exigeChaveAcessoNfe', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Exige Chave NF-e</span>
                    <span className="text-xs text-slate-500">Obrigatório 44 dígitos.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.ehXmlFiscal} onChange={e => updateField('ehXmlFiscal', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">É XML Fiscal (.xml)</span>
                    <span className="text-xs text-slate-500">Forçar extração automática.</span>
                  </div>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria (Classificação)</label>
                  <select value={selected.categoriaDocumento || 'GERAL'} onChange={e => updateField('categoriaDocumento', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm">
                    <option value="GERAL">Geral</option>
                    <option value="FISCAL">Fiscal (NF/NFe/Recibo)</option>
                    <option value="FINANCEIRO">Financeiro (Comprovante)</option>
                    <option value="OFICIAL">Oficial (Termo/Ofício)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Selecione um Tipo de Documento ao lado para configurar regras de retenção e expurgo.
          </div>
        )}
      </div>
    </div>
  );
}
