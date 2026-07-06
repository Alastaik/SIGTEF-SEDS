import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { LegalEntity, ContactType } from '../../types/entity';
import { entityService } from '../../services/entity.service';
import { Plus, Mail, Phone, Smartphone, MessageCircle, Building } from 'lucide-react';

interface Props {
  entity: LegalEntity;
  onUpdate: () => void;
}

export function EntityContactsTab({ entity, onUpdate }: Props) {
  const { id: entityId } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    contactType: 'EMAIL' as ContactType,
    value: '',
    description: '',
    isMain: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await entityService.addContact(entityId!, formData);
      setIsModalOpen(false);
      onUpdate();
      setFormData({ contactType: 'EMAIL', value: '', description: '', isMain: false });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar contato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContactIcon = (type: ContactType) => {
    switch(type) {
      case 'EMAIL': return <Mail className="w-5 h-5 text-indigo-500" />;
      case 'TELEFONE': return <Phone className="w-5 h-5 text-emerald-500" />;
      case 'CELULAR': return <Smartphone className="w-5 h-5 text-blue-500" />;
      case 'WHATSAPP': return <MessageCircle className="w-5 h-5 text-green-500" />;
      default: return <Building className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Contatos da Entidade</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Contato
        </button>
      </div>

      {entity.contacts && entity.contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entity.contacts.map(contact => (
            <div key={contact.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors bg-white relative overflow-hidden group">
              {contact.isMain && (
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-bl-lg">
                  Principal
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                  {getContactIcon(contact.contactType)}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">{contact.value}</h3>
                  {contact.description && (
                    <p className="text-sm text-slate-500 mt-1">{contact.description}</p>
                  )}
                  <p className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-wider">
                    {contact.contactType}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-slate-800">Nenhum contato cadastrado</h3>
          <p className="text-sm text-slate-500 mt-1">Adicione os telefones e e-mails da organização.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Novo Contato</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Contato</label>
                <select
                  required
                  value={formData.contactType}
                  onChange={e => setFormData({...formData, contactType: e.target.value as ContactType})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="EMAIL">E-mail</option>
                  <option value="TELEFONE">Telefone Fixo</option>
                  <option value="CELULAR">Celular</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                <input
                  type={formData.contactType === 'EMAIL' ? 'email' : 'text'}
                  required
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={formData.contactType === 'EMAIL' ? 'email@exemplo.com' : '(00) 00000-0000'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Recepção, Diretoria, Financeiro"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMain}
                    onChange={e => setFormData({...formData, isMain: e.target.checked})}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Definir como contato principal
                </label>
                
                <div className="flex gap-3 justify-end mt-2">
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
                    {isSubmitting ? 'Salvando...' : 'Salvar Contato'}
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
