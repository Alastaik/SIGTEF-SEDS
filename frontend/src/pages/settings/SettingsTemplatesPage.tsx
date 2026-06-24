import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Save } from 'lucide-react';

interface Template {
  key: string;
  name: string;
  subject: string;
  content: string;
  variablesDescription: string;
}

export function SettingsTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (t: Template) => {
    setSelectedTemplate(t);
    setSubject(t.subject || '');
    setContent(t.content || '');
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      await api.put(`/templates/${selectedTemplate.key}`, { subject, content });
      alert('Template salvo com sucesso!');
      await fetchTemplates();
    } catch (error) {
      alert('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-500">Carregando...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lista Lateral */}
      <div className="lg:col-span-1 border-r border-slate-200 pr-6">
        <h3 className="font-bold text-slate-800 mb-4">Templates Disponíveis</h3>
        <ul className="space-y-2">
          {templates.map(t => (
            <li key={t.key}>
              <button 
                onClick={() => handleSelect(t)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedTemplate?.key === t.key ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Editor Central */}
      <div className="lg:col-span-2">
        {selectedTemplate ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chave do Template</label>
              <input type="text" disabled value={selectedTemplate.key} className="w-full bg-slate-100 text-slate-500 rounded-md border border-slate-200 px-3 py-2 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assunto (E-mail/Notificação)</label>
              <input 
                type="text" 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Corpo da Mensagem</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full h-64 rounded-md border border-slate-300 p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
              <p className="font-bold mb-2">Variáveis Disponíveis:</p>
              <pre className="whitespace-pre-wrap font-mono text-xs">{selectedTemplate.variablesDescription}</pre>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Template'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Selecione um template ao lado para editar.
          </div>
        )}
      </div>
    </div>
  );
}
