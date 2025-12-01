import React, { useEffect, useState } from 'react'
import type { User } from '../types'
import SearchBar from '../components/SearchBar'
import AddEditUser from '../components/AddEditUser'
import { useAuth } from '../contexts/AuthContext'

type UserWithUsername = User & { username: string }

const UsersPage: React.FC = () => {
  const { user, token } = useAuth()
  const [users, setUsers] = useState<UserWithUsername[]>([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<UserWithUsername | null>(null)
  const [showForm, setShowForm] = useState(false)

  const API = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'
  const allowed = user && (user.role === 'librarian' || user.role === 'admin')

  useEffect(() => {
    if (!allowed || !token) return
    const load = async () => {
      const url = `${API}/api/users${query ? `?q=${encodeURIComponent(query)}` : ''}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        setUsers([])
        return
      }
      const data = await res.json()
      setUsers(data)
    }
    load()
  }, [query, token, API, allowed])

  const createUser = async (payload: { name: string; username: string; password?: string; role: string }) => {
    if (!token) return alert('Brak tokenu')
    if (!allowed) return alert('Brak uprawnień')
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err.error || 'Błąd tworzenia użytkownika')
    }
    const data = await res.json()
    const newUser = data.user || data
    setUsers((prev) => [newUser, ...prev])
    setShowForm(false)
    setEditing(null)
  }

  const updateUser = async (id: string, payload: { name: string; username: string; password?: string; role: string }) => {
    if (!token) return alert('Brak tokenu')
    if (!allowed) return alert('Brak uprawnień')
    const res = await fetch(`${API}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err.error || 'Błąd aktualizacji użytkownika')
    }
    const updated = await res.json()
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!token) return alert('Brak tokenu')
    if (user?.role !== 'admin') return alert('Brak uprawnień')
    if (!confirm('Na pewno chcesz usunąć tego użytkownika?')) return
    const res = await fetch(`${API}/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return alert('Błąd usuwania')
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  if (!allowed) {
    return <div className="alert alert-danger">Dostęp zabroniony. Stronę mogą oglądać tylko użytkownicy z rolą librarian lub admin.</div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Użytkownicy</h3>
        <div>
          {(user?.role === 'librarian' || user?.role === 'admin') && (
            <button className="btn btn-success" onClick={() => { setEditing(null); setShowForm(true) }}>Dodaj użytkownika</button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="my-3">
          <AddEditUser
            initial={editing || null}
            onCancel={() => { setShowForm(false); setEditing(null) }}
            onSave={(payload: { name: string; username: string; password?: string; role: string }) => {
              if (editing) updateUser(editing.id, payload)
              else createUser(payload)
            }}
          />
        </div>
      )}

      <SearchBar query={query} onQueryChange={setQuery} />

      <div className="card">
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-3">No users</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  {(user?.role === 'librarian' || user?.role === 'admin') && (
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEditing(u); setShowForm(true) }}>Edit</button>
                  )}
                  {user?.role === 'admin' && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UsersPage