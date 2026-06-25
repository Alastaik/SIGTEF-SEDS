import { useState, useEffect } from 'react';
import { agreementService } from '../services/agreementService';
import type { Agreement } from '../types';
import { RequirePermission } from '../../auth/RequirePermission';
import { Plus, Edit2, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';

export function AgreementsList() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const data = await agreementService.getAllAgreements();
      setAgreements(data);
    } catch (error) {
      console.error('Failed to fetch agreements', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!agreementToDelete) return;
    setIsDeleting(true);
    try {
      await agreementService.deleteAgreement(agreementToDelete.id!);
      await fetchAgreements();
      setAgreementToDelete(null);
    } catch (error) {
      console.error('Failed to delete agreement', error);
      alert('Erro ao excluir termo de fomento.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium">Ativo</span>;
      case 'DRAFT':
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">Rascunho</span>;
      case 'SUSPENDED':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-medium">Suspenso</span>;
      case 'EXPIRED':
        return <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-medium">Vencido</span>;
      case 'CLOSED':
        return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-medium">Encerrado</span>;
      case 'CANCELED':
        return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-medium">Cancelado</span>;
      case 'UNDER_RENEWAL':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">Em Renovação</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Termos de Fomento</h1>
          <p className="text-slate-500">Gestão dos instrumentos firmados entre o Estado e a Entidade.</p>
        </div>
        
        <RequirePermission permission="agreements:create">
          <button 
            onClick={() => navigate('/admin/agreements/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Novo Termo
          </button>
        </RequirePermission>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por Número do Termo, Entidade ou Processo..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
           </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nº Termo</th>
                <th className="px-6 py-4">Entidade</th>
                <th className="px-6 py-4">Processo SEI</th>
                <th className="px-6 py-4">Valor Global</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agreements.map((agreement) => (
                <tr key={agreement.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {agreement.agreementNumber || '-'} / {agreement.year || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-900 truncate max-w-xs">
                    {agreement.legalEntityName || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {agreement.seiProcessNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-900">
                    {formatCurrency(agreement.globalValue)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(agreement.status)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <RequirePermission permission="agreements:view">
                      <button 
                        onClick={() => navigate(`/admin/agreements/${agreement.id}`)}
                        className="text-slate-400 hover:text-blue-600 transition-colors" title="Detalhes / Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                    </RequirePermission>
                    <RequirePermission permission="ROLE_ADMIN">
                      <button 
                        onClick={() => setAgreementToDelete(agreement)}
                        className="text-slate-400 hover:text-red-600 transition-colors" title="Excluir Termo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </RequirePermission>
                  </td>
                </tr>
              ))}
              {agreements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum termo de fomento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!agreementToDelete}
        onClose={() => setAgreementToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Termo de Fomento"
        message={`Tem certeza que deseja excluir permanentemente o termo ${agreementToDelete?.agreementNumber || '-'}? Esta ação apagará todos os programas e valores vinculados a ele.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
