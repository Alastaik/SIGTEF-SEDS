import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Save } from 'lucide-react';

interface SystemSetting {
  key: string;
  category: string;
  value: string;
  dataType: string;
  description: string;
}

export function SettingsGeneralPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      const data: SystemSetting[] = response.data.filter((s: SystemSetting) => s.category !== 'FEATURE_FLAG');
      setSettings(data);
      
      const initialValues: Record<string, string> = {};
      data.forEach(s => {
        initialValues[s.key] = s.value;
      });
      setValues(initialValues);
    } catch (error) {
      console.error('Erro ao buscar settings', error);
      alert('Erro ao buscar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', values);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  // Agrupar por categoria
  const categories = Array.from(new Set(settings.map(s => s.category)));

  const categoryNames: Record<string, string> = {
    GENERAL: 'Geral',
    SECURITY: 'Segurança',
    STORAGE: 'Armazenamento',
    UPLOAD: 'Uploads',
    EMAIL: 'E-mail'
  };

  if (loading) return <div className="p-4 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-8">
      {categories.map(cat => (
        <section key={cat} className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
            {categoryNames[cat] || cat}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.filter(s => s.category === cat).map(setting => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{setting.key}</label>
                <p className="text-xs text-slate-500 mb-2">{setting.description}</p>
                <input
                  type={setting.dataType === 'INTEGER' ? 'number' : 'text'}
                  value={values[setting.key] || ''}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
