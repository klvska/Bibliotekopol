import React, { useEffect, useState } from 'react'
import type { Book } from '../types'
import SearchBar from '../components/SearchBar'
import BookList from '../components/BookList'
import AddEditBook from '../components/AddEditBook'
import { useAuth } from '../contexts/AuthContext'

const BooksPage: React.FC = () => {
  const { user, token } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Book | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // fetch books from API
    const load = async () => {
      const url = `${API}/api/books${query ? `?q=${encodeURIComponent(query)}` : ''}`
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      setBooks(data)
    }
    load()
  }, [query])

  const API = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

  const borrow = async (bookId: string) => {
    if (!token) return alert('Zaloguj się, aby wypożyczyć')
    const res = await fetch(`${API}/api/books/${bookId}/borrow`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err.error || 'Błąd wypożyczenia')
    }
    const data = await res.json()
    // refresh list
    setBooks((prev) => prev.map((b) => (b.id === bookId ? data.book : b)))
  }

  const returnBook = async (bookId: string) => {
    if (!token) return alert('Zaloguj się, aby zwrócić')
  const res = await fetch(`${API}/api/books/${bookId}/return`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err.error || 'Błąd zwrotu')
    }
    const data = await res.json()
    setBooks((prev) => prev.map((b) => (b.id === bookId ? data.book : b)))
  }

  const createBook = async (payload: { title: string; author: string; category: string; year?: number }) => {
    if (!token) return alert('Brak tokenu')
  const res = await fetch(`${API}/api/books`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    if (!res.ok) return alert('Błąd tworzenia książki')
    const newBook = await res.json()
    // refresh list
    setBooks((prev) => [newBook, ...prev])
    setShowForm(false)
    setEditing(null)
  }

  const updateBook = async (id: string, payload: { title: string; author: string; category: string; year?: number }) => {
    if (!token) return alert('Brak tokenu')
  const res = await fetch(`${API}/api/books/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    if (!res.ok) return alert('Błąd aktualizacji')
    const updated = await res.json()
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)))
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!token) return alert('Brak tokenu')
    if (!confirm('Na pewno chcesz usunąć tę książkę?')) return
  const res = await fetch(`${API}/api/books/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return alert('Błąd usuwania')
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = books

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Katalog książek</h3>
        {user?.role && (user.role === 'librarian' || user.role === 'admin') && (
          <button className="btn btn-success" onClick={() => { setEditing(null); setShowForm(true) }}>Dodaj książkę</button>
        )}
      </div>

      {showForm && (
        <div className="my-3">
          {/* Add / Edit form */}
          <AddEditBook
            initial={editing || null}
            onCancel={() => { setShowForm(false); setEditing(null) }}
            onSave={(payload: { title: string; author: string; category: string; year?: number }) => {
              if (editing) updateBook(editing.id, payload)
              else createBook(payload)
            }}
          />
        </div>
      )}

      <SearchBar query={query} onQueryChange={setQuery} />
      <BookList
        books={filtered}
        onBorrow={borrow}
        onReturn={returnBook}
        onEdit={(b) => { setEditing(b); setShowForm(true) }}
        onDelete={handleDelete}
        canEdit={Boolean(user && (user.role === 'librarian' || user.role === 'admin'))}
        canDelete={Boolean(user && user.role === 'admin')}
      />
    </div>
  )
}

export default BooksPage
