import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit2, CheckCircle, AlertTriangle } from 'lucide-react';
import { accountabilityApi } from '../../accountability/api';

export function WizardDocumentCard({ doc, executionId, onUpdate, onRemove }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [docForm, setDocForm] = useState({ ...doc });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await accountabilityApi.updateFiscalDocument(executionId, doc.id, docForm);
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating document', error);
      alert('Erro ao atualizar documento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden border-gray-200 mb-4`}>
      <div
        className="px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
            {doc.documentType}
          </span>
          <div>
            <p className="font-semibold text-gray-900">Nº {doc.documentNumber}</p>
            <p className="text-xs text-gray-500 mt-0.5">{doc.issuerName}</p>
          </div>
          {doc.reviewStatus === 'INCORRECT' && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 border border-red-200 rounded flex items-center gap-1">
              <AlertTriangle size={12}/> Correção Necessária
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
            </span>
            <span className="text-xs text-gray-400">Valor do Documento</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(doc.id);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
          {doc.reviewStatus === 'INCORRECT' && doc.reviewComments && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium mb-1">Motivo da recusa (SEDS):</p>
              <p className="text-sm text-red-700">{doc.reviewComments}</p>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                  <select
                    value={docForm.documentType}
                    onChange={e => setDocForm({...docForm, documentType: e.target.value})}
                    className="block w-full rounded-md border-gray-300 text-sm"
                  >
                    <option value="NF-e">NF-e (Nota Fiscal Eletrônica)</option>
                    <option value="NFS-e">NFS-e (Nota Fiscal de Serviços)</option>
                    <option value="Recibo">Recibo Simples</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número do Documento</label>
                  <input
                    type="text"
                    value={docForm.documentNumber}
                    onChange={e => setDocForm({...docForm, documentNumber: e.target.value})}
                    className="block w-full rounded-md border-gray-300 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor / Emissor</label>
                  <input
                    type="text"
                    value={docForm.issuerName}
                    onChange={e => setDocForm({...docForm, issuerName: e.target.value})}
                    className="block w-full rounded-md border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ do Emissor</label>
                  <input
                    type="text"
                    value={docForm.issuerCnpj || ''}
                    onChange={e => setDocForm({...docForm, issuerCnpj: e.target.value})}
                    className="block w-full rounded-md border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    value={docForm.value}
                    onChange={e => setDocForm({...docForm, value: parseFloat(e.target.value)})}
                    className="block w-full rounded-md border-gray-300 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded">Salvar Alterações</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Data de Emissão</p>
                  <p className="font-medium text-gray-900">{doc.issueDate ? new Date(doc.issueDate).toLocaleDateString('pt-BR') : 'Não informada'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Chave de Acesso</p>
                  <p className="font-medium text-gray-900">{doc.accessKey || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">CNPJ</p>
                  <p className="font-medium text-gray-900">{doc.issuerCnpj || '-'}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded inline-flex items-center">
                  <Edit2 size={14} className="mr-1" /> Editar Dados
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
