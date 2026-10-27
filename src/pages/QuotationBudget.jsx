
import { useCallback, useEffect, useState } from 'react'

const API = 'http://127.0.0.1:8000/api/'

const emptyQuotation = {
  event: '',
  title: '',
  description: '',
  total_amount: '',
  status: 'Draft',
}

const emptyBudget = {
  event: '',
  category: '',
  description: '',
  planned_amount: '',
  actual_amount: '0',
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
  marginBottom: '14px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxSizing: 'border-box',
  fontSize: '14px',
}

export default function QuotationBudget({ user }) {
  const [events, setEvents] = useState([])
  const [quotations, setQuotations] = useState([])
  const [budgetItems, setBudgetItems] = useState([])

  const [activeTab, setActiveTab] = useState('quotations')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [quotationForm, setQuotationForm] = useState(emptyQuotation)
  const [budgetForm, setBudgetForm] = useState(emptyBudget)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  const getHeaders = () => ({
    Authorization: `Token ${sessionStorage.getItem('authToken') || ''}`,
    'Content-Type': 'application/json',
  })

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
  }

  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    })

    if (response.status === 204) {
      if (!response.ok) {
        throw new Error('The operation could not be completed.')
      }
      return null
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const details =
        typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : ''

      throw new Error(
        details || data.detail || 'The request failed. Please try again.'
      )
    }

    return data
  }

  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      const [eventData, quotationData, budgetData] = await Promise.all([
        request(`${API}events/`),
        request(`${API}quotations/`),
        request(`${API}budget-items/`),
      ])

      setEvents(Array.isArray(eventData) ? eventData : eventData.results || [])
      setQuotations(
        Array.isArray(quotationData)
          ? quotationData
          : quotationData.results || []
      )
      setBudgetItems(
        Array.isArray(budgetData) ? budgetData : budgetData.results || []
      )
    } catch (error) {
      showMessage(error.message || 'Unable to load data.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const eventName = (eventId) => {
    const found = events.find((item) => String(item.id) === String(eventId))
    return found ? found.name : `Event #${eventId}`
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
    setQuotationForm({ ...emptyQuotation })
    setBudgetForm({ ...emptyBudget })
  }

  const openAddForm = () => {
    setEditingItem(null)
    setQuotationForm({
      ...emptyQuotation,
      event: events.length ? String(events[0].id) : '',
    })
    setBudgetForm({
      ...emptyBudget,
      event: events.length ? String(events[0].id) : '',
    })
    setMessage('')
    setFormOpen(true)
  }

  const openEditQuotation = (item) => {
    setEditingItem(item)
    setQuotationForm({
      event: String(item.event),
      title: item.title || '',
      description: item.description || '',
      total_amount: String(item.total_amount),
      status: item.status || 'Draft',
    })
    setMessage('')
    setFormOpen(true)
  }

  const openEditBudget = (item) => {
    setEditingItem(item)
    setBudgetForm({
      event: String(item.event),
      category: item.category || '',
      description: item.description || '',
      planned_amount: String(item.planned_amount),
      actual_amount: String(item.actual_amount ?? '0'),
    })
    setMessage('')
    setFormOpen(true)
  }

  const handleQuotationSubmit = async (event) => {
    event.preventDefault()

    if (!quotationForm.event || !quotationForm.title.trim()) {
      showMessage('Please select an event and enter a quotation title.', 'error')
      return
    }

    if (
      quotationForm.total_amount === '' ||
      !Number.isFinite(Number(quotationForm.total_amount)) ||
      Number(quotationForm.total_amount) < 0
    ) {
      showMessage('Enter a valid quotation amount.', 'error')
      return
    }

    setSaving(true)

    try {
      const isEditing = Boolean(editingItem)
      const url = isEditing
        ? `${API}quotations/${editingItem.id}/`
        : `${API}quotations/`

      await request(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...quotationForm,
          event: Number(quotationForm.event),
          title: quotationForm.title.trim(),
          total_amount: quotationForm.total_amount,
        }),
      })

      closeForm()
      showMessage(
        isEditing
          ? 'Quotation updated successfully!'
          : 'Quotation created successfully!'
      )
      await loadData()
    } catch (error) {
      showMessage(error.message || 'Unable to save quotation.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleBudgetSubmit = async (event) => {
    event.preventDefault()

    if (!budgetForm.event || !budgetForm.category.trim()) {
      showMessage('Please select an event and enter a budget category.', 'error')
      return
    }

    const planned = Number(budgetForm.planned_amount)
    const actual = Number(budgetForm.actual_amount)

    if (
      budgetForm.planned_amount === '' ||
      !Number.isFinite(planned) ||
      planned < 0 ||
      !Number.isFinite(actual) ||
      actual < 0
    ) {
      showMessage('Enter valid, non-negative budget amounts.', 'error')
      return
    }

    setSaving(true)

    try {
      const isEditing = Boolean(editingItem)
      const url = isEditing
        ? `${API}budget-items/${editingItem.id}/`
        : `${API}budget-items/`

      await request(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...budgetForm,
          event: Number(budgetForm.event),
          category: budgetForm.category.trim(),
          planned_amount: planned.toFixed(2),
          actual_amount: actual.toFixed(2),
        }),
      })

      closeForm()
      showMessage(
        isEditing
          ? 'Budget item updated successfully!'
          : 'Budget item added successfully!'
      )
      await loadData()
    } catch (error) {
      showMessage(error.message || 'Unable to save budget item.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item, type) => {
    const isQuotation = type === 'quotation'
    const endpoint = isQuotation ? 'quotations' : 'budget-items'
    const itemName = isQuotation ? item.title : item.category

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await request(`${API}${endpoint}/${item.id}/`, {
        method: 'DELETE',
      })

      showMessage(
        isQuotation
          ? 'Quotation deleted successfully!'
          : 'Budget item deleted successfully!'
      )
      await loadData()
    } catch (error) {
      showMessage(error.message || 'Unable to delete this item.', 'error')
    }
  }

  const visibleItems =
    activeTab === 'quotations' ? quotations : budgetItems

  const filteredItems = visibleItems.filter((item) => {
    const text = [
      item.title,
      item.category,
      item.description,
      item.status,
      item.event ? eventName(item.event) : '',
    ]
      .join(' ')
      .toLowerCase()

    return text.includes(search.trim().toLowerCase())
  })

  const totalPlanned = budgetItems.reduce(
    (sum, item) => sum + Number(item.planned_amount || 0),
    0
  )

  const totalActual = budgetItems.reduce(
    (sum, item) => sum + Number(item.actual_amount || 0),
    0
  )

  const money = (amount) =>
    Number(amount || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
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
            Quotation &amp; Budget Management
          </h1>
          <p style={{ color: '#766a64', margin: 0 }}>
            Manage event quotations, planned expenses and actual costs.
          </p>
          {user?.name && (
            <p style={{ color: '#766a64', fontSize: '13px' }}>
              Account: {user.name}
            </p>
          )}
        </div>

        <button type="button" style={buttonStyle} onClick={openAddForm}>
          + Add {activeTab === 'quotations' ? 'Quotation' : 'Budget Item'}
        </button>
      </header>

      {message && (
        <div
          role="status"
          style={{
            padding: '13px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: messageType === 'error' ? '#fff0e9' : '#e9f8ee',
            color: messageType === 'error' ? '#8b3e2c' : '#166534',
          }}
        >
          {message}
        </div>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '16px',
          marginBottom: '25px',
        }}
      >
        {[
          ['Total Quotations', quotations.length],
          ['Total Budget Items', budgetItems.length],
          ['Planned Expenses', money(totalPlanned)],
          ['Actual Expenses', money(totalActual)],
        ].map(([title, value]) => (
          <div key={title} style={cardStyle}>
            <p style={{ color: '#766a64', margin: '0 0 10px' }}>{title}</p>
            <h2 style={{ margin: 0, fontSize: '23px' }}>{value}</h2>
          </div>
        ))}
      </section>

      <section style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              style={{
                ...buttonStyle,
                background: activeTab === 'quotations' ? '#a85d47' : '#eee5df',
                color: activeTab === 'quotations' ? '#fff' : '#754536',
              }}
              onClick={() => {
                setActiveTab('quotations')
                closeForm()
                setSearch('')
                setMessage('')
              }}
            >
              Quotations
            </button>

            <button
              type="button"
              style={{
                ...buttonStyle,
                background: activeTab === 'budget' ? '#a85d47' : '#eee5df',
                color: activeTab === 'budget' ? '#fff' : '#754536',
              }}
              onClick={() => {
                setActiveTab('budget')
                closeForm()
                setSearch('')
                setMessage('')
              }}
            >
              Budget Items
            </button>
          </div>

          <input
            type="search"
            aria-label="Search records"
            placeholder={`Search ${activeTab === 'quotations' ? 'quotations' : 'budget items'}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ ...inputStyle, maxWidth: '300px', margin: 0 }}
          />
        </div>

        {formOpen && (
          <form
            onSubmit={
              activeTab === 'quotations'
                ? handleQuotationSubmit
                : handleBudgetSubmit
            }
            style={{
              ...cardStyle,
              marginBottom: '25px',
              background: '#fffaf7',
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingItem ? 'Edit' : 'Add'}{' '}
              {activeTab === 'quotations' ? 'Quotation' : 'Budget Item'}
            </h2>

            <label style={labelStyle} htmlFor="quote-event">
              Event *
            </label>
            <select
              id="quote-event"
              required
              value={
                activeTab === 'quotations'
                  ? quotationForm.event
                  : budgetForm.event
              }
              onChange={(event) => {
                if (activeTab === 'quotations') {
                  setQuotationForm({
                    ...quotationForm,
                    event: event.target.value,
                  })
                } else {
                  setBudgetForm({
                    ...budgetForm,
                    event: event.target.value,
                  })
                }
              }}
              style={inputStyle}
            >
              <option value="">Select an event</option>
              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            {events.length === 0 && (
              <p style={{ color: '#8b3e2c', fontSize: '13px' }}>
                No events are available. Create an event before adding a
                quotation or budget item.
              </p>
            )}

            {activeTab === 'quotations' ? (
              <>
                <label style={labelStyle} htmlFor="quotation-title">
                  Quotation Title *
                </label>
                <input
                  id="quotation-title"
                  required
                  style={inputStyle}
                  value={quotationForm.title}
                  onChange={(event) =>
                    setQuotationForm({
                      ...quotationForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="For example: Wedding Package"
                />

                <label style={labelStyle} htmlFor="quotation-description">
                  Description
                </label>
                <textarea
                  id="quotation-description"
                  style={inputStyle}
                  rows={3}
                  value={quotationForm.description}
                  onChange={(event) =>
                    setQuotationForm({
                      ...quotationForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the proposed package"
                />

                <label style={labelStyle} htmlFor="quotation-amount">
                  Total Quotation Amount (INR) *
                </label>
                <input
                  id="quotation-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  style={inputStyle}
                  value={quotationForm.total_amount}
                  onChange={(event) =>
                    setQuotationForm({
                      ...quotationForm,
                      total_amount: event.target.value,
                    })
                  }
                  placeholder="Enter quotation amount"
                />

                <label style={labelStyle} htmlFor="quotation-status">
                  Status
                </label>
                <select
                  id="quotation-status"
                  style={inputStyle}
                  value={quotationForm.status}
                  onChange={(event) =>
                    setQuotationForm({
                      ...quotationForm,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </>
            ) : (
              <>
                <label style={labelStyle} htmlFor="budget-category">
                  Expense Category *
                </label>
                <input
                  id="budget-category"
                  required
                  style={inputStyle}
                  value={budgetForm.category}
                  onChange={(event) =>
                    setBudgetForm({
                      ...budgetForm,
                      category: event.target.value,
                    })
                  }
                  placeholder="For example: Decoration"
                />

                <label style={labelStyle} htmlFor="budget-description">
                  Description
                </label>
                <input
                  id="budget-description"
                  style={inputStyle}
                  value={budgetForm.description}
                  onChange={(event) =>
                    setBudgetForm({
                      ...budgetForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the expense"
                />

                <label style={labelStyle} htmlFor="planned-amount">
                  Planned Amount (INR) *
                </label>
                <input
                  id="planned-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  style={inputStyle}
                  value={budgetForm.planned_amount}
                  onChange={(event) =>
                    setBudgetForm({
                      ...budgetForm,
                      planned_amount: event.target.value,
                    })
                  }
                  placeholder="Enter planned cost"
                />

                <label style={labelStyle} htmlFor="actual-amount">
                  Actual Amount (INR)
                </label>
                <input
                  id="actual-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  style={inputStyle}
                  value={budgetForm.actual_amount}
                  onChange={(event) =>
                    setBudgetForm({
                      ...budgetForm,
                      actual_amount: event.target.value,
                    })
                  }
                />
              </>
            )}

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
                  : editingItem
                    ? 'Update'
                    : 'Save'}{' '}
                {activeTab === 'quotations' ? 'Quotation' : 'Budget Item'}
              </button>

              <button
                type="button"
                style={{ ...buttonStyle, background: '#eee5df', color: '#754536' }}
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading records...</p>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center' }}>
            <h3>No records found</h3>
            <p style={{ color: '#766a64' }}>
              {search
                ? 'No matching records were found. Try a different search.'
                : `Add a ${activeTab === 'quotations' ? 'quotation' : 'budget item'} to get started.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: '750px',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ background: '#f8f0eb' }}>
                  {(activeTab === 'quotations'
                    ? ['Event', 'Title', 'Amount', 'Status', 'Actions']
                    : ['Event', 'Category', 'Planned', 'Actual', 'Difference', 'Actions']
                  ).map((heading) => (
                    <th key={heading} style={cellStyle}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td style={cellStyle}>{eventName(item.event)}</td>

                    {activeTab === 'quotations' ? (
                      <>
                        <td style={cellStyle}>
                          <strong>{item.title}</strong>
                          {item.description && (
                            <p style={{ color: '#766a64', marginBottom: 0 }}>
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td style={cellStyle}>{money(item.total_amount)}</td>
                        <td style={cellStyle}>{item.status}</td>
                      </>
                    ) : (
                      <>
                        <td style={cellStyle}>
                          <strong>{item.category}</strong>
                          {item.description && (
                            <p style={{ color: '#766a64', marginBottom: 0 }}>
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td style={cellStyle}>{money(item.planned_amount)}</td>
                        <td style={cellStyle}>{money(item.actual_amount)}</td>
                        <td style={cellStyle}>
                          {money(Number(item.planned_amount || 0) - Number(item.actual_amount || 0))}
                        </td>
                      </>
                    )}

                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          style={{
                            ...buttonStyle,
                            background: '#eee5df',
                            color: '#754536',
                          }}
                          onClick={() =>
                            activeTab === 'quotations'
                              ? openEditQuotation(item)
                              : openEditBudget(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          style={{ ...buttonStyle, background: '#b42318' }}
                          onClick={() =>
                            handleDelete(
                              item,
                              activeTab === 'quotations'
                                ? 'quotation'
                                : 'budget'
                            )
                          }
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
