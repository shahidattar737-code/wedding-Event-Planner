import React from "react";

import {
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "./index.css";

/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  return (
    <div className="home-page">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">
        <div className="nav-container">

          <div className="logo">
            <span className="logo-icon">💍</span>

            <div>
              <h2>WedPlan</h2>
              <p>WEDDING EVENT PLANNER</p>
            </div>
          </div>

          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="nav-buttons">

            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/register" className="register-btn">
              Get Started
            </Link>

          </div>

        </div>
      </header>


      {/* ================= HERO SECTION ================= */}

      <section className="hero" id="home">

        <div className="hero-container">

          <div className="hero-content">

            <div className="hero-badge">
              ✨ PLAN • ORGANIZE • CELEBRATE
            </div>

            <h1>
              Plan Your
              <span> Perfect Wedding </span>
              With Ease
            </h1>

            <p>
              Create, organize and manage every detail of your wedding
              event from one simple and beautiful platform.
            </p>

            <div className="hero-buttons">

              <Link to="/register" className="primary-btn">
                Start Planning
                <span>→</span>
              </Link>

              <a href="#features" className="secondary-btn">
                Explore Features
              </a>

            </div>

            <div className="hero-info">

              <div className="info-item">
                <strong>01</strong>
                <span>Create Event</span>
              </div>

              <div className="info-item">
                <strong>02</strong>
                <span>Plan Details</span>
              </div>

              <div className="info-item">
                <strong>03</strong>
                <span>Enjoy Your Day</span>
              </div>

            </div>

          </div>


          {/* ================= EVENT CARD ================= */}

          <div className="hero-card-wrapper">

            <div className="floating-card top-card">

              <span>💐</span>

              <div>
                <strong>Beautiful Moments</strong>
                <small>Make them unforgettable</small>
              </div>

            </div>


            <div className="main-event-card">

              <div className="event-card-top">
                <span>YOUR SPECIAL DAY</span>
                <span>♡</span>
              </div>

              <div className="rings">
                💍
              </div>

              <h3>
                Wedding Celebration
              </h3>

              <p>
                Your dream wedding starts with a perfect plan.
              </p>


              <div className="event-details">

                <div>

                  <span>📅</span>

                  <p>
                    <small>DATE</small>
                    <b>Plan Your Date</b>
                  </p>

                </div>


                <div>

                  <span>📍</span>

                  <p>
                    <small>VENUE</small>
                    <b>Your Dream Venue</b>
                  </p>

                </div>

              </div>


              <div className="event-progress">

                <div className="progress-heading">

                  <span>
                    Planning Progress
                  </span>

                  <b>
                    Ready
                  </b>

                </div>

                <div className="progress-bar">
                  <div></div>
                </div>

              </div>

            </div>


            <div className="floating-card bottom-card">

              <span>✓</span>

              <div>
                <strong>Everything Organized</strong>
                <small>All in one place</small>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= TRUST SECTION ================= */}

      <section className="trust-section">

        <div className="trust-container">

          <div className="trust-text">

            <span>
              SMART WEDDING PLANNING
            </span>

            <h2>
              Everything you need in one place
            </h2>

          </div>


          <div className="trust-items">

            <div>
              <strong>Easy</strong>
              <span>to use</span>
            </div>

            <div>
              <strong>Simple</strong>
              <span>planning</span>
            </div>

            <div>
              <strong>Smart</strong>
              <span>organization</span>
            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section className="features-section" id="features">

        <div className="section-heading">

          <span>
            OUR FEATURES
          </span>

          <h2>
            Plan every detail
            <br />
            <em>without the stress.</em>
          </h2>

          <p>
            WedPlan brings the important parts of your wedding planning
            together so you can focus on creating beautiful memories.
          </p>

        </div>


        <div className="feature-grid">


          <div className="feature-card">

            <div className="feature-icon">
              📋
            </div>

            <span className="feature-number">
              01
            </span>

            <h3>
              Event Management
            </h3>

            <p>
              Create and manage your wedding events with important
              information organized in one place.
            </p>

            <a href="#services">
              Learn More →
            </a>

          </div>


          <div className="feature-card featured">

            <div className="feature-icon">
              👥
            </div>

            <span className="feature-number">
              02
            </span>

            <h3>
              Guest Management
            </h3>

            <p>
              Keep your guest information organized and make planning
              your special day easier.
            </p>

            <a href="#services">
              Learn More →
            </a>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              💰
            </div>

            <span className="feature-number">
              03
            </span>

            <h3>
              Budget Planning
            </h3>

            <p>
              Organize your wedding expenses and keep track of your
              event planning budget.
            </p>

            <a href="#services">
              Learn More →
            </a>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📅
            </div>

            <span className="feature-number">
              04
            </span>

            <h3>
              Task Planning
            </h3>

            <p>
              Organize important wedding tasks and keep your planning
              progress under control.
            </p>

            <a href="#services">
              Learn More →
            </a>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📍
            </div>

            <span className="feature-number">
              05
            </span>

            <h3>
              Venue Planning
            </h3>

            <p>
              Keep your venue-related information organized while
              preparing for your special celebration.
            </p>

            <a href="#services">
              Learn More →
            </a>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📄
            </div>

            <span className="feature-number">
              06
            </span>

            <h3>
              Document Management
            </h3>

            <p>
              Keep important event documents and information organized
              for easy access whenever required.
            </p>

            <a href="#services">
              Learn More →
            </a>

          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}

      <section className="services-section" id="services">

        <div className="services-container">

          <div className="services-content">

            <span>
              WEDDING PLANNING MADE SIMPLE
            </span>

            <h2>
              From the first idea
              <br />
              to the <em>big day.</em>
            </h2>

            <p>
              Whether you are just starting your wedding planning or
              already have everything in motion, keep your event
              organized with WedPlan.
            </p>

            <Link
              to="/register"
              className="dark-btn"
            >
              Create Your Event →
            </Link>

          </div>


          <div className="services-list">

            <div className="service-row">

              <div className="service-icon">
                01
              </div>

              <div>
                <h3>
                  Create Your Event
                </h3>

                <p>
                  Start your wedding planning journey by creating your event.
                </p>
              </div>

              <span>
                →
              </span>

            </div>


            <div className="service-row">

              <div className="service-icon">
                02
              </div>

              <div>

                <h3>
                  Organize Information
                </h3>

                <p>
                  Keep important wedding details organized and easy to manage.
                </p>

              </div>

              <span>
                →
              </span>

            </div>


            <div className="service-row">

              <div className="service-icon">
                03
              </div>

              <div>

                <h3>
                  Manage Your Plans
                </h3>

                <p>
                  Stay updated with your tasks, guests, budget and venue details.
                </p>

              </div>

              <span>
                →
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}

      <section className="about-section" id="about">

        <div className="about-container">

          <div className="about-image">

            <div className="about-image-box">

              <div className="about-decoration">
                ✦
              </div>

              <div className="about-center">

                <span>
                  W
                </span>

                <small>
                  Wedding
                </small>

              </div>

            </div>

          </div>


          <div className="about-content">

            <span>
              ABOUT WEDPLAN
            </span>

            <h2>
              Your wedding,
              <br />
              <em>your way.</em>
            </h2>

            <p>
              Planning a wedding can involve many different details.
              WedPlan is designed to bring those details together in
              a simple and organized digital workspace.
            </p>

            <p>
              Create your event, organize your information and manage
              your wedding planning journey from one platform.
            </p>


            <div className="about-points">

              <div>
                <span>✓</span>
                <p>
                  Simple and organized planning
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Manage important event details
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  One platform for your wedding
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="cta-section">

        <div className="cta-content">

          <span>
            READY TO START?
          </span>

          <h2>
            Let's plan something
            <br />
            <em>beautiful.</em>
          </h2>

          <p>
            Start organizing your wedding event today.
          </p>

          <Link
            to="/register"
            className="cta-button"
          >
            Get Started Now →
          </Link>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer
        className="footer"
        id="contact"
      >

        <div className="footer-container">


          <div className="footer-brand">

            <div className="logo footer-logo">

              <span className="logo-icon">
                💍
              </span>

              <div>

                <h2>
                  WedPlan
                </h2>

                <p>
                  Wedding Event Planner
                </p>

              </div>

            </div>

            <p>
              A simple and organized way to plan,
              manage and celebrate your special day.
            </p>

          </div>


          <div className="footer-column">

            <h3>
              Explore
            </h3>

            <a href="#home">
              Home
            </a>

            <a href="#features">
              Features
            </a>

            <a href="#services">
              Services
            </a>

            <a href="#about">
              About
            </a>

          </div>


          <div className="footer-column">

            <h3>
              Account
            </h3>

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>

            <Link to="/dashboard">
              Dashboard
            </Link>

          </div>


          <div className="footer-column">

            <h3>
              Contact
            </h3>

            <span>
              📍 Maharashtra, India
            </span>

            <span>
              💌 Wedding Planning
            </span>

            <span>
              ✨ Make It Special
            </span>

          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © 2026 WedPlan. All Rights Reserved.
          </p>

          <p>
            Made for beautiful celebrations ♥
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   LOGIN PAGE
========================================================= */

