
import { useCallback, useEffect, useState } from 'react'

const API = 'http://127.0.0.1:8000/api/'

const EMPTY_FORM = {
  event: '',
  vendor: '',
  payment_type: 'Advance',
  description: '',
  amount: '',
  due_date: '',
  paid_date: '',
  status: 'Pending',
}

const buttonStyle = {
  padding: '10px 15px',
  border: 'none',
  borderRadius: '8px',
  background: '#a85d47',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: '600',
}

const inputStyle = {
  width: '100%',
  padding: '11px',
  marginTop: '6px',
  marginBottom: '15px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxSizing: 'border-box',
  fontSize: '14px',
  background: '#fff',
}

export default function PaymentManagement({ user }) {
  const [events, setEvents] = useState([])
  const [vendors, setVendors] = useState([])
  const [payments, setPayments] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingPayment, setEditingPayment] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const getHeaders = () => ({
    Authorization: `Token ${sessionStorage.getItem('authToken') || ''}`,
    'Content-Type': 'application/json',
  })

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
  }

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    })

    if (response.status === 204) {
      return null
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const details =
        typeof data === 'object' && data !== null
          ? Object.values(data).flat().join(' ')
          : ''

      throw new Error(
        details || data.detail || 'Request failed. Please try again.'
      )
    }

    return data
  }

  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      const [eventData, vendorData, paymentData] = await Promise.all([
        apiRequest(`${API}events/`),
        apiRequest(`${API}vendors/`),
        apiRequest(`${API}payments/`),
      ])

      setEvents(
        Array.isArray(eventData)
          ? eventData
          : eventData.results || []
      )

      setVendors(
        Array.isArray(vendorData)
          ? vendorData
          : vendorData.results || []
      )

      setPayments(
        Array.isArray(paymentData)
          ? paymentData
          : paymentData.results || []
      )
    } catch (error) {
      showMessage(
        error.message || 'Unable to load payment records.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getEventName = (eventId) => {
    const event = events.find(
      (item) => String(item.id) === String(eventId)
    )

    return event ? event.name : `Event #${eventId}`
  }

  const getVendorName = (vendorId) => {
    if (!vendorId) return '—'

    const vendor = vendors.find(
      (item) => String(item.id) === String(vendorId)
    )

    return vendor ? vendor.name : `Vendor #${vendorId}`
  }

  const money = (amount) =>
    Number(amount || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    })

  const closeForm = () => {
    setFormOpen(false)
    setEditingPayment(null)
    setForm({ ...EMPTY_FORM })
  }

  const openAddForm = () => {
    setEditingPayment(null)
    setForm({
      ...EMPTY_FORM,
      event: events.length ? String(events[0].id) : '',
    })
    setMessage('')
    setFormOpen(true)
  }

  const openEditForm = (payment) => {
    setEditingPayment(payment)

    setForm({
      event: String(payment.event),
      vendor: payment.vendor ? String(payment.vendor) : '',
      payment_type: payment.payment_type || 'Advance',
      description: payment.description || '',
      amount: String(payment.amount ?? ''),
      due_date: payment.due_date || '',
      paid_date: payment.paid_date || '',
      status: payment.status || 'Pending',
    })

    setMessage('')
    setFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!form.event || !form.amount || !form.due_date) {
      showMessage(
        'Please select an event and enter an amount and due date.',
        'error'
      )
      return
    }

    const amount = Number(form.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage('Payment amount must be greater than zero.', 'error')
      return
    }

    if (form.status === 'Paid' && !form.paid_date) {
      showMessage(
        'Please enter the payment date when the status is Paid.',
        'error'
      )
      return
    }

    setSaving(true)

    const isEditing = Boolean(editingPayment)
    const endpoint = isEditing
      ? `${API}payments/${editingPayment.id}/`
      : `${API}payments/`

    const payload = {
      event: Number(form.event),
      vendor: form.vendor ? Number(form.vendor) : null,
      payment_type: form.payment_type,
      description: form.description.trim(),
      amount: amount.toFixed(2),
      due_date: form.due_date,
      paid_date: form.status === 'Paid' ? form.paid_date : null,
      status: form.status,
    }

    try {
      await apiRequest(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })

      closeForm()

      showMessage(
        isEditing
          ? 'Payment updated successfully!'
          : 'Payment added successfully!'
      )

      await loadData()
    } catch (error) {
      showMessage(
        error.message || 'Unable to save payment.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (payment) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete this payment of ${money(payment.amount)}? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await apiRequest(`${API}payments/${payment.id}/`, {
        method: 'DELETE',
      })

      if (editingPayment?.id === payment.id) {
        closeForm()
      }

      showMessage('Payment deleted successfully!')
      await loadData()
    } catch (error) {
      showMessage(
        error.message || 'Unable to delete payment.',
        'error'
      )
    }
  }

  const totalPaid = payments
    .filter((payment) => payment.status === 'Paid')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  const totalPending = payments
    .filter((payment) => payment.status === 'Pending')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  const totalCancelled = payments
    .filter((payment) => payment.status === 'Cancelled')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  const filteredPayments = payments.filter((payment) => {
    const searchableText = [
      getEventName(payment.event),
      getVendorName(payment.vendor),
      payment.payment_type,
      payment.description,
      payment.status,
      payment.due_date,
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchableText.includes(
      search.trim().toLowerCase()
    )

    const matchesStatus =
      statusFilter === 'All' || payment.status === statusFilter

    const matchesType =
      typeFilter === 'All' || payment.payment_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const cardStyle = {
    background: '#fff',
    border: '1px solid #f0e5df',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: '0 5px 20px rgba(70, 40, 25, 0.04)',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
  }

  const cellStyle = {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #eee5df',
    fontSize: '13px',
    verticalAlign: 'top',
    overflowWrap: 'anywhere',
  }

  const statusColor = (status) => {
    if (status === 'Paid') return '#26734d'
    if (status === 'Cancelled') return '#b42318'
    return '#9a6700'
  }

  return (
    <main
      style={{
        minHeight: '80vh',
        padding: '30px 5%',
        background: '#fffaf7',
        color: '#302521',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* PAGE HEADER */}
      <header
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
          <h1 style={{ fontFamily: 'Georgia, serif', margin: '0 0 8px' }}>
            Payment Management
          </h1>

          <p style={{ color: '#766a64', margin: 0 }}>
            Track advances, vendor payments, due dates and final settlements.
          </p>

          {user?.name && (
            <p style={{ color: '#766a64', fontSize: '13px' }}>
              Account: {user.name}
            </p>
          )}
        </div>

        <button
          type="button"
          style={buttonStyle}
          onClick={openAddForm}
        >
          + Add Payment
        </button>
      </header>

      {/* ALERT MESSAGE */}
      {message && (
        <div
          role="status"
          style={{
            padding: '13px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: messageType === 'error' ? '#fff0e9' : '#e9f8ee',
            color: messageType === 'error' ? '#8b3e2c' : '#166534',
            overflowWrap: 'anywhere',
          }}
        >
          {message}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        {[
          ['Total Payments', payments.length],
          ['Total Paid', money(totalPaid)],
          ['Pending Payments', money(totalPending)],
          ['Cancelled Payments', money(totalCancelled)],
        ].map(([title, value]) => (
          <div key={title} style={cardStyle}>
            <p style={{ color: '#766a64', margin: '0 0 10px' }}>
              {title}
            </p>
            <h2 style={{ margin: 0, fontSize: '23px' }}>{value}</h2>
          </div>
        ))}
      </section>

      {/* ADD / EDIT FORM */}
      {formOpen && (
        <section
          style={{
            ...cardStyle,
            marginBottom: '25px',
            background: '#fffdfb',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {editingPayment ? 'Edit Payment' : 'Add New Payment'}
          </h2>

          {events.length === 0 && (
            <p style={{ color: '#8b3e2c' }}>
              No events are available. Create an event before adding payments.
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '0 20px',
              }}
            >
              <div>
                <label style={labelStyle} htmlFor="payment-event">
                  Event *
                </label>
                <select
                  id="payment-event"
                  required
                  style={inputStyle}
                  value={form.event}
                  onChange={(event) =>
                    setForm({ ...form, event: event.target.value })
                  }
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
                <label style={labelStyle} htmlFor="payment-type">
                  Payment Type *
                </label>
                <select
                  id="payment-type"
                  required
                  style={inputStyle}
                  value={form.payment_type}
                  onChange={(event) =>
                    setForm({ ...form, payment_type: event.target.value })
                  }
                >
                  <option value="Advance">Advance</option>
                  <option value="Milestone">Milestone Payment</option>
                  <option value="Vendor">Vendor Payment</option>
                  <option value="Final">Final Payment</option>
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="payment-vendor">
                  Vendor (Optional)
                </label>
                <select
                  id="payment-vendor"
                  style={inputStyle}
                  value={form.vendor}
                  onChange={(event) =>
                    setForm({ ...form, vendor: event.target.value })
                  }
                >
                  <option value="">No vendor selected</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="payment-amount">
                  Amount (INR) *
                </label>
                <input
                  id="payment-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  style={inputStyle}
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="payment-due-date">
                  Due Date *
                </label>
                <input
                  id="payment-due-date"
                  type="date"
                  required
                  style={inputStyle}
                  value={form.due_date}
                  onChange={(event) =>
                    setForm({ ...form, due_date: event.target.value })
                  }
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="payment-status">
                  Payment Status *
                </label>
                <select
                  id="payment-status"
                  required
                  style={inputStyle}
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value,
                      paid_date:
                        event.target.value === 'Paid'
                          ? form.paid_date
                          : '',
                    })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="payment-paid-date">
                  Paid Date {form.status === 'Paid' ? '*' : '(Optional)'}
                </label>
                <input
                  id="payment-paid-date"
                  type="date"
                  required={form.status === 'Paid'}
                  style={inputStyle}
                  disabled={form.status !== 'Paid'}
                  value={form.paid_date}
                  onChange={(event) =>
                    setForm({ ...form, paid_date: event.target.value })
                  }
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle} htmlFor="payment-description">
                  Description
                </label>
                <textarea
                  id="payment-description"
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                  }}
                  placeholder="Enter payment details"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={saving || events.length === 0}
                style={{
                  ...buttonStyle,
                  opacity: saving || events.length === 0 ? 0.6 : 1,
                }}
              >
                {saving
                  ? 'Saving...'
                  : editingPayment
                    ? 'Update Payment'
                    : 'Save Payment'}
              </button>

              <button
                type="button"
                disabled={saving}
                style={{
                  ...buttonStyle,
                  background: '#eee5df',
                  color: '#754536',
                }}
                onClick={closeForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* PAYMENTS LIST */}
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
            <h2 style={{ margin: '0 0 6px' }}>Payments List</h2>
            <p style={{ color: '#766a64', fontSize: '14px', margin: 0 }}>
              Matching payments: {filteredPayments.length}
            </p>
          </div>

          <input
            aria-label="Search payments"
            type="search"
            placeholder="Search payments..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ ...inputStyle, width: 'min(100%, 280px)', margin: 0 }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          <label style={{ fontSize: '13px', fontWeight: '600' }}>
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{ ...inputStyle, width: '170px', margin: '6px 0 0' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <label style={{ fontSize: '13px', fontWeight: '600' }}>
            Payment Type
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              style={{ ...inputStyle, width: '190px', margin: '6px 0 0' }}
            >
              <option value="All">All Types</option>
              <option value="Advance">Advance</option>
              <option value="Milestone">Milestone Payment</option>
              <option value="Vendor">Vendor Payment</option>
              <option value="Final">Final Payment</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p>Loading payments...</p>
        ) : filteredPayments.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center' }}>
            <h3>No payments found</h3>
            <p style={{ color: '#766a64' }}>
              {search || statusFilter !== 'All' || typeFilter !== 'All'
                ? 'No payments match the current filters. Try changing your search or filters.'
                : 'Add a payment to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: '1050px',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ background: '#f8f0eb' }}>
                  {[
                    'Event',
                    'Payment Type',
                    'Vendor',
                    'Description',
                    'Amount',
                    'Due Date',
                    'Paid Date',
                    'Status',
                    'Actions',
                  ].map((heading) => (
                    <th key={heading} style={cellStyle}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td style={cellStyle}>{getEventName(payment.event)}</td>
                    <td style={cellStyle}>{payment.payment_type}</td>
                    <td style={cellStyle}>{getVendorName(payment.vendor)}</td>
                    <td style={cellStyle}>{payment.description || '—'}</td>
                    <td style={cellStyle}>{money(payment.amount)}</td>
                    <td style={cellStyle}>{payment.due_date}</td>
                    <td style={cellStyle}>{payment.paid_date || '—'}</td>
                    <td style={cellStyle}>
                      <strong style={{ color: statusColor(payment.status) }}>
                        {payment.status}
                      </strong>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          style={{
                            ...buttonStyle,
                            background: '#eee5df',
                            color: '#754536',
                          }}
                          onClick={() => openEditForm(payment)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          style={{
                            ...buttonStyle,
                            background: '#b42318',
                          }}
                          onClick={() => handleDelete(payment)}
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
