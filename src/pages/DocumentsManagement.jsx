import { useCallback, useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/api'
const BACKEND_ORIGIN = 'http://127.0.0.1:8000'

const DOCUMENT_TYPES = [
  'Contract',
  'Quotation',
  'Invoice',
  'Receipt',
  'Other',
]

const styles = {
  page: {
    minHeight: '100vh',
    padding: '30px 5%',
    background: '#fffaf7',
    color: '#302521',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    margin: '0 0 8px',
    fontFamily: 'Georgia, serif',
    fontSize: '32px',
  },
  subtitle: {
    color: '#766a64',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  card: {
    background: '#fff',
    border: '1px solid #f0e5df',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 5px 20px rgba(70, 40, 25, 0.05)',
  },
  label: {
    display: 'block',
    marginBottom: '7px',
    fontWeight: 600,
    fontSize: '14px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
  },
  button: {
    padding: '11px 18px',
    border: 'none',
    borderRadius: '8px',
    background: '#a85d47',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '9px 13px',
    border: '1px solid #dec9be',
    borderRadius: '8px',
    background: '#fff',
    color: '#754536',
    fontWeight: 600,
    cursor: 'pointer',
  },
  dangerButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '7px',
    background: '#b42318',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    minWidth: '700px',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '13px',
    textAlign: 'left',
    background: '#f8f1ec',
    borderBottom: '1px solid #eadbd3',
    whiteSpace: 'nowrap',
    fontSize: '13px',
  },
  td: {
    padding: '13px',
    borderBottom: '1px solid #eee5df',
    fontSize: '13px',
    verticalAlign: 'top',
  },
}

function getErrorMessage(data) {
  if (!data) return 'Something went wrong.'

  if (typeof data.detail === 'string') {
    return data.detail
  }

  if (typeof data.error === 'string') {
    return data.error
  }

  return Object.entries(data)
    .map(([key, value]) => {
      const message = Array.isArray(value)
        ? value.join(', ')
        : String(value)

      return `${key}: ${message}`
    })
    .join(' | ') || 'Request failed.'
}

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('authToken')

  const headers = {
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { detail: text }
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data) || `Request failed (${response.status}).`
    )
  }

  return data
}

function getFileUrl(filePath) {
  if (!filePath) return ''

  try {
    return new URL(filePath, BACKEND_ORIGIN).href
  } catch {
    return ''
  }
}

