import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Download } from 'lucide-react'
import { usePageHeader } from '@/lib/page-header'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast'
import { api, ApiError } from '@/lib/api'
import type { Employee, EmployeeDocument, PageResponse } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, SelectInput, TextAreaInput } from '@/components/ui/Field'
import { FileTypeChip } from '@/components/FileTypeChip'
import { formatDate, fileSizeLabel } from '@/lib/format'
import { triggerDocumentDownload } from '@/lib/download'

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'OFFER_LETTER', label: 'Offer letter' },
  { value: 'PAYSLIP', label: 'Payslip' },
  { value: 'ID_PROOF', label: 'ID proof' },
  { value: 'APPRAISAL', label: 'Appraisal' },
  { value: 'POLICY_DOCUMENT', label: 'Policy document' },
  { value: 'HR_LETTER', label: 'HR letter' },
  { value: 'OTHER', label: 'Other' },
]

const categoryLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v.replaceAll('_', ' ')

export function DocumentsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const isHr = user?.role === 'HR_ADMIN'

  usePageHeader('Documents', 'Employee files and policy documents')

  const [docs, setDocs] = useState<EmployeeDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  function loadDocs() {
    setLoading(true)
    api
      .get<EmployeeDocument[]>('/documents')
      .then(setDocs)
      .catch(() => showToast('error', 'Could not load documents'))
      .finally(() => setLoading(false))
  }

  useEffect(loadDocs, [])

  const filtered = docs.filter((d) => {
    if (!filter.trim()) return true
    const q = filter.toLowerCase()
    return d.fileName.toLowerCase().includes(q) || (d.employeeName ?? '').toLowerCase().includes(q)
  })

  const totalBytes = docs.reduce((s, d) => s + (d.fileSize ?? 0), 0)

  return (
    <div className={isHr ? 'grid grid-cols-[1.55fr_1fr] items-start gap-4' : ''}>
      <Card>
        <CardHeader
          title={isHr ? 'All documents' : 'My documents'}
          subtitle={`${docs.length} file${docs.length === 1 ? '' : 's'} · ${fileSizeLabel(totalBytes) || '0 KB'} used`}
          right={
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter documents"
              className="ml-auto h-9 w-[212px] rounded-md border border-slate-300 px-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500"
            />
          }
        />
        <div className="grid grid-cols-[2.2fr_1.2fr_1.4fr_92px] gap-3 bg-slate-50 px-[18px] py-[11px] border-b border-slate-200">
          {['File', 'Type', 'Uploaded', 'Action'].map((h) => (
            <span key={h} className="text-[10.5px] font-semibold tracking-[.07em] text-slate-500 uppercase">
              {h}
            </span>
          ))}
        </div>
        {!loading && filtered.length === 0 && (
          <p className="px-[18px] py-10 text-center text-[12.5px] text-slate-400">No documents found.</p>
        )}
        {filtered.map((d) => (
          <div key={d.id} className="grid grid-cols-[2.2fr_1.2fr_1.4fr_92px] items-center gap-3 border-b border-slate-100 px-[18px] py-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileTypeChip fileName={d.fileName} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-slate-900">{d.fileName}</p>
                <p className="text-[11px] text-slate-400">{fileSizeLabel(d.fileSize)}</p>
              </div>
            </div>
            <span className="text-[12.5px] text-slate-600">{categoryLabel(d.documentType)}</span>
            <div>
              <p className="text-[12.5px] text-slate-600">{formatDate(d.uploadedAt)}</p>
              <p className="text-[11px] text-slate-400">by {d.uploadedBy}</p>
            </div>
            <Button
              variant="secondary"
              size="xs"
              className="h-[29px] w-fit"
              onClick={() => {
                triggerDocumentDownload(d.id, d.fileName)
                showToast('success', 'Download started', `${d.fileName} is downloading.`)
              }}
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
              Get
            </Button>
          </div>
        ))}
      </Card>

      {isHr && <UploadDocumentCard onUploaded={loadDocs} />}
    </div>
  )
}

function UploadDocumentCard({ onUploaded }: { onUploaded: () => void }) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].value)
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get<PageResponse<Employee>>('/employees?size=200')
      .then((res) => {
        setEmployees(res.items)
        if (res.items[0]) setEmployeeId(String(res.items[0].id))
      })
      .catch(() => {})
  }, [])

  function pickFile(f: File | null) {
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!ext || !['pdf', 'docx', 'png'].includes(ext)) {
      showToast('error', 'Unsupported file type', 'PDF, DOCX and PNG are supported.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      showToast('error', 'Upload failed', 'File exceeds the 10 MB limit. Try compressing it.')
      return
    }
    setFile(f)
  }

  async function handleUpload() {
    if (!employeeId) {
      showToast('error', 'Choose an employee')
      return
    }
    if (!file) {
      showToast('error', 'Choose a file to upload')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('employeeId', employeeId)
      formData.append('documentType', category)
      if (notes.trim()) formData.append('notes', notes.trim())
      formData.append('file', file)
      await api.upload('/documents', formData)
      showToast('success', 'Document uploaded', `${file.name} has been added.`)
      setFile(null)
      setNotes('')
      onUploaded()
    } catch (err) {
      showToast('error', 'Upload failed', err instanceof ApiError ? err.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Upload document" subtitle="HR only · PDF, DOCX, PNG up to 10 MB" />
      <div className="space-y-4 p-[18px]">
        <div>
          <Label>Employee</Label>
          <SelectInput value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.employeeCode} — {e.fullName} ({e.department})
              </option>
            ))}
          </SelectInput>
        </div>
        <div>
          <Label>Category</Label>
          <SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </SelectInput>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            pickFile(e.dataTransfer.files[0] ?? null)
          }}
          className={`cursor-pointer rounded-lg border-[1.5px] border-dashed px-[18px] py-[26px] text-center transition-colors ${
            dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-blue-50">
            <UploadCloud className="h-[18px] w-[18px] text-blue-600" strokeWidth={1.7} />
          </div>
          {file ? (
            <p className="mt-2.5 text-[12.5px] font-semibold text-slate-900">{file.name}</p>
          ) : (
            <>
              <p className="mt-2.5 text-[12.5px] font-semibold text-slate-900">Drop a file here</p>
              <p className="text-[11.5px] text-slate-500">
                or <span className="text-blue-600">browse your computer</span>
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.png"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div>
          <Label>Notes</Label>
          <TextAreaInput rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note visible to the employee" />
        </div>

        <Button className="h-[42px] w-full" disabled={submitting} onClick={handleUpload}>
          {submitting ? 'Uploading…' : 'Upload document'}
        </Button>
      </div>
    </Card>
  )
}
