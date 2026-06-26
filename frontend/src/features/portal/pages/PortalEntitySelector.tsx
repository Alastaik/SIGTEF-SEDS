import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Building2, ArrowRight } from 'lucide-react';

export function PortalEntitySelector() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca as entidades vinculadas a este representante
    const fetchEntities = async () => {
      try {
        const response = await api.get('/portal/my-entities');
        const data = response.data;
        
        if (data.length === 1) {
          // Se tiver só uma, entra direto
          handleSelect(data[0].id, data[0].name);
        } else {
          setEntities(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao buscar entidades', error);
        setLoading(false);
      }
    };
    fetchEntities();
  }, []);

  const handleSelect = (id: string, name: string) => {
    localStorage.setItem('currentEntityId', id);
    localStorage.setItem('currentEntityName', name);
    navigate('/portal'); // Vai pro dashboard
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Buscando seus vínculos...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao Portal</h1>
          <p className="text-gray-500 text-lg">Selecione qual entidade você deseja acessar neste momento.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map(entity => (
            <button
              key={entity.id}
              onClick={() => handleSelect(entity.id, entity.name)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left flex items-start gap-4 group"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{entity.name}</h3>
                <p className="text-sm text-gray-500">CNPJ: {entity.cnpj}</p>
              </div>
              <div className="text-gray-300 group-hover:text-blue-500 transition-colors self-center">
                <ArrowRight size={20} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
