
import '../App.css'

function Register() {
  function handleRegister(event) {
    event.preventDefault()
    alert('Registration form submitted! Backend connection will be added later.')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <a href="/" className="login-logo">
          EverAfter<span>.</span>
        </a>

        <h1>Create Account</h1>

        <p className="login-subtitle">
          Join us and start planning your perfect celebration.
        </p>

        <form className="login-form" onSubmit={handleRegister}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="registerEmail">Email Address</label>
          <input
            id="registerEmail"
            type="email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="mobile">Mobile Number</label>
          <input
            id="mobile"
            type="tel"
            placeholder="Enter your mobile number"
            pattern="[0-9]{10}"
            title="Enter a 10-digit mobile number"
            required
          />

          <label htmlFor="registerPassword">Password</label>
          <input
            id="registerPassword"
            type="password"
            placeholder="Create a password (minimum 6 characters)"
            minLength={6}
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            minLength={6}
            required
          />

          <button type="submit" className="login-submit">
            Create Account →
          </button>
        </form>

        <p className="login-footer">
          Already have an account?{' '}
          <a href="/#login">Login</a>
        </p>

        <p className="login-footer">
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  )
}

export default Register