
import { useCallback, useEffect, useState } from 'react'

const API = 'http://127.0.0.1:8000/api/'

const EMPTY_FORM = {
  event: '',
  title: '',
  description: '',
  assigned_to: '',
  deadline: '',
  priority: 'Medium',
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

export default function TaskManagement({ user }) {
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingTask, setEditingTask] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
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
      if (!response.ok) {
        throw new Error('The request could not be completed.')
      }
      return null
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const details =
        typeof data === 'object' && data !== null
          ? Object.values(data).flat().join(' ')
          : ''

      throw new Error(
        details || 'The request failed. Please try again.'
      )
    }

    return data
  }

  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      const [eventData, taskData] = await Promise.all([
        apiRequest(`${API}events/`),
        apiRequest(`${API}tasks/`),
      ])

      setEvents(
        Array.isArray(eventData)
          ? eventData
          : eventData.results || []
      )

      setTasks(
        Array.isArray(taskData)
          ? taskData
          : taskData.results || []
      )
    } catch (error) {
      showMessage(
        error.message || 'Unable to load tasks. Check the backend connection.',
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
    const found = events.find(
      (event) => String(event.id) === String(eventId)
    )

    return found ? found.name : `Event #${eventId}`
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingTask(null)
    setForm({ ...EMPTY_FORM })
  }

  const openAddForm = () => {
    setEditingTask(null)
    setForm({
      ...EMPTY_FORM,
      event: events.length ? String(events[0].id) : '',
    })
    setMessage('')
    setFormOpen(true)
  }

  const openEditForm = (task) => {
    setEditingTask(task)

    setForm({
      event: String(task.event),
      title: task.title || '',
      description: task.description || '',
      assigned_to: task.assigned_to
        ? String(task.assigned_to)
        : '',
      deadline: task.deadline || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
    })

    setMessage('')
    setFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!form.event || !form.title.trim() || !form.deadline) {
      showMessage(
        'Please select an event and enter a task title and deadline.',
        'error'
      )
      return
    }

    if (
      form.assigned_to.trim() &&
      (!Number.isInteger(Number(form.assigned_to)) ||
        Number(form.assigned_to) < 1)
    ) {
      showMessage(
        'Assigned User ID must be a positive whole number.',
        'error'
      )
      return
    }

    setSaving(true)

    const isEditing = Boolean(editingTask)
    const endpoint = isEditing
      ? `${API}tasks/${editingTask.id}/`
      : `${API}tasks/`

    const payload = {
      event: Number(form.event),
      title: form.title.trim(),
      description: form.description.trim(),
      assigned_to: form.assigned_to.trim()
        ? Number(form.assigned_to)
        : null,
      deadline: form.deadline,
      priority: form.priority,
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
          ? 'Task updated successfully!'
          : 'Task added successfully!'
      )

      await loadData()
    } catch (error) {
      showMessage(
        error.message || 'Unable to save the task.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await apiRequest(`${API}tasks/${task.id}/`, {
        method: 'DELETE',
      })

      if (editingTask?.id === task.id) {
        closeForm()
      }

      showMessage('Task deleted successfully!')
      await loadData()
    } catch (error) {
      showMessage(
        error.message || 'Unable to delete the task.',
        'error'
      )
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const searchableText = [
      task.title,
      task.description,
      task.status,
      task.priority,
      getEventName(task.event),
      task.deadline,
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchableText.includes(
      search.trim().toLowerCase()
    )

    const matchesStatus =
      statusFilter === 'All' || task.status === statusFilter

    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const completedCount = tasks.filter(
    (task) => task.status === 'Completed'
  ).length

  const pendingCount = tasks.filter(
    (task) => task.status === 'Pending'
  ).length

  const inProgressCount = tasks.filter(
    (task) => task.status === 'In Progress'
  ).length

  const pageCard = {
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

  const priorityColor = (priority) => {
    if (priority === 'High') return '#b42318'
    if (priority === 'Low') return '#26734d'
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
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              margin: '0 0 8px',
            }}
          >
            Task Management
          </h1>

          <p style={{ color: '#766a64', margin: 0 }}>
            Plan tasks, assign work, set deadlines and track progress.
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
          + Add New Task
        </button>
      </header>

      {/* SUCCESS AND ERROR MESSAGES */}
      {message && (
        <div
          role="status"
          style={{
            padding: '13px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            background:
              messageType === 'error' ? '#fff0e9' : '#e9f8ee',
            color:
              messageType === 'error' ? '#8b3e2c' : '#166534',
            overflowWrap: 'anywhere',
          }}
        >
          {message}
        </div>
      )}

      {/* TASK SUMMARY */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        {[
          ['Total Tasks', tasks.length],
          ['Pending', pendingCount],
          ['In Progress', inProgressCount],
          ['Completed', completedCount],
        ].map(([title, value]) => (
          <div key={title} style={pageCard}>
            <p style={{ color: '#766a64', margin: '0 0 10px' }}>
              {title}
            </p>
            <h2 style={{ margin: 0, fontSize: '26px' }}>{value}</h2>
          </div>
        ))}
      </section>

      {/* TASK FORM */}
      {formOpen && (
        <section
          style={{
            ...pageCard,
            marginBottom: '25px',
            background: '#fffdfb',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>

          {events.length === 0 && (
            <p style={{ color: '#8b3e2c' }}>
              No events are available. Create an event before adding tasks.
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
                <label style={labelStyle} htmlFor="task-event">
                  Event *
                </label>
                <select
                  id="task-event"
                  style={inputStyle}
                  required
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
                <label style={labelStyle} htmlFor="task-title">
                  Task Title *
                </label>
                <input
                  id="task-title"
                  style={inputStyle}
                  required
                  maxLength={200}
                  placeholder="For example: Confirm decorator"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="task-deadline">
                  Deadline *
                </label>
                <input
                  id="task-deadline"
                  type="date"
                  style={inputStyle}
                  required
                  value={form.deadline}
                  onChange={(event) =>
                    setForm({ ...form, deadline: event.target.value })
                  }
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="task-priority">
                  Priority
                </label>
                <select
                  id="task-priority"
                  style={inputStyle}
                  value={form.priority}
                  onChange={(event) =>
                    setForm({ ...form, priority: event.target.value })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="task-status">
                  Task Status
                </label>
                <select
                  id="task-status"
                  style={inputStyle}
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="task-assignee">
                  Assigned User ID (optional)
                </label>
                <input
                  id="task-assignee"
                  type="number"
                  min="1"
                  step="1"
                  style={inputStyle}
                  placeholder="Enter the user's database ID"
                  value={form.assigned_to}
                  onChange={(event) =>
                    setForm({ ...form, assigned_to: event.target.value })
                  }
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle} htmlFor="task-description">
                  Description
                </label>
                <textarea
                  id="task-description"
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                  }}
                  placeholder="Describe the task and any important details"
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
                  : editingTask
                    ? 'Update Task'
                    : 'Save Task'}
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

      {/* TASKS LIST */}
      <section style={pageCard}>
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
            <h2 style={{ margin: '0 0 6px' }}>Tasks List</h2>
            <p style={{ margin: 0, color: '#766a64', fontSize: '14px' }}>
              Matching tasks: {filteredTasks.length}
            </p>
          </div>

          <input
            type="search"
            aria-label="Search tasks"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ ...inputStyle, maxWidth: '260px', margin: 0 }}
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
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <label style={{ fontSize: '13px', fontWeight: '600' }}>
            Priority
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              style={{ ...inputStyle, width: '170px', margin: '6px 0 0' }}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center' }}>
            <h3>No tasks found</h3>
            <p style={{ color: '#766a64' }}>
              {search || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'No tasks match the current filters. Try changing your search or filters.'
                : 'Add a task to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: '950px',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ background: '#f8f0eb' }}>
                  {[
                    'Event',
                    'Task',
                    'Deadline',
                    'Priority',
                    'Status',
                    'Assigned User ID',
                    'Actions',
                  ].map((heading) => (
                    <th key={heading} style={cellStyle}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td style={cellStyle}>{getEventName(task.event)}</td>

                    <td style={cellStyle}>
                      <strong>{task.title}</strong>
                      {task.description && (
                        <p style={{ color: '#766a64', marginBottom: 0 }}>
                          {task.description}
                        </p>
                      )}
                    </td>

                    <td style={cellStyle}>{task.deadline}</td>

                    <td style={cellStyle}>
                      <span
                        style={{
                          fontWeight: '700',
                          color: priorityColor(task.priority),
                        }}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td style={cellStyle}>{task.status}</td>

                    <td style={cellStyle}>{task.assigned_to || '—'}</td>

                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          style={{
                            ...buttonStyle,
                            background: '#eee5df',
                            color: '#754536',
                          }}
                          onClick={() => openEditForm(task)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          style={{
                            ...buttonStyle,
                            background: '#b42318',
                          }}
                          onClick={() => handleDelete(task)}
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
