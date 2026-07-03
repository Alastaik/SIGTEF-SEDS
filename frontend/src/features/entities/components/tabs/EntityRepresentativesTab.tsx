import { useState, useEffect } from 'react';
import type { LegalEntity, RepresentativeResponseDTO, InvitationResponseDTO, RepresentativeRole } from '../../types/entity';
import { entityService } from '../../services/entity.service';
import { Users, Mail, Clock, ShieldCheck, XCircle, Settings, Check } from 'lucide-react';

interface Props {
  entity: LegalEntity;
}

export function EntityRepresentativesTab({ entity }: Props) {
  const [representatives, setRepresentatives] = useState<RepresentativeResponseDTO[]>([]);
  const [invitations, setInvitations] = useState<InvitationResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const defaultPermissions: Record<RepresentativeRole, string[]> = {
    'ADMINISTRADOR': ['VISUALIZAR_ENTIDADE', 'ENVIAR_PRESTACAO', 'RESPONDER_PENDENCIA', 'ANEXAR_DOCUMENTO', 'VISUALIZAR_SITUACAO', 'GERENCIAR_REPRESENTANTES'],
    'OPERADOR': ['VISUALIZAR_ENTIDADE', 'ENVIAR_PRESTACAO', 'RESPONDER_PENDENCIA', 'ANEXAR_DOCUMENTO', 'VISUALIZAR_SITUACAO'],
    'LEITOR': ['VISUALIZAR_ENTIDADE', 'VISUALIZAR_SITUACAO']
  };

  const availablePermissions = [
    { id: 'VISUALIZAR_ENTIDADE', label: 'Visualizar entidade' },
    { id: 'ENVIAR_PRESTACAO', label: 'Enviar prestação' },
    { id: 'RESPONDER_PENDENCIA', label: 'Responder pendência' },
    { id: 'ANEXAR_DOCUMENTO', label: 'Anexar documentos' },
    { id: 'VISUALIZAR_SITUACAO', label: 'Visualizar situação da análise' },
    { id: 'GERENCIAR_REPRESENTANTES', label: 'Gerenciar outros representantes' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'OPERADOR' as RepresentativeRole,
    permissions: defaultPermissions['OPERADOR']
  });

  useEffect(() => {
    fetchData();
  }, [entity.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reps, invs] = await Promise.all([
        entityService.getRepresentatives(entity.id),
        entityService.getPendingInvitations(entity.id)
      ]);
      setRepresentatives(reps || []);
      setInvitations(invs || []);
    } catch (err) {
      console.error('Error fetching reps', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: RepresentativeRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions[role]
    }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await entityService.inviteRepresentative(entity.id, formData);
      setIsModalOpen(false);
      fetchData();
      setFormData({ name: '', email: '', role: 'OPERADOR', permissions: defaultPermissions['OPERADOR'] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar o acesso deste representante?')) return;
    try {
      await entityService.revokeRepresentative(id);
      fetchData();
    } catch (err) {
      console.error('Error revoking', err);
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) return;
    try {
      await entityService.cancelInvitation(id);
      fetchData();
    } catch (err) {
      console.error('Error canceling invite', err);
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Carregando representantes...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Representantes e Acesso</h2>
          <p className="text-sm text-slate-500">Gerencie quem tem acesso ao Portal da Entidade.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          Convidar Representante
        </button>
      </div>

      <div className="space-y-4">
        {/* Active Representatives */}
        {(representatives || []).filter(r => r.status === 'ACTIVE').map(rep => (
          <div key={rep.id} className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-full">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 flex items-center gap-2">
                  {rep.name}
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                    {rep.role}
                  </span>
                </h3>
                <p className="text-sm text-slate-500">{rep.email}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(rep.permissions || []).map(p => (
                    <span key={p} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                      {p.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleRevoke(rep.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Revogar Acesso"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Pending Invitations */}
        {(invitations || []).map(inv => (
          <div key={inv.id} className="p-4 border border-dashed border-amber-300 rounded-xl bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 flex items-center gap-2">
                  {inv.name}
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-semibold">
                    CONVITE PENDENTE
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                    {inv.role}
                  </span>
                </h3>
                <p className="text-sm text-slate-500">Enviado para: {inv.email}</p>
                <p className="text-xs text-amber-600 mt-1">Expira em: {new Date(inv.expiresAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCancelInvite(inv.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancelar Convite"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {(representatives || []).length === 0 && (invitations || []).length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-800">Nenhum representante</h3>
            <p className="text-sm text-slate-500 mt-1">Convide pessoas para acessar e gerenciar esta entidade.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Convidar Representante</h3>
              <p className="text-sm text-slate-500 mt-1">
                Um e-mail será enviado com um link para criar a senha de acesso.
              </p>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Papel / Perfil Base</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['ADMINISTRADOR', 'OPERADOR', 'LEITOR'] as RepresentativeRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={`p-3 border rounded-xl text-left transition-colors ${
                        formData.role === role 
                          ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <h4 className={`text-sm font-semibold ${formData.role === role ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {role}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Permissões Específicas
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {availablePermissions.map(perm => (
                    <label key={perm.id} className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                      />
                      <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border ${
                        formData.permissions.includes(perm.id)
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'bg-white border-slate-300 group-hover:border-indigo-500'
                      } flex items-center justify-center transition-colors`}>
                        {formData.permissions.includes(perm.id) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm text-slate-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
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
                  {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