function Login() {

  const handleLogin = (event) => {

    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    if (!email || !password) {

      alert(
        "Please enter Email and Password."
      );

      return;
    }

    /*
      Demo login:
      Any valid entered email/password
      will open Dashboard.
    */

    window.location.href = "/dashboard";
  };


  return (
    <div className="auth-page">

      <div className="auth-card">

        <Link
          to="/"
          className="auth-logo"
        >
          💍
        </Link>

        <span className="auth-label">
          WELCOME TO WEDPLAN
        </span>

        <h1>
          Welcome Back
        </h1>

        <p className="auth-subtitle">
          Login to continue planning your perfect wedding.
        </p>


        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="text"
              name="email"
              placeholder="Enter your email"
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
            />

          </div>


          <div className="form-options">

            <label className="remember-me">

              <input
                type="checkbox"
              />

              Remember me

            </label>

            <a href="#forgot">
              Forgot Password?
            </a>

          </div>


          <button
            type="submit"
            className="auth-submit"
          >
            Login
            <span>→</span>
          </button>

        </form>


        <p className="auth-register">

          Don't have an account?

          <Link to="/register">
            Register
          </Link>

        </p>


        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}


/* =========================================================
   REGISTER PAGE
========================================================= */

function Register() {

  const handleRegister = (event) => {

    event.preventDefault();

    const name =
      event.target.name.value;

    const email =
      event.target.email.value;

    const password =
      event.target.password.value;

    const confirmPassword =
      event.target.confirmPassword.value;


    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {

      alert(
        "Please fill all fields."
      );

      return;
    }


    if (
      password !== confirmPassword
    ) {

      alert(
        "Passwords do not match."
      );

      return;
    }


    alert(
      "Registration successful!"
    );

    window.location.href =
      "/dashboard";
  };


  return (
    <div className="auth-page">

      <div className="auth-card register-card">

        <Link
          to="/"
          className="auth-logo"
        >
          💍
        </Link>

        <span className="auth-label">
          START YOUR JOURNEY
        </span>

        <h1>
          Create Account
        </h1>

        <p className="auth-subtitle">
          Create your WedPlan account and start planning.
        </p>


        <form onSubmit={handleRegister}>

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
            />

          </div>


          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
            />

          </div>


          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
            />

          </div>


          <button
            type="submit"
            className="auth-submit"
          >
            Create Account
            <span>→</span>
          </button>

        </form>


        <p className="auth-register">

          Already have an account?

          <Link to="/login">
            Login
          </Link>

        </p>


        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function Dashboard() {

  return (
    <div className="dashboard-page">

      <header className="dashboard-navbar">

        <div className="dashboard-logo">

          💍

          <span>
            WedPlan
          </span>

        </div>


        <div className="dashboard-user">

          <span>
            Welcome, Admin
          </span>

          <Link
            to="/"
            className="logout-btn"
          >
            Logout
          </Link>

        </div>

      </header>


      <main className="dashboard-container">

        <div className="dashboard-heading">

          <div>

            <span>
              ADMIN DASHBOARD
            </span>

            <h1>
              Wedding Planner Overview
            </h1>

            <p>
              Manage your wedding events, guests, budget and tasks
              from one place.
            </p>

          </div>


          <Link
            to="/"
            className="dashboard-home-btn"
          >
            ← Home
          </Link>

        </div>


        <div className="dashboard-cards">


          <div className="dashboard-card">

            <span className="dashboard-card-icon">
              💍
            </span>

            <div>

              <small>
                Total Events
              </small>

              <h2>
                12
              </h2>

            </div>

          </div>


          <div className="dashboard-card">

            <span className="dashboard-card-icon">
              👥
            </span>

            <div>

              <small>
                Total Guests
              </small>

              <h2>
                248
              </h2>

            </div>

          </div>


          <div className="dashboard-card">

            <span className="dashboard-card-icon">
              💰
            </span>

            <div>

              <small>
                Total Budget
              </small>

              <h2>
                ₹5.2L
              </h2>

            </div>

          </div>


          <div className="dashboard-card">

            <span className="dashboard-card-icon">
              📋
            </span>

            <div>

              <small>
                Tasks
              </small>

              <h2>
                36
              </h2>

            </div>

          </div>

        </div>


        <div className="dashboard-grid">


          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <span>
                  EVENT MANAGEMENT
                </span>

                <h2>
                  Upcoming Events
                </h2>

              </div>

              <button>
                + Add Event
              </button>

            </div>


            <div className="event-list">


              <div className="dashboard-event">

                <div className="event-date">

                  <strong>
                    15
                  </strong>

                  <span>
                    DEC
                  </span>

                </div>


                <div>

                  <h3>
                    Wedding Celebration
                  </h3>

                  <p>
                    Kolhapur • Main Wedding Event
                  </p>

                </div>


                <span className="status">
                  Upcoming
                </span>

              </div>


              <div className="dashboard-event">

                <div className="event-date">

                  <strong>
                    18
                  </strong>

                  <span>
                    DEC
                  </span>

                </div>


                <div>

                  <h3>
                    Reception
                  </h3>

                  <p>
                    Kolhapur • Reception Event
                  </p>

                </div>


                <span className="status">
                  Planned
                </span>

              </div>


              <div className="dashboard-event">

                <div className="event-date">

                  <strong>
                    20
                  </strong>

                  <span>
                    DEC
                  </span>

                </div>


                <div>

                  <h3>
                    Family Celebration
                  </h3>

                  <p>
                    Kagal • Special Event
                  </p>

                </div>


                <span className="status">
                  Ready
                </span>

              </div>

            </div>

          </div>


          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <span>
                  QUICK ACTIONS
                </span>

                <h2>
                  Manage Planning
                </h2>

              </div>

            </div>


            <div className="quick-actions">

              <button>

                📋

                <span>
                  Manage Events
                </span>

              </button>


              <button>

                👥

                <span>
                  Manage Guests
                </span>

              </button>


              <button>

                💰

                <span>
                  Manage Budget
                </span>

              </button>


              <button>

                📅

                <span>
                  Manage Tasks
                </span>

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   APP ROUTING
   IMPORTANT:
   BrowserRouter is NOT here.
   It is already present in main.jsx.
========================================================= */

function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>

  );
}

export default App;