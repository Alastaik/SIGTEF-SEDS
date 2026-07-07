import { useState } from 'react';
import { api } from '../../../lib/api';
import { X, UploadCloud, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const IMPORT_EXAMPLES: Record<string, { description: string, columns: string[], rows: string[][] }> = {
  LEGAL_ENTITIES: {
    description: "Planilha de Entidades e Prefeituras. O CNPJ é o identificador único.",
    columns: ["cnpj", "name", "email", "phone", "status"],
    rows: [
      ["11.222.333/0001-44", "Prefeitura de Goiânia", "contato@goiania.go.gov.br", "6235241000", "ACTIVE"],
      ["55.666.777/0001-88", "Associação Beneficente", "ong@email.com", "62999999999", "ACTIVE"]
    ]
  },
  REPRESENTATIVES: {
    description: "Vínculo de representantes legais e prefeitos às entidades.",
    columns: ["cnpj_entidade", "cpf_representante", "nome_representante", "cargo", "data_inicio"],
    rows: [
      ["11.222.333/0001-44", "123.456.789-00", "João da Silva", "Prefeito", "2021-01-01"],
      ["55.666.777/0001-88", "987.654.321-11", "Maria Souza", "Presidente", "2023-05-10"]
    ]
  },
  PARTNERSHIP_AGREEMENTS: {
    description: "Termos de fomento e convênios firmados com a SEDS.",
    columns: ["numero_processo_sei", "cnpj_entidade", "objeto", "valor_global", "data_assinatura"],
    rows: [
      ["2024000111222", "11.222.333/0001-44", "Construção de Creche", "500000.00", "2024-01-15"],
      ["2024000333444", "55.666.777/0001-88", "Apoio a Idosos", "150000.00", "2024-02-20"]
    ]
  },
  FINANCIAL_TRANSFERS: {
    description: "Repasses financeiros (OB) vinculados a um Termo de Fomento.",
    columns: ["numero_processo_sei", "numero_ob", "valor", "data_pagamento", "conta_bancaria"],
    rows: [
      ["2024000111222", "OB2024001", "100000.00", "2024-03-01", "12345-6"],
      ["2024000333444", "OB2024002", "50000.00", "2024-03-15", "98765-4"]
    ]
  },
  ENERGY_RECORDS: {
    description: "Faturas de energia (Auxílio Energia) vinculadas às Unidades Consumidoras das entidades.",
    columns: ["cnpj_entidade", "numero_uc", "mes_referencia", "ano_referencia", "consumo_kwh", "valor_total", "bandeira_tarifaria"],
    rows: [
      ["11.222.333/0001-44", "100200300", "5", "2024", "1500.5", "1250.75", "VERDE"],
      ["55.666.777/0001-88", "400500600", "5", "2024", "800.0", "750.20", "VERMELHA_PATAMAR_1"]
    ]
  }
};

interface ImportWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportWizard({ onClose, onSuccess }: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [importType, setImportType] = useState('LEGAL_ENTITIES');
  const [mode, setMode] = useState('CREATE_ONLY');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const example = IMPORT_EXAMPLES[importType] || IMPORT_EXAMPLES['LEGAL_ENTITIES'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo para continuar.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('importType', importType);
      formData.append('mode', mode);
      formData.append('file', file);

      await api.post('/admin/imports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Arquivo enviado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar arquivo para importação.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-emerald-950/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Assistente de Importação (Passo {step}/2)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  O que você deseja importar?
                </label>
                <select 
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={importType}
                  onChange={(e) => setImportType(e.target.value)}
                >
                  <option value="LEGAL_ENTITIES">Entidades (CNPJ)</option>
                  <option value="REPRESENTATIVES">Representantes (Vínculos)</option>
                  <option value="PARTNERSHIP_AGREEMENTS">Termos de Fomento</option>
                  <option value="FINANCIAL_TRANSFERS">Repasses Financeiros</option>
                  <option value="ENERGY_RECORDS">Auxílio Energia (Faturas)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Modo de Importação
                </label>
                <select 
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="CREATE_ONLY">Criar Apenas (Ignora existentes)</option>
                  <option value="UPDATE_EXISTING">Atualizar Apenas (Falha se não existir)</option>
                  <option value="UPSERT">Criar ou Atualizar</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Recomendamos "Criar Apenas" para a primeira carga de dados.
                </p>
              </div>

              {/* Tabela de Exemplo */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="text-slate-500" size={18} />
                  <h3 className="font-semibold text-slate-700 text-sm">Formato Esperado da Planilha</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4">{example.description}</p>
                
                <div className="overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                      <tr>
                        {example.columns.map((col, idx) => (
                          <th key={idx} className="px-3 py-2 border-b border-r border-slate-200 last:border-r-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {example.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-100 last:border-b-0">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 border-r border-slate-100 last:border-r-0 font-mono text-slate-600">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5 shrink-0" size={18} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Atenção ao Formato</p>
                  <p>O arquivo deve estar no formato .xlsx ou .csv. Todas as colunas obrigatórias do módulo selecionado ({importType}) devem estar presentes.</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                <UploadCloud className="mx-auto text-slate-400 mb-3" size={32} />
                <label className="block">
                  <span className="sr-only">Escolha o arquivo</span>
                  <input 
                    type="file" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </label>
                {file && (
                  <p className="mt-3 text-sm text-slate-600 font-medium">
                    Selecionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors"
            >
              Próximo
            </button>
          ) : (
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? 'Enviando...' : 'Enviar e Validar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
