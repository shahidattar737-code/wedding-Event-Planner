import { useCallback, useEffect, useMemo, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/api/reports/summary/'

const currency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

const styles = {
  page: {
    minHeight: '100vh',
    padding: '30px 5%',
    background: '#fffaf7',
    color: '#302521',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontFamily: 'Georgia, serif',
    fontSize: '34px',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#766a64',
    margin: '0 0 24px',
    lineHeight: 1.6,
  },
  button: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '8px',
    background: '#a85d47',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  },
  card: {
    background: '#fff',
    padding: '22px',
    border: '1px solid #f0e5df',
    borderRadius: '14px',
    boxShadow: '0 5px 20px rgba(70,40,25,0.05)',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statLabel: {
    color: '#766a64',
    fontSize: '13px',
    marginBottom: '10px',
  },
  statValue: {
    color: '#a85d47',
    fontSize: '27px',
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },
  sectionTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '23px',
    margin: '0 0 18px',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '950px',
  },
  th: {
    padding: '13px 12px',
    background: '#f8f1ec',
    textAlign: 'left',
    fontSize: '13px',
    borderBottom: '1px solid #eadbd3',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 12px',
    fontSize: '13px',
    borderBottom: '1px solid #eee5df',
    verticalAlign: 'top',
  },
  message: {
    padding: '13px 15px',
    borderRadius: '9px',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
}

function MetricCard({ label, value, note }) {
  return (
    <div style={styles.card}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>

      {note && (
        <div
          style={{
            color: '#766a64',
            fontSize: '12px',
            marginTop: '8px',
          }}
        >
          {note}
        </div>
      )}
    </div>
  )
}

function ProgressRow({
  label,
  value,
  maximum,
  color = '#a85d47',
  displayValue,
}) {
  const percent =
    maximum > 0 ? Math.min(100, (value / maximum) * 100) : 0

  return (
    <div style={{ marginBottom: '17px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '7px',
          fontSize: '13px',
        }}
      >
        <span>{label}</span>
        <strong>{displayValue}</strong>
      </div>

      <div
        aria-label={`${label}: ${Math.round(percent)} percent`}
        style={{
          height: '9px',
          borderRadius: '999px',
          background: '#f0e5df',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: color,
            borderRadius: '999px',
            transition: 'width 180ms ease',
          }}
        />
      </div>
    </div>
  )
}

export default function ReportsAnalytics() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = sessionStorage.getItem('authToken')

      const response = await fetch(API_URL, {
        headers: token
          ? { Authorization: `Token ${token}` }
          : {},
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            'Could not load reports. Check the backend and login session.'
        )
      }

      setReport(data)
    } catch (requestError) {
      setError(
        requestError.message || 'Unable to load reports.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const summary = report?.summary
  const events = report?.events || []
  const vendorCosts = report?.vendor_costs || []

  const totalTaskProgress = useMemo(() => {
    if (!summary?.total_tasks) return 0

    return Math.round(
      (summary.completed_tasks / summary.total_tasks) * 100
    )
  }, [summary])

  const budgetMax = Math.max(
    Number(summary?.planned_expenses) || 0,
    Number(summary?.actual_expenses) || 0,
    1
  )

  return (
    <main style={styles.page}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={styles.heading}>Reports &amp; Analytics</h1>

          <p style={styles.subtitle}>
            Review event performance, budgets, tasks and payment
            status in one place.
          </p>

          {report?.generated_at && (
            <p
              style={{
                color: '#766a64',
                fontSize: '12px',
                marginTop: '-12px',
              }}
            >
              Updated:{' '}
              {new Date(report.generated_at).toLocaleString('en-IN')}
            </p>
          )}
        </div>

        <button
          type="button"
          style={styles.button}
          onClick={loadReport}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh Report'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            ...styles.message,
            background: '#fff0e9',
            color: '#8b3e2c',
          }}
        >
          {error}

          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              style={styles.button}
              onClick={loadReport}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {loading && !report ? (
        <div style={styles.card}>Loading report data...</div>
      ) : summary ? (
        <>
          <h2 style={styles.sectionTitle}>Event Summary</h2>

          <div style={styles.statGrid}>
            <MetricCard
              label="Total Events"
              value={summary.total_events}
              note={`${summary.planning_events} planning · ${summary.confirmed_events} confirmed`}
            />

            <MetricCard
              label="Completed Events"
              value={summary.completed_events}
              note={`${summary.cancelled_events} cancelled`}
            />

            <MetricCard
              label="Combined Event Budget"
              value={currency(summary.event_budget_total)}
            />

            <MetricCard
              label="Total Quotations"
              value={summary.total_quotations}
              note={`Quotation value ${currency(summary.quotation_value_total)}`}
            />
          </div>

          <div style={styles.statGrid}>
            <MetricCard
              label="Planned Expenses"
              value={currency(summary.planned_expenses)}
              note={`${summary.total_budget_items} budget items`}
            />

            <MetricCard
              label="Actual Expenses"
              value={currency(summary.actual_expenses)}
              note={`Variance ${currency(
                Number(summary.planned_expenses) -
                  Number(summary.actual_expenses)
              )}`}
            />

            <MetricCard
              label="Payments Received"
              value={currency(summary.paid_amount)}
              note={`${summary.total_payments} total payment records`}
            />

            <MetricCard
              label="Pending Payments"
              value={currency(summary.pending_amount)}
              note={`Cancelled ${currency(summary.cancelled_amount)}`}
            />

            <MetricCard
              label="Vendor Payments Paid"
              value={currency(summary.vendor_paid_amount)}
              note={`Vendor payments pending ${currency(
                summary.vendor_pending_amount
              )}`}
            />
          </div>

          <div
            style={{
              ...styles.statGrid,
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>Budget Analysis</h2>

              <ProgressRow
                label="Planned Expenses"
                value={Number(summary.planned_expenses) || 0}
                maximum={budgetMax}
                displayValue={currency(summary.planned_expenses)}
                color="#a85d47"
              />

              <ProgressRow
                label="Actual Expenses"
                value={Number(summary.actual_expenses) || 0}
                maximum={budgetMax}
                displayValue={currency(summary.actual_expenses)}
                color="#6f8b75"
              />

              <p
                style={{
                  color: '#766a64',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  marginBottom: 0,
                }}
              >
                Variance is planned expenses minus actual expenses.
                Positive means actual expenses are lower than planned.
              </p>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>Task Progress</h2>

              <div
                style={{
                  fontSize: '30px',
                  color: '#a85d47',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                {totalTaskProgress}%
              </div>

              <ProgressRow
                label="Completed"
                value={Number(summary.completed_tasks) || 0}
                maximum={Number(summary.total_tasks) || 0}
                displayValue={`${summary.completed_tasks} / ${summary.total_tasks}`}
                color="#6f8b75"
              />

              <ProgressRow
                label="In Progress"
                value={Number(summary.in_progress_tasks) || 0}
                maximum={Number(summary.total_tasks) || 0}
                displayValue={summary.in_progress_tasks}
                color="#b58a45"
              />

              <ProgressRow
                label="Pending"
                value={Number(summary.pending_tasks) || 0}
                maximum={Number(summary.total_tasks) || 0}
                displayValue={summary.pending_tasks}
                color="#a85d47"
              />

              <p
                style={{
                  color: '#766a64',
                  fontSize: '12px',
                  marginBottom: 0,
                }}
              >
                Cancelled tasks: {summary.cancelled_tasks}
              </p>
            </section>
          </div>

          <section
            style={{ ...styles.card, marginBottom: '24px' }}
          >
            <h2 style={styles.sectionTitle}>Vendor Payment Costs</h2>

            {vendorCosts.length === 0 ? (
              <p style={{ color: '#766a64' }}>
                No vendor payments are recorded for these events.
              </p>
            ) : (
              <div style={styles.tableWrap}>
                <table
                  style={{
                    ...styles.table,
                    minWidth: '620px',
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        'Vendor',
                        'Type',
                        'Total Vendor Payments',
                        'Paid',
                        'Pending',
                      ].map((heading) => (
                        <th key={heading} style={styles.th}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {vendorCosts.map((vendor) => (
                      <tr key={vendor.id}>
                        <td style={styles.td}>
                          <strong>{vendor.name}</strong>
                        </td>
                        <td style={styles.td}>{vendor.vendor_type}</td>
                        <td style={styles.td}>
                          {currency(vendor.total_amount)}
                        </td>
                        <td style={styles.td}>
                          {currency(vendor.paid_amount)}
                        </td>
                        <td style={styles.td}>
                          {currency(vendor.pending_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Event-wise Report</h2>

            {events.length === 0 ? (
              <p style={{ color: '#766a64' }}>
                No events are available for this account.
              </p>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {[
                        'Event',
                        'Date',
                        'Status',
                        'Event Budget',
                        'Budget Balance',
                        'Approved Quote',
                        'Planned Expenses',
                        'Actual Expenses',
                        'Paid',
                        'Pending',
                        'Tasks',
                      ].map((heading) => (
                        <th key={heading} style={styles.th}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td style={styles.td}>
                          <strong>{event.name}</strong>
                        </td>
                        <td style={styles.td}>{event.event_date}</td>
                        <td style={styles.td}>{event.status}</td>
                        <td style={styles.td}>
                          {currency(event.budget)}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            color:
                              Number(event.budget_balance) < 0
                                ? '#b42318'
                                : '#166534',
                          }}
                        >
                          {currency(event.budget_balance)}
                        </td>
                        <td style={styles.td}>
                          {currency(event.approved_quotation_value)}
                        </td>
                        <td style={styles.td}>
                          {currency(event.planned_expenses)}
                        </td>
                        <td style={styles.td}>
                          {currency(event.actual_expenses)}
                        </td>
                        <td style={styles.td}>
                          {currency(event.paid_amount)}
                        </td>
                        <td style={styles.td}>
                          {currency(event.pending_amount)}
                        </td>
                        <td style={styles.td}>
                          {event.completed_tasks} / {event.total_tasks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : !error ? (
        <div style={styles.card}>
          No report data was returned by the server.
        </div>
      ) : null}
    </main>
  )
}