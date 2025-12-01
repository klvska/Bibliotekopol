import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import BooksPage from './pages/BooksPage'
import UsersPage from './pages/UsersPage'
import Login from './pages/Login'

const TopBar: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Bibliotekopol</Link>
        <div className="d-flex gap-2">
          <Link className="btn btn-primary" to="/books">Katalog</Link>
          {(user?.role == "admin" || user?.role == "librarian") && <Link className="btn btn-outline-secondary" to="/users">Użytkownicy</Link>}
          {user ? (
            <>
              <span className="align-self-center">{user.name} ({user.role})</span>
              <button className="btn btn-sm btn-outline-danger" onClick={() => logout()}>Wyloguj</button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-dark" to="/login">Zaloguj</Link>
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
      <TopBar />
      <div className="container-fluid d-flex justify-content-center align-items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
