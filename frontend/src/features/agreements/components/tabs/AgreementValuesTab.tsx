import { useState, useEffect } from 'react';
import type { Agreement, AgreementProgram } from '../../types';
import { agreementService } from '../../services/agreementService';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

interface AgreementValuesTabProps {
  agreement: Agreement;
  onUpdate: () => void;
}

export function AgreementValuesTab({ agreement }: AgreementValuesTabProps) {
  const [agreementPrograms, setAgreementPrograms] = useState<AgreementProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [agreement.id]);

  const fetchData = async () => {
    try {
      const programsData = await agreementService.getPrograms(agreement.id);
      setAgreementPrograms(programsData);
    } catch (error) {
      console.error('Failed to fetch programs data', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalMonthly = agreementPrograms.reduce((acc, curr) => acc + (curr.expectedMonthlyValue || 0), 0);
  const totalGlobalPrograms = agreementPrograms.reduce((acc, curr) => acc + (curr.expectedTotalValue || 0), 0);
  const totalGoals = agreementPrograms.reduce((acc, curr) => acc + (curr.goalQuantity || 0), 0);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Carregando valores...</div>;
  }

  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Valores Pactuados</h2>
          <p className="text-sm text-slate-500">Visão consolidada de metas e valores per capita dos programas.</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <DollarSign size={20} className="text-blue-500" />
              <h3 className="font-medium">Valor Mensal Total</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalMonthly)}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <TrendingUp size={20} className="text-emerald-500" />
              <h3 className="font-medium">Valor Global dos Programas</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalGlobalPrograms)}</p>
            {agreement.globalValue !== totalGlobalPrograms && (
              <p className="text-xs text-amber-600 mt-1">Diferente do Global do Termo: {formatCurrency(agreement.globalValue)}</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <Users size={20} className="text-indigo-500" />
              <h3 className="font-medium">Metas Somadas</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalGoals}</p>
          </div>
        </div>

        {/* Detalhamento */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Detalhamento por Programa</h3>
          {agreementPrograms.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-lg">
              Nenhum programa vinculado para exibir valores.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Programa</th>
                    <th className="px-6 py-3 text-right">Meta</th>
                    <th className="px-6 py-3 text-right">Per Capita Previsto</th>
                    <th className="px-6 py-3 text-right">Valor Mensal</th>
                    <th className="px-6 py-3 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agreementPrograms.map((ap) => {
                    // Calcula o per capita real se a meta e valor mensal existirem
                    const perCapitaCalculado = (ap.expectedMonthlyValue && ap.goalQuantity) 
                      ? ap.expectedMonthlyValue / ap.goalQuantity 
                      : 0;

                    return (
                      <tr key={ap.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {ap.programName}
                          {ap.consumerUnitName && <span className="block text-xs font-normal text-slate-500 mt-1">UC: {ap.consumerUnitName}</span>}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700">{ap.goalQuantity || '-'}</td>
                        <td className="px-6 py-4 text-right text-slate-700">
                          {formatCurrency(perCapitaCalculado)}
                          {ap.perCapitaValue && ap.perCapitaValue !== perCapitaCalculado && (
                            <span className="block text-xs text-amber-600 mt-1" title="Per capita tabelado diverge do cálculo (Mensal/Meta)">Ref: {formatCurrency(ap.perCapitaValue)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">{formatCurrency(ap.expectedMonthlyValue)}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">{formatCurrency(ap.expectedTotalValue)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                    <td className="px-6 py-4 text-slate-900">TOTAIS</td>
                    <td className="px-6 py-4 text-right text-slate-900">{totalGoals}</td>
                    <td className="px-6 py-4 text-right text-slate-900">-</td>
                    <td className="px-6 py-4 text-right text-slate-900">{formatCurrency(totalMonthly)}</td>
                    <td className="px-6 py-4 text-right text-slate-900">{formatCurrency(totalGlobalPrograms)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
