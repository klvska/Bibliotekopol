import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import BooksPage from './pages/BooksPage'
import './App.css'

const TopBar: React.FC = () => {
  const { user, login, logout } = useAuth()
  const quickLogin = async (role: 'student' | 'librarian' | 'admin') => {
    try {
      if (role === 'student') await login('student', 'student123')
      else if (role === 'librarian') await login('librarian', 'lib123')
      else await login('admin', 'admin123')
    } catch (err: any) {
      alert(err.message || 'Login failed')
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Bibliotekopol</Link>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-primary" to="/books">Katalog</Link>
          {user ? (
            <>
              <span className="align-self-center">{user.name} ({user.role})</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => logout()}>Wyloguj</button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-outline-success" onClick={() => quickLogin('student')}>Zaloguj jako uczeń</button>
              <button className="btn btn-sm btn-outline-warning" onClick={() => quickLogin('librarian')}>Zaloguj jako bibliotekarz</button>
              <button className="btn btn-sm btn-outline-dark" onClick={() => quickLogin('admin')}>Zaloguj jako admin</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="container">
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BooksPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
