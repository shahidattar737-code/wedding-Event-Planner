
import { useCallback, useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/api/vendors/'

const EMPTY_FORM = {
  name: '',
  vendor_type: 'Decorator',
  phone: '',
  email: '',
  address: '',
  services: '',
  payment_terms: '',
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

export default function Vendors({ user }) {
  const [vendors, setVendors] = useState([])
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editingVendor, setEditingVendor] = useState(null)
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

  // Load vendors from the backend
  const loadVendors = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: getHeaders(),
      })

      const data = await response.json().catch(() => [])

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load vendors. Please log in again.'
        )
      }

      setVendors(Array.isArray(data) ? data : data.results || [])
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
    loadVendors()
  }, [loadVendors])

  // Update form fields
  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Open the form to add a vendor
  const openAddForm = () => {
    setEditingVendor(null)
    setFormData({ ...EMPTY_FORM })
    setIsFormOpen(true)
    setMessage('')
  }

  // Open the form to edit a vendor
  const openEditForm = (vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name || '',
      vendor_type: vendor.vendor_type || 'Other',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      services: vendor.services || '',
      payment_terms: vendor.payment_terms || '',
    })
    setIsFormOpen(true)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Close and reset the form
  const closeForm = () => {
    setIsFormOpen(false)
    setEditingVendor(null)
    setFormData({ ...EMPTY_FORM })
  }

  // Add or update a vendor
  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!formData.name.trim() || !formData.phone.trim()) {
      showMessage('Vendor name and phone number are required.', 'error')
      return
    }

    setSaving(true)

    const isEditing = Boolean(editingVendor)
    const endpoint = isEditing
      ? `${API_URL}${editingVendor.id}/`
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
          details || 'Unable to save vendor. Please check the details.'
        )
      }

      closeForm()
      showMessage(
        isEditing
          ? 'Vendor updated successfully!'
          : 'Vendor added successfully!'
      )

      await loadVendors()
    } catch (error) {
      showMessage(
        error.message || 'Could not connect to the server.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  // Permanently delete a vendor after confirmation
  const handleDelete = async (vendor) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${vendor.name}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setMessage('')

    try {
      const response = await fetch(`${API_URL}${vendor.id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          data.detail || 'Unable to delete vendor. Please try again.'
        )
      }

      setVendors((previous) =>
        previous.filter((item) => item.id !== vendor.id)
      )

      if (editingVendor?.id === vendor.id) {
        closeForm()
      }

      showMessage('Vendor deleted successfully!')
    } catch (error) {
      showMessage(
        error.message || 'Could not connect to the server.',
        'error'
      )
    }
  }

  // Search vendors by their details
  const filteredVendors = vendors.filter((vendor) => {
    const searchableText = [
      vendor.name,
      vendor.vendor_type,
      vendor.phone,
      vendor.email,
      vendor.address,
      vendor.services,
      vendor.payment_terms,
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
            Vendor Management
          </h1>

          <p style={{ color: '#766a64', margin: 0, lineHeight: '1.6' }}>
            Manage decorators, caterers, photographers and other vendors.
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
            if (isFormOpen && !editingVendor) {
              closeForm()
            } else {
              openAddForm()
            }
          }}
        >
          {isFormOpen && !editingVendor
            ? 'Cancel'
            : '+ Add New Vendor'}
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

      {/* Add and edit form */}
      {isFormOpen && (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>
            {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
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
                <label style={labelStyle} htmlFor="vendor-name">
                  Vendor Name *
                </label>
                <input
                  id="vendor-name"
                  name="name"
                  style={inputStyle}
                  type="text"
                  placeholder="Enter vendor name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vendor-type">
                  Vendor Type *
                </label>
                <select
                  id="vendor-type"
                  name="vendor_type"
                  style={inputStyle}
                  value={formData.vendor_type}
                  onChange={handleChange}
                  required
                >
                  <option value="Decorator">Decorator</option>
                  <option value="Caterer">Caterer</option>
                  <option value="Photographer">Photographer</option>
                  <option value="DJ">DJ</option>
                  <option value="Venue">Venue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="vendor-phone">
                  Phone Number *
                </label>
                <input
                  id="vendor-phone"
                  name="phone"
                  style={inputStyle}
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={15}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vendor-email">
                  Email Address
                </label>
                <input
                  id="vendor-email"
                  name="email"
                  style={inputStyle}
                  type="email"
                  placeholder="vendor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vendor-address">
                  Address
                </label>
                <input
                  id="vendor-address"
                  name="address"
                  style={inputStyle}
                  type="text"
                  placeholder="Enter vendor address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vendor-services">
                  Services
                </label>
                <input
                  id="vendor-services"
                  name="services"
                  style={inputStyle}
                  type="text"
                  placeholder="Enter services offered"
                  value={formData.services}
                  onChange={handleChange}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle} htmlFor="vendor-payment">
                  Payment Terms
                </label>
                <textarea
                  id="vendor-payment"
                  name="payment_terms"
                  style={{
                    ...inputStyle,
                    minHeight: '90px',
                    resize: 'vertical',
                  }}
                  placeholder="For example: 50% advance, 50% after event"
                  value={formData.payment_terms}
                  onChange={handleChange}
                  rows={3}
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
                  : editingVendor
                    ? 'Update Vendor'
                    : 'Save Vendor'}
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

      {/* Vendors list */}
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
            <h2 style={{ margin: '0 0 7px' }}>Vendors List</h2>
            <p style={{ color: '#766a64', margin: 0, fontSize: '14px' }}>
              All registered vendors · Total: {filteredVendors.length}
            </p>
          </div>

          <input
            aria-label="Search vendors"
            type="search"
            placeholder="Search vendors..."
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
            Loading vendors...
          </p>
        ) : filteredVendors.length === 0 ? (
          <div
            style={{
              padding: '35px 15px',
              textAlign: 'center',
              color: '#766a64',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>
              🧾
            </div>
            <h3 style={{ color: '#302521' }}>No vendors found</h3>
            <p>
              {searchTerm
                ? 'No vendors match your search. Try a different keyword.'
                : 'Add a vendor to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table
              style={{
                width: '100%',
                minWidth: '1000px',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ background: '#f8f0eb' }}>
                  {[
                    'Name',
                    'Type',
                    'Phone',
                    'Email',
                    'Address',
                    'Services',
                    'Payment Terms',
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
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td style={tableCellStyle}>
                      <strong>{vendor.name}</strong>
                    </td>
                    <td style={tableCellStyle}>{vendor.vendor_type}</td>
                    <td style={tableCellStyle}>{vendor.phone}</td>
                    <td style={tableCellStyle}>{vendor.email || '—'}</td>
                    <td style={tableCellStyle}>{vendor.address || '—'}</td>
                    <td style={tableCellStyle}>{vendor.services || '—'}</td>
                    <td style={tableCellStyle}>
                      {vendor.payment_terms || '—'}
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
                          onClick={() => openEditForm(vendor)}
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
                          onClick={() => handleDelete(vendor)}
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
