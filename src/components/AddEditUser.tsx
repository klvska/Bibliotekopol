import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  initial?: Partial<{ id?: string; name?: string; username?: string; role?: string }> | null
  onCancel: () => void
  onSave: (payload: { name: string; username: string; password?: string; role: string }) => void
}

const AddEditUser: React.FC<Props> = ({ initial = null, onCancel, onSave }) => {
  const { user } = useAuth()
  const canEditRole = user?.role === 'admin'

  const [name, setName] = useState(initial?.name || '')
  const [username, setUsername] = useState(initial?.username || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(initial?.role || 'student')

  useEffect(() => {
    setName(initial?.name || '')
    setUsername(initial?.username || '')
    // librarians cannot set role - default to student when creating; keep existing when editing
    setRole(initial?.role || 'student')
    setPassword('')
  }, [initial])

  const handleSave = () => {
    if (!name.trim() || !username.trim()) return alert('Name and username are required')
    // Ensure only admin can change role; non-admins will submit the existing or default student role
    const payloadRole = canEditRole ? role : (initial?.role || 'student')
    onSave({ name: name.trim(), username: username.trim(), password: password ? password : undefined, role: payloadRole })
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="mb-2">
          <label className="form-label">Name</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="form-label">Username</label>
          <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="form-label">Password</label>
          <input className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={initial ? 'Leave blank to keep current password' : ''} />
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          {canEditRole ? (
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Uczeń</option>
              <option value="librarian">Bibliotekarz</option>
              <option value="admin">Admin</option>
            </select>
          ) : (
            <input className="form-control" value={role} disabled />
          )}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default AddEditUser