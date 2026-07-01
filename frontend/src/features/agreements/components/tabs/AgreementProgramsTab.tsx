import { useState, useEffect } from 'react';
import type { Agreement, AgreementProgram } from '../../types';
import { agreementService } from '../../services/agreementService';
import { programService, type Program } from '../../../../services/programService';
import { entityService } from '../../../entities/services/entity.service';
import { Plus, Trash2, Calculator, X } from 'lucide-react';
import type { AttendanceFrequency } from '../../types';

interface AgreementProgramsTabProps {
  agreement: Agreement;
  onUpdate: () => void;
}

export function AgreementProgramsTab({ agreement, onUpdate }: AgreementProgramsTabProps) {
  const [agreementPrograms, setAgreementPrograms] = useState<AgreementProgram[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);
  const [consumerUnits, setConsumerUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    programId: '',
    expectedMonthlyValue: 0,
    expectedTotalValue: 0,
    goalQuantity: 0,
    attendanceFrequency: 'WEEKDAYS' as AttendanceFrequency,
    attendanceDays: 0,
    perCapitaValue: 0,
    consumerUnitId: ''
  });

  const [currentPerCapita, setCurrentPerCapita] = useState<number>(0);

  const [simulatingProgramId, setSimulatingProgramId] = useState<string | null>(null);
  const [simulateMonth, setSimulateMonth] = useState(new Date().getMonth() + 1);
  const [simulateYear, setSimulateYear] = useState(new Date().getFullYear());
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [agreement.id]);

  const fetchData = async () => {
    try {
      const [programsData, allPrograms, entityData] = await Promise.all([
        agreementService.getPrograms(agreement.id),
        programService.getAll(),
        entityService.getById(agreement.legalEntityId)
      ]);
      setAgreementPrograms(programsData);
      setAvailablePrograms(allPrograms.filter(p => p.active));
      setConsumerUnits(entityData.consumerUnits || []);
    } catch (error) {
      console.error('Failed to fetch programs data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchValues = async () => {
      if (!formData.programId) {
        setCurrentPerCapita(0);
        return;
      }
      try {
        const values = await programService.getValues(formData.programId);
        const validValue = values.find(v => {
          const now = new Date();
          const from = new Date(v.validFrom);
          const to = v.validTo ? new Date(v.validTo) : null;
          return now >= from && (!to || now <= to);
        });
        if (validValue && validValue.perCapitaValue) {
          setCurrentPerCapita(validValue.perCapitaValue);
        } else {
          setCurrentPerCapita(0);
        }
      } catch (e) {
        setCurrentPerCapita(0);
      }
    };
    fetchValues();
  }, [formData.programId]);

  useEffect(() => {
    const program = availablePrograms.find(p => p.id === formData.programId);
    if (!program || program.calculationType !== 'POR_META') return;

    let days = 0;
    if (formData.attendanceFrequency === 'WEEKDAYS') days = 22;
    else if (formData.attendanceFrequency === 'EVERY_DAY') days = 30;
    else days = formData.attendanceDays || 0;

    // Se currentPerCapita for 0 (ex: programa não tem valor cadastrado), 
    // não vamos forçar o 0 na tela para não apagar se o usuário digitou manual
    if (currentPerCapita === 0 && (formData.expectedMonthlyValue > 0 || formData.expectedTotalValue > 0)) {
        return;
    }

    const monthly = (formData.goalQuantity || 0) * days * currentPerCapita;
    
    let totalMonths = 12; // Padrão 12 meses se não tiver data
    if (agreement.startDate && agreement.endDate) {
      const start = new Date(agreement.startDate);
      const end = new Date(agreement.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
        if (totalMonths < 1) totalMonths = 1;
      }
    }

    setFormData(prev => ({
      ...prev,
      expectedMonthlyValue: Number(monthly.toFixed(2)),
      expectedTotalValue: Number((monthly * totalMonths).toFixed(2))
    }));
  }, [formData.goalQuantity, formData.attendanceFrequency, formData.attendanceDays, currentPerCapita, agreement.startDate, agreement.endDate, formData.programId, availablePrograms]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload: any = {
        programId: formData.programId,
        expectedMonthlyValue: formData.expectedMonthlyValue != null ? formData.expectedMonthlyValue : null,
        expectedTotalValue: formData.expectedTotalValue != null ? formData.expectedTotalValue : null,
        goalQuantity: formData.goalQuantity != null ? formData.goalQuantity : null,
        attendanceFrequency: formData.attendanceFrequency || null,
        attendanceDays: formData.attendanceDays != null ? formData.attendanceDays : null,
        perCapitaValue: formData.perCapitaValue != null ? formData.perCapitaValue : null,
      };

      if (formData.consumerUnitId) {
        payload.consumerUnitId = formData.consumerUnitId;
      }

      await agreementService.addProgram(agreement.id, payload);
      setIsAdding(false);
      setFormData({
        programId: '',
        expectedMonthlyValue: 0,
        expectedTotalValue: 0,
        goalQuantity: 0,
        attendanceFrequency: 'WEEKDAYS',
        attendanceDays: 0,
        perCapitaValue: 0,
        consumerUnitId: ''
      });
      fetchData();
      onUpdate();
    } catch (error: any) {
      console.error('Failed to add program', error);
      alert(error.response?.data?.message || 'Erro ao vincular programa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (programId: string) => {
    if (!confirm('Tem certeza que deseja remover este programa do termo?')) return;
    try {
      await agreementService.removeProgram(programId);
      fetchData();
      onUpdate();
    } catch (error) {
      console.error('Failed to remove program', error);
      alert('Erro ao remover programa.');
    }
  };

  const handleSimulate = async () => {
    if (!simulatingProgramId) return;
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const result = await agreementService.simulateExpectedValue(agreement.id, simulatingProgramId, simulateMonth, simulateYear);
      setSimulationResult(result);
    } catch (error: any) {
      console.error('Failed to simulate', error);
      alert('Erro ao simular cálculo: ' + (error.response?.data?.message || 'Erro desconhecido.'));
    } finally {
      setIsSimulating(false);
    }
  };

  const selectedProgramObj = availablePrograms.find(p => p.id === formData.programId);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Carregando programas...</div>;
  }

  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Programas Vinculados</h2>
          <p className="text-sm text-slate-500">Gestão dos programas que compõem este termo de fomento.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Vincular Programa
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-md font-medium text-slate-800 mb-4">Novo Vínculo de Programa</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Programa <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.programId}
                  onChange={(e) => setFormData({...formData, programId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecione um programa</option>
                  {availablePrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProgramObj?.requiresConsumerUnit && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Unidade Consumidora <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.consumerUnitId}
                    onChange={(e) => setFormData({...formData, consumerUnitId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Selecione a Unidade</option>
                    {consumerUnits.map(cu => (
                      <option key={cu.id} value={cu.id}>{cu.unitNumber} - {cu.utilityType}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedProgramObj?.requiresGoal && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meta (Qtd)</label>
                  <input
                    type="number"
                    value={formData.goalQuantity}
                    onChange={(e) => setFormData({...formData, goalQuantity: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              {selectedProgramObj?.requiresServiceDays && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequência de Atendimento</label>
                    <select
                      value={formData.attendanceFrequency}
                      onChange={(e) => setFormData({...formData, attendanceFrequency: e.target.value as AttendanceFrequency})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="WEEKDAYS">Segunda a Sexta (Média 22 dias)</option>
                      <option value="EVERY_DAY">Todos os Dias (Média 30 dias)</option>
                      <option value="MANUAL">Informar Dias Manualmente</option>
                    </select>
                  </div>

                  {formData.attendanceFrequency === 'MANUAL' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Dias de Atendimento</label>
                      <input
                        type="number"
                        value={formData.attendanceDays}
                        onChange={(e) => setFormData({...formData, attendanceDays: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.expectedMonthlyValue}
                  onChange={(e) => setFormData({...formData, expectedMonthlyValue: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Valor do repasse previsto para um único mês.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.expectedTotalValue}
                  onChange={(e) => setFormData({...formData, expectedTotalValue: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Valor acumulado para toda a vigência deste termo.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar Vínculo'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {agreementPrograms.length === 0 ? (
          <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-lg">
            Nenhum programa vinculado a este termo.
          </div>
        ) : (
          <div className="space-y-4">
            {agreementPrograms.map((ap) => (
              <div key={ap.id} className="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white shadow-sm">
                <div>
                  <h4 className="font-semibold text-slate-900">{ap.programName}</h4>
                  <div className="mt-1 text-sm text-slate-500 space-x-4">
                    {ap.goalQuantity && <span>Meta: {ap.goalQuantity}</span>}
                    {ap.attendanceDays && <span>Dias: {ap.attendanceDays}</span>}
                    {ap.consumerUnitName && <span>UC: {ap.consumerUnitName}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Mensal</p>
                    <p className="font-medium text-slate-900">{formatCurrency(ap.expectedMonthlyValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total</p>
                    <p className="font-medium text-slate-900">{formatCurrency(ap.expectedTotalValue)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSimulatingProgramId(ap.programId);
                      setSimulationResult(null);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Simular Cálculo Mensal/Anual"
                  >
                    <Calculator size={18} />
                  </button>
                  <button
                    onClick={() => handleRemove(ap.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Remover programa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {simulatingProgramId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Simular Cálculo</h3>
              <button 
                onClick={() => setSimulatingProgramId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mês</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={simulateMonth}
                    onChange={(e) => setSimulateMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ano</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={simulateYear}
                    onChange={(e) => setSimulateYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSimulating ? 'Calculando...' : 'Calcular'}
              </button>

              {simulationResult && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Resultado da Simulação</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex justify-between">
                      <span>Tipo de Cálculo:</span>
                      <span className="font-medium">{simulationResult.calculationType}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Meses do Termo:</span>
                      <span className="font-medium">{simulationResult.totalMonths}</span>
                    </p>
                    <div className="border-t border-slate-200 my-2 pt-2 space-y-1">
                      <p className="flex justify-between">
                        <span>Valor Mensal Previsto:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(simulationResult.expectedMonthlyValue)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Valor Total Previsto:</span>
                        <span className="font-bold text-blue-700">{formatCurrency(simulationResult.expectedTotalValue)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
