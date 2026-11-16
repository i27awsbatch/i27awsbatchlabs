import { downloadUrl } from './api'

export function triggerDocumentDownload(id: number, fileName: string) {
  const a = document.createElement('a')
  a.href = downloadUrl(`/documents/${id}/download`)
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
