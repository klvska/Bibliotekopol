import React from 'react'
import type { Book } from '../types'

interface Props {
  book: Book
  onBorrow: (bookId: string) => void
  onReturn: (bookId: string) => void
  onEdit?: (book: Book) => void
  onDelete?: (bookId: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export const BookItem: React.FC<Props> = ({ book, onBorrow, onReturn, onEdit, onDelete, canEdit, canDelete }) => {
  return (
    <div className="card mb-2">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title">{book.title}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{book.author} — {book.year}</h6>
          <div className="text-muted small">{book.category}</div>
        </div>
        <div className="text-end">
          <div className="mb-2">Status: <strong>{book.status}</strong></div>
          <div className="d-flex flex-column gap-2">
            {book.status === 'available' ? (
              <button className="btn btn-primary" onClick={() => onBorrow(book.id)}>Wypożycz</button>
            ) : (
              <button className="btn btn-secondary" onClick={() => onReturn(book.id)}>Zwróć</button>
            )}
            <div className="d-flex gap-2 mt-2 justify-content-end">
              {canEdit && onEdit && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onEdit(book)}>Edytuj</button>
              )}
              {canDelete && onDelete && (
                <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(book.id)}>Usuń</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookItem
