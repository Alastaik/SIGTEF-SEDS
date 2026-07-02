import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit2, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { accountabilityApi, itemApi } from '../../accountability/api';
import type { FiscalDocumentItem, Item } from '../../accountability/api';

export function WizardDocumentCard({ doc, executionId, onUpdate, onRemove, categories = [], itemsByCategory = {}, setItemsByCategory }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [docForm, setDocForm] = useState({ ...doc });
  const [saving, setSaving] = useState(false);

  // Item Form State
  const [localItems, setLocalItems] = useState<FiscalDocumentItem[]>(doc.items || []);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [itemSearchName, setItemSearchName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false);

  const requiresItemization = doc.documentType !== 'Comprovante';

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

  const handleCatChange = (e: any) => {
    const catId = e.target.value;
    setSelectedCat(catId);
    setSelectedItem('');
    setItemSearchName('');
    setIsCreatingNewItem(false);
  };

  const handleItemChange = (e: any) => {
    const val = e.target.value;
    setItemSearchName(val);
    if (val === '+ Criar Novo Item...') {
      setIsCreatingNewItem(true);
      setSelectedItem('');
      setItemSearchName('');
    } else {
      setIsCreatingNewItem(false);
      const found = itemsByCategory[selectedCat]?.find((i: Item) => `${i.name} (${i.unitOfMeasurement || '-'})` === val) || 
                    itemsByCategory['']?.find((i: Item) => `${i.name} (${i.unitOfMeasurement || '-'})` === val);
      if (found) {
        setSelectedItem(found.id);
      } else {
        setSelectedItem('');
      }
    }
  };

  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) {
      alert("Selecione uma categoria primeiro");
      return;
    }
    const name = (document.getElementById(`new-item-name-${doc.id}`) as HTMLInputElement).value;
    const unit = (document.getElementById(`new-item-unit-${doc.id}`) as HTMLInputElement).value;
    try {
      const created = await itemApi.createItem(selectedCat, name, unit, executionId);
      if (setItemsByCategory) {
        setItemsByCategory((prev: any) => {
          const catItems = prev[selectedCat] || [];
          const allItems = prev[''] || [];
          return {
            ...prev,
            [selectedCat]: [...catItems, created],
            '': [...allItems, created]
          };
        });
      }
      setSelectedItem(created.id);
      setItemSearchName(`${created.name} (${created.unitOfMeasurement || '-'})`);
      setIsCreatingNewItem(false);
    } catch (err) {
      console.error('Failed to create item', err);
      alert('Erro ao criar novo item.');
    }
  };

  const handleAddItem = async () => {
    const finalItem = itemsByCategory['']?.find((i: Item) => i.id === selectedItem);
    if (!finalItem || !quantity || !unitPrice) return;

    const newItem: FiscalDocumentItem = {
      id: crypto.randomUUID(),
      item: finalItem,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalPrice: Number(quantity) * Number(unitPrice)
    };

    const newItems = [...localItems, newItem];
    setLocalItems(newItems);
    setSelectedItem('');
    setItemSearchName('');
    setQuantity('');
    setUnitPrice('');
    
    try {
      const updatedDoc = { ...doc, items: newItems };
      const res = await accountabilityApi.updateFiscalDocument(executionId, doc.id, updatedDoc);
      onUpdate(res);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item.');
    }
  };

  const removeLocalItem = async (itemId: string) => {
    const newItems = localItems.filter(i => i.id !== itemId);
    setLocalItems(newItems);
    try {
      const updatedDoc = { ...doc, items: newItems };
      const res = await accountabilityApi.updateFiscalDocument(executionId, doc.id, updatedDoc);
      onUpdate(res);
    } catch (err) {
      console.error(err);
      alert('Erro ao remover item.');
    }
  };

  const totalItemsValue = localItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

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
            <p className="font-semibold text-gray-900">{doc.documentType === 'Comprovante' ? '' : 'Nº '} {doc.documentNumber}</p>
            <p className="text-xs text-gray-500 mt-0.5">{doc.issuerName}</p>
          </div>
          {doc.reviewStatus === 'INCORRECT' && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 border border-red-200 rounded flex items-center gap-1">
              <AlertTriangle size={12}/> Correção Necessária
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {doc.documentType !== 'Comprovante' && (
            <div className="text-right">
              <span className="block font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
              </span>
              <span className="text-xs text-gray-400">Valor do Documento</span>
            </div>
          )}
          
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
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-6">
          {doc.reviewStatus === 'INCORRECT' && doc.reviewComments && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium mb-1">Motivo da recusa (SEDS):</p>
              <p className="text-sm text-red-700">{doc.reviewComments}</p>
            </div>
          )}

          {/* Form de edição do documento */}
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {doc.documentType !== 'Comprovante' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Identificação / Transação</label>
                      <input
                        type="text" required
                        value={docForm.documentNumber}
                        onChange={e => setDocForm({...docForm, documentNumber: e.target.value})}
                        className="block w-full rounded-md border-gray-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pagador / Conta</label>
                      <input
                        type="text" required
                        value={docForm.issuerName}
                        onChange={e => setDocForm({...docForm, issuerName: e.target.value})}
                        className="block w-full rounded-md border-gray-300 text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded">Salvar Alterações</button>
              </div>
            </div>
          ) : (
            <div>
              {doc.documentType !== 'Comprovante' && (
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
              )}
              
              <div className="flex justify-end">
                <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded inline-flex items-center">
                  <Edit2 size={14} className="mr-1" /> Editar Dados
                </button>
              </div>
            </div>
          )}

          {/* Itemização */}
          {requiresItemization && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Detalhamento de Itens</h4>
                <div className={`text-sm ${totalItemsValue > doc.value ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                  Soma: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalItemsValue)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
                </div>
              </div>

              {!isEditing && (
                <div className="bg-white p-4 rounded border border-gray-200 mb-4 shadow-sm">
                  {isCreatingNewItem ? (
                    <form onSubmit={handleCreateNewItem} className="bg-blue-50 p-3 rounded border border-blue-100 mb-4 text-sm">
                      <p className="font-semibold text-blue-800 mb-2">Cadastrar Novo Item na SEDS</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-blue-900">Nome do Item</label>
                          <input id={`new-item-name-${doc.id}`} required className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-900">Unidade de Medida (Ex: Unidade, Kg, Serviço)</label>
                          <input id={`new-item-unit-${doc.id}`} required className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setIsCreatingNewItem(false); setItemSearchName(''); }} className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded">Cancelar</button>
                        <button type="submit" className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded">Salvar e Selecionar</button>
                      </div>
                    </form>
                  ) : null}

                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
                      <select
                        value={selectedCat}
                        onChange={handleCatChange}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      >
                        <option value="">Todas as Categorias</option>
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Item</label>
                      <input
                        list={`items-list-${doc.id}`}
                        value={itemSearchName}
                        onChange={handleItemChange}
                        placeholder="Pesquisar ou criar novo..."
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      />
                      <datalist id={`items-list-${doc.id}`}>
                        <option value="+ Criar Novo Item..." />
                        {(itemsByCategory[selectedCat] || itemsByCategory[''] || []).map((i: Item) => (
                          <option key={i.id} value={`${i.name} (${i.unitOfMeasurement || '-'})`} />
                        ))}
                      </datalist>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Qtd</label>
                      <input
                        type="number" step="0.01"
                        value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Preço Unit. (R$)</label>
                      <input
                        type="number" step="0.01"
                        value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        disabled={!selectedItem || !quantity || !unitPrice}
                        className="w-full h-[38px] flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {localItems.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Val. Unit</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {localItems.map((fi, idx) => (
                        <tr key={fi.id || idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 flex flex-col">
                            <span>{fi.item.name}</span>
                            <span className="text-xs text-gray-500">{fi.item.category.name} | {fi.item.unitOfMeasurement}</span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{fi.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fi.unitPrice)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fi.totalPrice)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => removeLocalItem(fi.id!)} className="text-red-600 hover:text-red-900">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
