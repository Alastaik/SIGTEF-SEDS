import { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { entityService } from '../services/entity.service';
import type { LegalEntity } from '../types/entity';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  History, 
  MessageSquare,
  ArrowLeft,
  Zap,
  Shield,
  Trash2
} from 'lucide-react';
import { RequirePermission } from '../../auth/RequirePermission';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { EntityGeneralTab } from '../components/tabs/EntityGeneralTab';
import { EntityAddressesTab } from '../components/tabs/EntityAddressesTab';
import { EntityContactsTab } from '../components/tabs/EntityContactsTab';
import { EntityResponsiblesTab } from '../components/tabs/EntityResponsiblesTab';
import { EntityConsumerUnitsTab } from '../components/tabs/EntityConsumerUnitsTab';
import { EntityHistoryTab } from '../components/tabs/EntityHistoryTab';
import { EntityRepresentativesTab } from '../components/tabs/EntityRepresentativesTab';

export function EntityDetailsLayout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<LegalEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchEntity(id);
  }, [id]);

  const fetchEntity = async (entityId: string) => {
    try {
      const data = await entityService.getById(entityId);
      setEntity(data);
    } catch (error) {
      console.error('Failed to fetch entity', error);
      // fallback for 404 or something
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await entityService.delete(id);
      navigate('/admin/entities');
    } catch (error: any) {
      console.error('Failed to delete entity', error);
      if (error.response?.status === 409) {
        setDeleteError(error.response.data || 'Não é possível excluir esta entidade.');
      } else {
        setDeleteError('Erro ao excluir entidade.');
      }
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVA': return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium">Ativa</span>;
      case 'PENDENTE_VALIDACAO': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">Pendente Validação</span>;
      default: return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatCnpj = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando detalhes da entidade...</div>;
  }

  if (!entity) {
    return <div className="p-8 text-center text-red-500">Entidade não encontrada.</div>;
  }

  const menuItems = [
    { path: '', label: 'Dados Gerais', icon: <Building2 size={18} /> },
    { path: 'enderecos', label: 'Endereços', icon: <MapPin size={18} /> },
    { path: 'contatos', label: 'Contatos', icon: <Phone size={18} /> },
    { path: 'responsaveis', label: 'Responsáveis Legais', icon: <Users size={18} /> },
    { path: 'acessos', label: 'Representantes e Acesso', icon: <Shield size={18} /> },
    { path: 'unidades', label: 'Unidades Consumidoras', icon: <Zap size={18} /> },
    { path: 'notas', label: 'Observações', icon: <MessageSquare size={18} /> },
    { path: 'historico', label: 'Histórico', icon: <History size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button 
          onClick={() => navigate('/admin/entities')}
          className="mt-1 text-slate-400 hover:text-slate-600 transition-colors bg-white border border-slate-200 p-2 rounded-md"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              {entity.corporateName}
              {getStatusBadge(entity.status)}
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-medium text-slate-700">CNPJ:</span> {formatCnpj(entity.cnpj)}
              {entity.tradeName && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{entity.tradeName}</span>
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
                Excluir Entidade
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
              const fullPath = `/admin/entities/${id}${item.path ? `/${item.path}` : ''}`;
              const isActive = item.path === '' 
                ? location.pathname === `/admin/entities/${id}`
                : location.pathname.startsWith(`/admin/entities/${id}/${item.path}`);

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
            <Route path="/" element={<EntityGeneralTab entity={entity} />} />
            <Route path="/enderecos" element={<EntityAddressesTab entity={entity} onUpdate={() => fetchEntity(id!)} />} />
            <Route path="/contatos" element={<EntityContactsTab entity={entity} onUpdate={() => fetchEntity(id!)} />} />
            <Route path="/responsaveis" element={<EntityResponsiblesTab entity={entity} onUpdate={() => fetchEntity(id!)} />} />
            <Route path="/acessos" element={<EntityRepresentativesTab entity={entity} />} />
            <Route path="/unidades" element={<EntityConsumerUnitsTab entity={entity} onUpdate={() => fetchEntity(id!)} />} />
            <Route path="/notas" element={<EntityHistoryTab entity={entity} onUpdate={() => fetchEntity(id!)} />} />
            <Route path="/historico" element={<EntityHistoryTab entity={entity} onUpdate={() => fetchEntity(id!)} />} />
            <Route path="/historico" element={<EntityHistoryTab entity={entity} onUpdate={() => fetchEntity(id!)} />} />
          </Routes>
        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteError(null); }}
        onConfirm={handleDelete}
        title="Excluir Entidade"
        message={deleteError || `Tem certeza que deseja excluir permanentemente a entidade ${entity.corporateName}? Esta ação apagará todos os endereços, contatos e representantes.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
