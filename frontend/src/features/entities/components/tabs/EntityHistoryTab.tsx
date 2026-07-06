import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { LegalEntity } from '../../types/entity';
import { entityService } from '../../services/entity.service';
import { History, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface Props {
  entity: LegalEntity;
  onUpdate: () => void;
}

export function EntityHistoryTab({ entity, onUpdate }: Props) {
  const { id: entityId } = useParams<{ id: string }>();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    setIsSubmitting(true);
    try {
      await entityService.addNote(entityId!, { note });
      setNote('');
      onUpdate();
    } catch (err) {
      console.error('Erro ao adicionar nota', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Merge history and notes into a single timeline, sorted by date DESC
  const timeline = [
    ...(entity.history?.map(h => ({ ...h, type: 'HISTORY' })) || []),
    ...(entity.notes?.map(n => ({ ...n, type: 'NOTE' })) || [])
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Timeline */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">Histórico de Atividades</h2>
        
        {timeline.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
            {timeline.map((item, index) => (
              <div key={item.id || index} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {item.type === 'NOTE' ? (
                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      <span className="font-medium text-sm text-slate-800">
                        {item.createdBy?.name || 'Sistema'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-700">
                    {item.type === 'NOTE' ? (
                      <p className="whitespace-pre-wrap">{(item as any).note}</p>
                    ) : (
                      <div>
                        <p className="font-medium">{(item as any).action}</p>
                        <p className="mt-1 text-slate-600">{(item as any).description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-800">Nenhum histórico</h3>
            <p className="text-sm text-slate-500 mt-1">O histórico desta entidade aparecerá aqui.</p>
          </div>
        )}
      </div>

      {/* Add Note Sidebar */}
      <div>
        <div className="bg-slate-50 p-4 rounded-xl sticky top-6">
          <h3 className="text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            Adicionar Observação
          </h3>
          <form onSubmit={handleSubmitNote} className="space-y-3">
            <textarea
              required
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Digite uma observação interna sobre a entidade..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
            />
            <button
              type="submit"
              disabled={isSubmitting || !note.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 text-sm"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Enviando...' : 'Registrar Observação'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
