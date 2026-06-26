import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { FileText, Calendar, CheckCircle, Search } from 'lucide-react';

export function PortalAgreements() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const response = await api.get('/portal/agreements');
        setAgreements(response.data || []);
      } catch (error) {
        console.error('Erro ao buscar termos', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgreements();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'VIGENTE':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit"><CheckCircle size={14}/> Vigente</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium w-fit">{status}</span>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando termos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Termos</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por programa ou número..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {agreements.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum termo encontrado</h3>
            <p className="text-gray-500 max-w-sm">
              Sua entidade não possui termos de parceria ativos no momento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Termo</th>
                  <th className="px-6 py-4 font-semibold">Programa(s)</th>
                  <th className="px-6 py-4 font-semibold">Valor Total</th>
                  <th className="px-6 py-4 font-semibold">Vigência</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {agreement.agreementNumber} / {agreement.year}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                         {agreement.programs?.map((pa: any) => (
                            <div key={pa.id} className="text-sm">
                              {pa.program?.name} 
                            </div>
                         ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(agreement.globalValue || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString('pt-BR') : '-'}
                        {' a '}
                        {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(agreement.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
