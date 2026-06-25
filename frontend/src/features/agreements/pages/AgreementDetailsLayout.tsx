import { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { agreementService } from '../services/agreementService';
import type { Agreement } from '../types';
import { 
  FileText, 
  ListChecks, 
  DollarSign, 
  Activity,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { RequirePermission } from '../../auth/RequirePermission';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { AgreementGeneralTab } from '../components/tabs/AgreementGeneralTab';
import { AgreementProgramsTab } from '../components/tabs/AgreementProgramsTab';
import { AgreementValuesTab } from '../components/tabs/AgreementValuesTab';
import { AgreementStatusTab } from '../components/tabs/AgreementStatusTab';

export function AgreementDetailsLayout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) fetchAgreement(id);
  }, [id]);

  const fetchAgreement = async (agreementId: string) => {
    try {
      const data = await agreementService.getAgreementById(agreementId);
      setAgreement(data);
    } catch (error) {
      console.error('Failed to fetch agreement', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await agreementService.deleteAgreement(id);
      navigate('/admin/agreements');
    } catch (error) {
      console.error('Failed to delete agreement', error);
      alert('Erro ao excluir termo de fomento.');
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium">Ativo</span>;
      case 'DRAFT': return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">Rascunho</span>;
      case 'SUSPENDED': return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-medium">Suspenso</span>;
      case 'EXPIRED': return <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-medium">Vencido</span>;
      case 'CLOSED': return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-medium">Encerrado</span>;
      case 'CANCELED': return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-medium">Cancelado</span>;
      case 'UNDER_RENEWAL': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">Em Renovação</span>;
      default: return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando detalhes do termo...</div>;
  }

  if (!agreement) {
    return <div className="p-8 text-center text-red-500">Termo de fomento não encontrado.</div>;
  }

  const menuItems = [
    { path: '', label: 'Dados Gerais', icon: <FileText size={18} /> },
    { path: 'programas', label: 'Programas Vinculados', icon: <ListChecks size={18} /> },
    { path: 'valores', label: 'Valores Pactuados', icon: <DollarSign size={18} /> },
    { path: 'status', label: 'Evolução e Status', icon: <Activity size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button 
          onClick={() => navigate('/admin/agreements')}
          className="mt-1 text-slate-400 hover:text-slate-600 transition-colors bg-white border border-slate-200 p-2 rounded-md"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              Termo {agreement.agreementNumber || '-'} / {agreement.year || '-'}
              {getStatusBadge(agreement.status)}
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-medium text-slate-700">Entidade:</span> {agreement.legalEntityName || '-'}
              {agreement.seiProcessNumber && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>SEI: {agreement.seiProcessNumber}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Action buttons (e.g., Change Status) */}
            <RequirePermission permission="ROLE_GESTOR">
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md font-medium flex items-center gap-2 transition-colors text-sm"
              >
                <Trash2 size={16} />
                Excluir Termo
              </button>
            </RequirePermission>
          </div>
        </div>
      </div>

      {/* Main Layout with Inner Sidebar */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Inner Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-white border border-slate-200 rounded-lg overflow-hidden sticky top-6">
          <nav className="flex flex-col p-2 space-y-1">
            {menuItems.map((item) => {
              const fullPath = `/admin/agreements/${id}${item.path ? `/${item.path}` : ''}`;
              const isActive = item.path === '' 
                ? location.pathname === `/admin/agreements/${id}`
                : location.pathname.startsWith(`/admin/agreements/${id}/${item.path}`);

              return (
                <Link
                  key={item.path}
                  to={fullPath}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg min-h-[500px]">
          <Routes>
            <Route path="/" element={<AgreementGeneralTab agreement={agreement} onUpdate={() => fetchAgreement(id!)} />} />
            <Route path="/programas" element={<AgreementProgramsTab agreement={agreement} onUpdate={() => fetchAgreement(id!)} />} />
            <Route path="/valores" element={<AgreementValuesTab agreement={agreement} onUpdate={() => fetchAgreement(id!)} />} />
            <Route path="/status" element={<AgreementStatusTab agreement={agreement} onUpdate={() => fetchAgreement(id!)} />} />
          </Routes>
        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Termo de Fomento"
        message={`Tem certeza que deseja excluir permanentemente o termo ${agreement?.agreementNumber || '-'}? Esta ação apagará todos os programas e valores vinculados a ele.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
