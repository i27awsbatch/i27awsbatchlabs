const STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pdf: { bg: '#FEE2E2', text: '#B91C1C', label: 'PDF' },
  docx: { bg: '#EFF6FF', text: '#1D4ED8', label: 'DOCX' },
  doc: { bg: '#EFF6FF', text: '#1D4ED8', label: 'DOC' },
  png: { bg: '#EDE9FE', text: '#6D28D9', label: 'PNG' },
  jpg: { bg: '#EDE9FE', text: '#6D28D9', label: 'JPG' },
  jpeg: { bg: '#EDE9FE', text: '#6D28D9', label: 'JPG' },
  xlsx: { bg: '#DCFCE7', text: '#15803D', label: 'XLSX' },
  xls: { bg: '#DCFCE7', text: '#15803D', label: 'XLS' },
}

export function FileTypeChip({ fileName, size = 32 }: { fileName: string; size?: number }) {
  const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : ''
  const style = STYLES[ext] ?? { bg: '#F1F5F9', text: '#475569', label: ext ? ext.slice(0, 4).toUpperCase() : 'FILE' }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg font-bold"
      style={{ width: size, height: size, background: style.bg, color: style.text, fontSize: size * 0.27 }}
    >
      {style.label}
    </span>
  )
}
