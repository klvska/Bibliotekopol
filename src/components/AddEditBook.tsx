import React, { useEffect, useState } from 'react'
import type { Book } from '../types'

interface Props {
  initial?: Partial<Book> | null
  onCancel: () => void
  onSave: (payload: { title: string; author: string; category: string; year?: number }) => void
}

const AddEditBook: React.FC<Props> = ({ initial = null, onCancel, onSave }) => {
  const [title, setTitle] = useState(initial?.title || '')
  const [author, setAuthor] = useState(initial?.author || '')
  const [category, setCategory] = useState(initial?.category || '')
  const [year, setYear] = useState(initial?.year ? String(initial.year) : '')

  useEffect(() => {
    setTitle(initial?.title || '')
    setAuthor(initial?.author || '')
    setCategory(initial?.category || '')
    setYear(initial?.year ? String(initial.year) : '')
  }, [initial])

  const handleSave = () => {
    if (!title.trim() || !author.trim()) return alert('Tytuł i autor są wymagane')
    onSave({ title: title.trim(), author: author.trim(), category: category.trim(), year: year ? Number(year) : undefined })
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="mb-2">
          <label className="form-label">Tytuł</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="form-label">Autor</label>
          <input className="form-control" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="form-label">Kategoria</label>
          <input className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Rok wydania</label>
          <input className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSave}>Zapisz</button>
          <button className="btn btn-secondary" onClick={onCancel}>Anuluj</button>
        </div>
      </div>
    </div>
  )
}

export default AddEditBook
