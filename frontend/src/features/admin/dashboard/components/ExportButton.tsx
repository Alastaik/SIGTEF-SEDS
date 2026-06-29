import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { api } from '../../../../lib/api';

interface ExportButtonProps {
  endpoint: string;
  baseFilename: string;
  format?: 'xlsx' | 'csv';
  params?: Record<string, string>;
  label?: string;
  variant?: 'primary' | 'ghost';
}

export function ExportButton({
  endpoint,
  baseFilename,
  format = 'xlsx',
  params = {},
  label,
  variant = 'primary',
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ ...params, format });
      const response = await api.get(`${endpoint}?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      const mimeType =
        format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv;charset=UTF-8';

      const blob = new Blob([response.data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseFilename}_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      alert('Falha ao gerar o arquivo de exportação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const baseClass =
    variant === 'primary'
      ? 'flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm'
      : 'flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm';

  return (
    <button onClick={handleExport} disabled={loading} className={baseClass}>
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {loading ? 'Gerando...' : (label ?? (format === 'xlsx' ? 'Exportar Excel' : 'Exportar CSV'))}
    </button>
  );
}
