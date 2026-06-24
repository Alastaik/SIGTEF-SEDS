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

export function SettingsFlagsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/category/FEATURE_FLAG');
      const data: SystemSetting[] = response.data;
      setSettings(data);
      
      const initialValues: Record<string, boolean> = {};
      data.forEach(s => {
        initialValues[s.key] = s.value === 'true';
      });
      setValues(initialValues);
    } catch (error) {
      console.error('Erro ao buscar flags', error);
      alert('Erro ao buscar feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      Object.keys(values).forEach(key => {
        payload[key] = values[key] ? 'true' : 'false';
      });
      await api.put('/settings', payload);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-500">Carregando...</div>;

  return (
    <div>
      <div className="space-y-6">
        {settings.map(setting => (
          <div key={setting.key} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <div>
              <p className="font-medium text-slate-800">{setting.key}</p>
              <p className="text-sm text-slate-500">{setting.description}</p>
            </div>
            <button 
              onClick={() => handleToggle(setting.key)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${values[setting.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
              role="switch" 
              aria-checked={values[setting.key]}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${values[setting.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
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
