'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

interface ScanData {
  url: string;
  industry: string;
  breakdown: unknown;
  benchmark: unknown;
}

interface PageActionsProps {
  title?: string;
  scanData?: ScanData;
  scanId?: string;
}

export default function PageActions({ title, scanData, scanId }: PageActionsProps) {
  const [loading, setLoading] = useState(false);

  const handlePDF = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let id = scanId;

      // 저장 먼저 (scanId 없으면 save → id 획득)
      if (!id && scanData) {
        const saveRes = await fetch('/api/smarcomm/scan/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scanData),
        });
        if (!saveRes.ok) {
          const err = await saveRes.json().catch(() => ({}));
          alert(err.error || 'PDF 저장 중 오류가 발생했습니다.');
          return;
        }
        const saved = await saveRes.json();
        id = saved.id;
      }

      if (!id) {
        alert('다운로드할 스캔 결과가 없습니다. 먼저 진단을 실행해주세요.');
        return;
      }

      // PDF 다운로드
      const pdfRes = await fetch(`/api/smarcomm/report/pdf?id=${id}`);
      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({}));
        alert(err.error || 'PDF 생성 중 오류가 발생했습니다.');
        return;
      }

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const disposition = pdfRes.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+)"/);
      a.download = match?.[1] ?? `smarcomm-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const content = document.querySelector('main')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'smarcomm-report'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        onClick={handleDownload}
        title="데이터 내려받기"
        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-text-sub hover:bg-surface hover:text-text transition-colors"
      >
        <Download size={13} /> 내려받기
      </button>
      <button
        onClick={handlePDF}
        disabled={loading}
        title="PDF 리포트 다운로드"
        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-text-sub hover:bg-surface hover:text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
        {loading ? '생성 중…' : 'PDF'}
      </button>
    </div>
  );
}
