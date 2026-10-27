
import React from "react";
import "./Dashboard.css";

function Dashboard() {
  const events = [
    {
      day: "15",
      month: "DEC",
      title: "Wedding Celebration",
      location: "Kolhapur • Main Wedding Event",
      status: "Upcoming",
      statusClass: "status-upcoming",
    },
    {
      day: "18",
      month: "DEC",
      title: "Reception",
      location: "Kolhapur • Reception Event",
      status: "Planned",
      statusClass: "status-planned",
    },
    {
      day: "20",
      month: "DEC",
      title: "Family Celebration",
      location: "Kagal • Special Event",
      status: "Ready",
      statusClass: "status-ready",
    },
  ];

  const quickActions = [
    {
      icon: "📋",
      title: "Manage Events",
      path: "/events",
    },
    {
      icon: "👥",
      title: "Manage Guests",
      path: "/guests",
    },
    {
      icon: "💰",
      title: "Manage Budget",
      path: "/budget",
    },
    {
      icon: "📅",
      title: "Manage Tasks",
      path: "/tasks",
    },
  ];

  return (
    <div className="dashboard">

      <nav className="dashboard-navbar">
        <div className="logo">
          💍 WedPlan
        </div>

        <div className="admin-area">
          <span className="admin-name">
            Welcome, Admin
          </span>

          <button
            className="logout-btn"
            onClick={() => alert("Logged out successfully!")}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">

        <div className="dashboard-label">
          ADMIN DASHBOARD
        </div>

        <h1 className="dashboard-title">
          Wedding Planner Overview
        </h1>

        <p className="dashboard-description">
          Manage your wedding events, guests, budget and tasks
          from one place.
        </p>

        <a href="/" className="home-btn">
          ← Home
        </a>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">💍</div>
            <div className="stat-title">Total Events</div>
            <div className="stat-value">12</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-title">Total Guests</div>
            <div className="stat-value">248</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-title">Total Budget</div>
            <div className="stat-value">₹5.2L</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-title">Tasks</div>
            <div className="stat-value">36</div>
          </div>

        </div>

        <section className="events-section">

          <div className="events-header">

            <div>
              <div className="section-label">
                EVENT MANAGEMENT
              </div>

              <h2 className="section-title">
                Upcoming Events
              </h2>
            </div>

            <button
              className="add-event-btn"
              onClick={() => alert("Add Event clicked!")}
            >
              + Add Event
            </button>

          </div>

          <div className="events-list">

            {events.map((event, index) => (
              <div className="event-card" key={index}>

                <div className="event-date">
                  <span className="event-day">
                    {event.day}
                  </span>

                  <span className="event-month">
                    {event.month}
                  </span>
                </div>

                <h3 className="event-title">
                  {event.title}
                </h3>

                <p className="event-location">
                  {event.location}
                </p>

                <span
                  className={`event-status ${event.statusClass}`}
                >
                  {event.status}
                </span>

              </div>
            ))}

          </div>

        </section>

        <section className="quick-section">

          <div className="section-label">
            QUICK ACTIONS
          </div>

          <h2 className="section-title">
            Manage Planning
          </h2>

          <div className="quick-grid">

            {quickActions.map((action, index) => (
              <a
                href={action.path}
                className="quick-card"
                key={index}
              >
                <span className="quick-icon">
                  {action.icon}
                </span>

                <span className="quick-text">
                  {action.title}
                </span>
              </a>
            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
