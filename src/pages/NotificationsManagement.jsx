import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/api'

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    setLoading(true)
    setError('')

    try {
      const token = sessionStorage.getItem('authToken')

      if (!token) {
        throw new Error('Please log in to view notifications.')
      }

      const response = await fetch(`${API_URL}/notifications/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            'Unable to load notifications.'
        )
      }

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : []
      )
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const formatDate = (date) => {
    if (!date) return 'Date unavailable'

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const severityColors = {
    overdue: '#b42318',
    urgent: '#b45309',
    upcoming: '#166534',
  }

  const severityLabels = {
    overdue: 'Overdue',
    urgent: 'Due Soon',
    upcoming: 'Upcoming',
  }

  const pageStyle = {
    padding: '30px 7%',
    color: '#302521',
  }

  const cardStyle = {
    background: '#fff',
    border: '1px solid #f0e5df',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 4px 15px rgba(70, 40, 25, 0.05)',
  }

  const buttonStyle = {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#a85d47',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
  }

  return (
    <main style={pageStyle}>
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
          <h1 style={{ fontFamily: 'Georgia, serif' }}>
            Notifications
          </h1>

          <p style={{ color: '#766a64', lineHeight: '1.6' }}>
            Keep track of upcoming events, task deadlines and
            pending payments.
          </p>
        </div>

        <button
          type="button"
          style={buttonStyle}
          onClick={loadNotifications}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            ...cardStyle,
            color: '#b42318',
            background: '#fff1f0',
          }}
        >
          {error}
        </div>
      )}

      {!error && !loading && (
        <div
          style={{
            ...cardStyle,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <strong>Total Notifications</strong>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#a85d47',
            }}
          >
            {notifications.length}
          </span>
        </div>
      )}

      {loading && (
        <p role="status">Loading notifications...</p>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div style={cardStyle}>
          <h3>No upcoming reminders</h3>
          <p style={{ color: '#766a64' }}>
            There are no matching event, task or payment reminders
            for the current notification window.
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        notifications.map((item) => (
          <article key={item.id} style={cardStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ flex: '1 1 250px' }}>
                <p
                  style={{
                    margin: '0 0 8px',
                    color: '#a85d47',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {item.type}
                </p>

                <h3 style={{ margin: '0 0 10px' }}>
                  {item.title}
                </h3>

                <p style={{ lineHeight: '1.6', margin: '0 0 10px' }}>
                  {item.message}
                </p>

                {item.event && (
                  <p style={{ color: '#766a64', fontSize: '14px' }}>
                    Event: {item.event}
                  </p>
                )}

                {item.amount !== undefined && (
                  <p style={{ fontWeight: '600' }}>
                    Amount: ₹{item.amount}
                  </p>
                )}

                <p
                  style={{
                    color: '#766a64',
                    fontSize: '13px',
                    marginBottom: 0,
                  }}
                >
                  Date: {formatDate(item.date)}
                </p>
              </div>

              <span
                style={{
                  background: '#f8f0eb',
                  color:
                    severityColors[item.severity] || '#754536',
                  padding: '7px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
                {severityLabels[item.severity] || 'Reminder'}
              </span>
            </div>
          </article>
        ))}
    </main>
  )
}