export default function DocumentsManagement() {
  const [events, setEvents] = useState([])
  const [documents, setDocuments] = useState([])

  const [eventId, setEventId] = useState('')
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState('Other')
  const [selectedFile, setSelectedFile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [eventData, documentData] = await Promise.all([
        apiRequest('/events/'),
        apiRequest('/documents/'),
      ])

      setEvents(Array.isArray(eventData) ? eventData : eventData.results || [])
      setDocuments(
        Array.isArray(documentData)
          ? documentData
          : documentData.results || []
      )
    } catch (loadError) {
      setError(loadError.message || 'Unable to load documents.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpload = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!eventId) {
      setError('Please select an event.')
      return
    }

    if (!title.trim()) {
      setError('Please enter a document title.')
      return
    }

    if (!selectedFile) {
      setError('Please choose a file to upload.')
      return
    }

    const allowedExtensions = [
      'pdf',
      'doc',
      'docx',
      'jpg',
      'jpeg',
      'png',
    ]

    const extension = selectedFile.name
      .split('.')
      .pop()
      .toLowerCase()

    if (!allowedExtensions.includes(extension)) {
      setError('Allowed files: PDF, DOC, DOCX, JPG, JPEG and PNG.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must not exceed 10 MB.')
      return
    }

    const formData = new FormData()
    formData.append('event', eventId)
    formData.append('title', title.trim())
    formData.append('document_type', documentType)
    formData.append('file', selectedFile)

    setSaving(true)

    try {
      await apiRequest('/documents/', {
        method: 'POST',
        body: formData,
      })

      setTitle('')
      setDocumentType('Other')
      setSelectedFile(null)

      const fileInput = document.getElementById('document-file')
      if (fileInput) fileInput.value = ''

      setMessage('Document uploaded successfully.')
      await loadData()
    } catch (uploadError) {
      setError(uploadError.message || 'Document upload failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (document) => {
    const confirmed = window.confirm(
      `Delete "${document.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError('')
    setMessage('')
    setDeletingId(document.id)

    try {
      await apiRequest(`/documents/${document.id}/`, {
        method: 'DELETE',
      })

      setMessage('Document record deleted successfully.')
      await loadData()
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete document.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDocuments = documents.filter((document) => {
    const event = events.find(
      (item) => String(item.id) === String(document.event)
    )

    const searchText = [
      document.title,
      document.document_type,
      event?.name || '',
      document.file || '',
    ]
      .join(' ')
      .toLowerCase()

    return searchText.includes(search.trim().toLowerCase())
  })

  return (
    <main style={styles.page}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '15px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={styles.heading}>Documents Management</h1>
          <p style={styles.subtitle}>
            Upload and organize event contracts, quotations, invoices
            and other documents.
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {message && (
        <div
          role="status"
          style={{
            padding: '13px',
            marginBottom: '18px',
            borderRadius: '8px',
            background: '#e9f8ee',
            color: '#166534',
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: '13px',
            marginBottom: '18px',
            borderRadius: '8px',
            background: '#fff0e9',
            color: '#8b3e2c',
            overflowWrap: 'anywhere',
          }}
        >
          {error}
        </div>
      )}

      <section style={styles.card}>
        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '24px',
            marginTop: 0,
          }}
        >
          Upload New Document
        </h2>

        <form onSubmit={handleUpload}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '18px',
            }}
          >
            <div>
              <label htmlFor="document-event" style={styles.label}>
                Event *
              </label>

              <select
                id="document-event"
                style={styles.input}
                value={eventId}
                onChange={(event) => setEventId(event.target.value)}
                required
              >
                <option value="">Select an event</option>
                {events.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="document-title" style={styles.label}>
                Document Title *
              </label>

              <input
                id="document-title"
                style={styles.input}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                placeholder="e.g. Wedding Contract"
                required
              />
            </div>

            <div>
              <label htmlFor="document-type" style={styles.label}>
                Document Type *
              </label>

              <select
                id="document-type"
                style={styles.input}
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                required
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="document-file" style={styles.label}>
                Choose File *
              </label>

              <input
                id="document-file"
                style={styles.input}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
                required
              />

              <p
                style={{
                  fontSize: '12px',
                  color: '#766a64',
                  margin: '7px 0 0',
                }}
              >
                PDF, DOC, DOCX, JPG or PNG · Maximum 10 MB
              </p>
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              marginTop: '22px',
              opacity: saving ? 0.7 : 1,
            }}
            disabled={saving || loading}
          >
            {saving ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
                margin: '0 0 7px',
              }}
            >
              Documents List
            </h2>

            <p style={{ color: '#766a64', margin: 0, fontSize: '13px' }}>
              Uploaded documents: {filteredDocuments.length}
            </p>
          </div>

          <input
            aria-label="Search documents"
            style={{
              ...styles.input,
              maxWidth: '300px',
            }}
            placeholder="Search title, event or type..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading documents...</p>
        ) : filteredDocuments.length === 0 ? (
          <p style={{ color: '#766a64' }}>
            No documents found. Select an event and upload a document to
            get started.
          </p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Event</th>
                  <th style={styles.th}>Document Title</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>File</th>
                  <th style={styles.th}>Uploaded On</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((document) => {
                  const relatedEvent = events.find(
                    (item) =>
                      String(item.id) === String(document.event)
                  )

                  const fileUrl = getFileUrl(document.file)

                  return (
                    <tr key={document.id}>
                      <td style={styles.td}>
                        {relatedEvent?.name || `Event #${document.event}`}
                      </td>

                      <td style={styles.td}>
                        <strong>{document.title}</strong>
                      </td>

                      <td style={styles.td}>
                        {document.document_type}
                      </td>

                      <td style={styles.td}>
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#754536',
                              fontWeight: 600,
                            }}
                          >
                            Open file
                          </a>
                        ) : (
                          'File unavailable'
                        )}
                      </td>

                      <td style={styles.td}>
                        {document.created_at
                          ? new Date(document.created_at).toLocaleString(
                              'en-IN'
                            )
                          : '—'}
                      </td>

                      <td style={styles.td}>
                        <button
                          type="button"
                          style={{
                            ...styles.dangerButton,
                            opacity: deletingId === document.id ? 0.7 : 1,
                          }}
                          onClick={() => handleDelete(document)}
                          disabled={deletingId === document.id}
                        >
                          {deletingId === document.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}