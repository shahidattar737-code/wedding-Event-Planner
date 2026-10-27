import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../App.css'
import '../login.css.css'


function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/login/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.detail ||
          'Invalid username or password.'
        )
      }

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username.trim())

      navigate('/dashboard')
    } catch (err) {
      setError(
        err.message ||
        'Backend connection failed. Please check Django server.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      <div className="login-decoration login-decoration-one"></div>
      <div className="login-decoration login-decoration-two"></div>

      <div className="login-container">

        <Link to="/" className="login-logo">
          <span className="login-logo-icon">
            💍
          </span>

          <div>
            <strong>WedPlan</strong>
            <small>WEDDING EVENT PLANNER</small>
          </div>
        </Link>

        <div className="login-heading">

          <span className="login-welcome">
            WELCOME TO WEDPLAN
          </span>

          <h1>Welcome Back</h1>

          <p>
            Login to continue planning your
            <br />
            perfect wedding.
          </p>

        </div>

        <div className="login-card">

          <form onSubmit={handleLogin}>

            <div className="login-field">

              <label htmlFor="username">
                Username / Email Address
              </label>

              <div className="login-input-wrapper">

                <span>✉</span>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  autoComplete="username"
                  required
                />

              </div>

            </div>

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">

                <span>🔒</span>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

              </div>

            </div>

            {error && (
              <div className="login-error">
                ⚠ {error}
              </div>
            )}

            <div className="login-options">

              <label className="remember-option">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  alert(
                    'Please contact administrator to reset your password.'
                  )
                }
              >
                Forgot Password?
              </button>

            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  Login
                  <span>→</span>
                </>
              )}
            </button>

          </form>

          <div className="login-register">
            <span>Don't have an account?</span>

            <Link to="/register">
              Create Account
            </Link>
          </div>

        </div>

        <Link to="/" className="back-home">
          <span>←</span>
          Back to Home
        </Link>

      </div>

    </div>
  )
}

export default Login;