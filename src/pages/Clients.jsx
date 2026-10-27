
import { useCallback, useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/api/clients/'

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  address: '',
  requirements: '',
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  marginTop: '7px',
  marginBottom: '16px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box',
  background: '#fff',
}

const primaryButton = {
  padding: '11px 18px',
  background: '#a85d47',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
}

const secondaryButton = {
  ...primaryButton,
  background: '#eee5df',
  color: '#754536',
}

export default function Clients({ user }) {
  const [clients, setClients] = useState([])
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editingClient, setEditingClient] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
  }

  const getHeaders = () => ({
    Authorization: `Token ${sessionStorage.getItem('authToken') || ''}`,
    'Content-Type': 'application/json',
  })

  // Load clients from the backend
  const loadClients = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: getHeaders(),
      })

      const data = await response.json().catch(() => [])

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load clients. Please log in again.'
        )
      }

      setClients(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      showMessage(
        error.message || 'Could not connect to the server.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Open the Add Client form
  const openAddForm = () => {
    setEditingClient(null)
    setFormData({ ...EMPTY_FORM })
    setIsFormOpen(true)
    setMessage('')
  }

  // Open the Edit Client form
  const openEditForm = (client) => {
    setEditingClient(client)

    setFormData({
      name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      requirements: client.requirements || '',
    })

    setIsFormOpen(true)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Close and reset the form
  const closeForm = () => {
    setIsFormOpen(false)
    setEditingClient(null)
    setFormData({ ...EMPTY_FORM })
  }

  // Create or update a client
  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!formData.name.trim() || !formData.phone.trim()) {
      showMessage(
        'Client name and phone number are required.',
        'error'
      )
      return
    }

    setSaving(true)

    const isEditing = Boolean(editingClient)

    const endpoint = isEditing
      ? `${API_URL}${editingClient.id}/`
      : API_URL

    try {
      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const details =
          typeof data === 'object'
            ? Object.values(data).flat().join(' ')
            : ''

        throw new Error(
          details || 'Unable to save client. Please check the details.'
        )
      }

      closeForm()

      showMessage(
        isEditing
          ? 'Client updated successfully!'
          : 'Client added successfully!'
      )

      await loadClients()
    } catch (error) {
      showMessage(
        error.message || 'Could not connect to the server.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  // Delete a client after English confirmation
  const handleDelete = async (client) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${client.name}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setMessage('')

    try {
      const response = await fetch(`${API_URL}${client.id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.detail || 'Unable to delete client. Please try again.'
        )
      }

      setClients((previous) =>
        previous.filter((item) => item.id !== client.id)
      )

      if (editingClient?.id === client.id) {
        closeForm()
      }

      showMessage('Client deleted successfully!')
    } catch (error) {
      showMessage(
        error.message || 'Could not connect to the server.',
        'error'
      )
    }
  }

  // Search clients
  const filteredClients = clients.filter((client) => {
    const searchableText = [
      client.name,
      client.phone,
      client.email,
      client.address,
      client.requirements,
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(searchTerm.toLowerCase().trim())
  })

  const pageStyle = {
    padding: '30px 5%',
    minHeight: '80vh',
    background: '#fffaf7',
    color: '#302521',
  }

  const cardStyle = {
    background: '#fff',
    padding: '24px',
    borderRadius: '14px',
    border: '1px solid #f0e5df',
    marginBottom: '25px',
    boxShadow: '0 5px 20px rgba(70, 40, 25, 0.04)',
  }

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    fontSize: '14px',
    color: '#493a34',
  }

  const tableCellStyle = {
    padding: '13px 12px',
    borderBottom: '1px solid #eee5df',
    textAlign: 'left',
    verticalAlign: 'top',
    fontSize: '13px',
    overflowWrap: 'anywhere',
  }

  return (
    <main style={pageStyle}>
      {/* Page heading */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '32px',
              margin: '0 0 8px',
            }}
          >
            Client Management
          </h1>

          <p style={{ color: '#766a64', margin: 0, lineHeight: '1.6' }}>
            Manage client information, contact details and requirements.
          </p>

          {user?.name && (
            <p style={{ color: '#766a64', fontSize: '13px' }}>
              Account: {user.name}
            </p>
          )}
        </div>

        <button
          type="button"
          style={primaryButton}
          onClick={() => {
            if (isFormOpen && !editingClient) {
              closeForm()
            } else {
              openAddForm()
            }
          }}
        >
          {isFormOpen && !editingClient
            ? 'Cancel'
            : '+ Add New Client'}
        </button>
      </div>

      {/* Success and error messages */}
      {message && (
        <div
          role="status"
          style={{
            padding: '14px 16px',
            borderRadius: '9px',
            marginBottom: '22px',
            background:
              messageType === 'success' ? '#e9f8ee' : '#fff0e9',
            color:
              messageType === 'success' ? '#166534' : '#8b3e2c',
            border:
              messageType === 'success'
                ? '1px solid #b7e4c7'
                : '1px solid #f3c6b5',
            overflowWrap: 'anywhere',
          }}
        >
          {message}
        </div>
      )}

      {/* Add and Edit Client Form */}
      {isFormOpen && (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>
            {editingClient ? 'Edit Client' : 'Add New Client'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '0 20px',
              }}
            >
              <div>
                <label style={labelStyle} htmlFor="client-name">
                  Client Name *
                </label>
                <input
                  id="client-name"
                  name="name"
                  type="text"
                  style={inputStyle}
                  placeholder="Enter client name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="client-phone">
                  Phone Number *
                </label>
                <input
                  id="client-phone"
                  name="phone"
                  type="tel"
                  style={inputStyle}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={15}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="client-email">
                  Email Address
                </label>
                <input
                  id="client-email"
                  name="email"
                  type="email"
                  style={inputStyle}
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="client-address">
                  Address
                </label>
                <input
                  id="client-address"
                  name="address"
                  type="text"
                  style={inputStyle}
                  placeholder="Enter client address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle} htmlFor="client-requirements">
                  Event Requirements
                </label>
                <textarea
                  id="client-requirements"
                  name="requirements"
                  style={{
                    ...inputStyle,
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                  placeholder="Describe the client's event requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...primaryButton,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? 'Saving...'
                  : editingClient
                    ? 'Update Client'
                    : 'Save Client'}
              </button>

              <button
                type="button"
                style={secondaryButton}
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Clients List */}
      <section style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 7px' }}>Clients List</h2>

            <p style={{ color: '#766a64', margin: 0, fontSize: '14px' }}>
              Registered clients · Total: {filteredClients.length}
            </p>
          </div>

          <input
            aria-label="Search clients"
            type="search"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{
              ...inputStyle,
              width: 'min(100%, 300px)',
              margin: 0,
            }}
          />
        </div>

        {loading ? (
          <p style={{ padding: '25px 0', color: '#766a64' }}>
            Loading clients...
          </p>
        ) : filteredClients.length === 0 ? (
          <div
            style={{
              padding: '35px 15px',
              textAlign: 'center',
              color: '#766a64',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>
              👥
            </div>

            <h3 style={{ color: '#302521' }}>No clients found</h3>

            <p>
              {searchTerm
                ? 'No clients match your search. Try another keyword.'
                : 'Add a client to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table
              style={{
                width: '100%',
                minWidth: '850px',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ background: '#f8f0eb' }}>
                  {[
                    'Name',
                    'Phone',
                    'Email',
                    'Address',
                    'Requirements',
                    'Actions',
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        ...tableCellStyle,
                        fontWeight: '700',
                        color: '#493a34',
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td style={tableCellStyle}>
                      <strong>{client.name}</strong>
                    </td>

                    <td style={tableCellStyle}>{client.phone}</td>

                    <td style={tableCellStyle}>
                      {client.email || '—'}
                    </td>

                    <td style={tableCellStyle}>
                      {client.address || '—'}
                    </td>

                    <td style={tableCellStyle}>
                      {client.requirements || '—'}
                    </td>

                    <td style={tableCellStyle}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            ...secondaryButton,
                            padding: '8px 12px',
                          }}
                          onClick={() => openEditForm(client)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          style={{
                            ...primaryButton,
                            background: '#b42318',
                            padding: '8px 12px',
                          }}
                          onClick={() => handleDelete(client)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
