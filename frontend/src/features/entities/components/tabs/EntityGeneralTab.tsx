import type { LegalEntity } from '../../types/entity';

interface Props {
  entity: LegalEntity;
}

export function EntityGeneralTab({ entity }: Props) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
        Dados Gerais
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-500">CNPJ</label>
          <div className="mt-1 text-slate-900">{entity.cnpj}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Status</label>
          <div className="mt-1 text-slate-900">{entity.status}</div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-500">Razão Social</label>
          <div className="mt-1 text-slate-900">{entity.corporateName}</div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-500">Nome Fantasia</label>
          <div className="mt-1 text-slate-900">{entity.tradeName || '-'}</div>
        </div>
      </div>
    </div>
  );
}
