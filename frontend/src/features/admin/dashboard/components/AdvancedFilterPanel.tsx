import { useState } from 'react';
import { Filter, X, Search } from 'lucide-react';

export interface ReportFilter {
  search: string;
  entityStatus: string;
  cityId: string;
  regionId: string;
  regioesIds: string[];
  programIds: string[];
  programMatchMode: 'EXACT' | 'CONTAINS';
  minMensal: string;
  maxMensal: string;
  minAnual: string;
  maxAnual: string;
  minGlobal: string;
  maxGlobal: string;
  dataCadastroInicio: string;
  dataCadastroFim: string;
  yearStart: string;
  yearEnd: string;
}

interface AdvancedFilterPanelProps {
  onFilter: (filters: ReportFilter) => void;
  loading: boolean;
}

export function AdvancedFilterPanel({ onFilter, loading }: AdvancedFilterPanelProps) {
  const [filters, setFilters] = useState<ReportFilter>({
    search: '',
    entityStatus: '',
    cityId: '',
    regionId: '',
    regioesIds: [],
    programIds: [],
    programMatchMode: 'CONTAINS',
    minMensal: '',
    maxMensal: '',
    minAnual: '',
    maxAnual: '',
    minGlobal: '',
    maxGlobal: '',
    dataCadastroInicio: '',
    dataCadastroFim: '',
    yearStart: '',
    yearEnd: ''
  });

  const handleChange = (field: keyof ReportFilter, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    const cleared = {
      search: '',
      entityStatus: '',
      cityId: '',
      regionId: '',
      regioesIds: [],
      programIds: [],
      programMatchMode: 'CONTAINS' as const,
      minMensal: '',
      maxMensal: '',
      minAnual: '',
      maxAnual: '',
      minGlobal: '',
      maxGlobal: '',
      dataCadastroInicio: '',
      dataCadastroFim: '',
      yearStart: '',
      yearEnd: ''
    };
    setFilters(cleared);
    onFilter(cleared);
  };

  // Mocks para programas - em produção viriam da API
  const programOptions = [
    { id: '1', name: 'Água' },
    { id: '2', name: 'Luz' },
    { id: '3', name: 'Nutricional' }
  ];

  const handleProgramToggle = (id: string) => {
    setFilters(prev => {
      const isSelected = prev.programIds.includes(id);
      if (isSelected) {
        return { ...prev, programIds: prev.programIds.filter(p => p !== id) };
      } else {
        return { ...prev, programIds: [...prev.programIds, id] };
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Filter size={18} />
          Filtros Avançados
        </h3>
        <button 
          onClick={handleClear}
          className="text-sm text-slate-500 hover:text-red-500 flex items-center gap-1"
        >
          <X size={14} />
          Limpar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca por Nome/CNPJ */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Entidade</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Nome ou CNPJ..."
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={filters.entityStatus}
            onChange={(e) => handleChange('entityStatus', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ATIVA">Habilitada</option>
            <option value="INATIVA">Inativa</option>
            <option value="SUSPENSA">Suspensa</option>
          </select>
        </div>

        {/* Região */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Região</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={filters.regionId}
            onChange={(e) => handleChange('regionId', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="1">Goiânia e Metropolitana</option>
            <option value="2">Sul Goiano</option>
          </select>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-2">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Filtros Financeiros & Datas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Repasse Mensal Mínimo (R$)</label>
            <input type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={filters.minMensal} onChange={e => handleChange('minMensal', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Repasse Mensal Máximo (R$)</label>
            <input type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={filters.maxMensal} onChange={e => handleChange('maxMensal', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Repasse Anual Mínimo (R$)</label>
            <input type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={filters.minAnual} onChange={e => handleChange('minAnual', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Repasse Anual Máximo (R$)</label>
            <input type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={filters.maxAnual} onChange={e => handleChange('maxAnual', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Data Cadastro Inicial</label>
            <input type="date" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={filters.dataCadastroInicio} onChange={e => handleChange('dataCadastroInicio', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Data Cadastro Final</label>
            <input type="date" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={filters.dataCadastroFim} onChange={e => handleChange('dataCadastroFim', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-2">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Período de Repasse (por ano)</h4>
        <p className="text-xs text-slate-500 mb-3">
          Filtra entidades e exibe o total repassado <strong>no intervalo de anos</strong> selecionado, em vez do global.
        </p>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ano Início do Repasse</label>
            <select
              className="w-36 p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              value={filters.yearStart}
              onChange={e => handleChange('yearStart', e.target.value)}
            >
              <option value="">Todos</option>
              {Array.from({ length: new Date().getFullYear() - 2010 + 1 }, (_, i) => 2010 + i)
                .reverse()
                .map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ano Fim do Repasse</label>
            <select
              className="w-36 p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              value={filters.yearEnd}
              onChange={e => handleChange('yearEnd', e.target.value)}
            >
              <option value="">Todos</option>
              {Array.from({ length: new Date().getFullYear() - 2010 + 1 }, (_, i) => 2010 + i)
                .reverse()
                .map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-2">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filtrar por Programas Ativos
            </label>
            <div className="flex flex-wrap gap-2">
              {programOptions.map(prog => {
                const isSelected = filters.programIds.includes(prog.id);
                return (
                  <button
                    key={prog.id}
                    onClick={() => handleProgramToggle(prog.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {prog.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lógica Exato vs Contém */}
          {filters.programIds.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 min-w-[250px]">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Modo de Combinação
              </label>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => handleChange('programMatchMode', 'CONTAINS')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-l-md border ${
                    filters.programMatchMode === 'CONTAINS'
                      ? 'bg-indigo-600 text-white border-indigo-600 z-10'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Contém
                </button>
                <button
                  onClick={() => handleChange('programMatchMode', 'EXACT')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-r-md border -ml-px ${
                    filters.programMatchMode === 'EXACT'
                      ? 'bg-indigo-600 text-white border-indigo-600 z-10'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Exato
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {filters.programMatchMode === 'CONTAINS' 
                  ? 'Entidades que têm pelo menos um destes programas.' 
                  : 'Entidades que têm APENAS estes programas e mais nenhum outro.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleApply}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Aplicando...' : 'Aplicar Filtros'}
        </button>
      </div>
    </div>
  );
}
