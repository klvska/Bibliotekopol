import React from 'react'
import type { Book } from '../types'
import BookItem from './BookItem'

interface Props {
  books: Book[]
  onBorrow: (bookId: string) => void
  onReturn: (bookId: string) => void
  onEdit?: (book: Book) => void
  onDelete?: (bookId: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export const BookList: React.FC<Props> = ({ books, onBorrow, onReturn, onEdit, onDelete, canEdit = false, canDelete = false }) => {
  if (!books.length) return <div>Brak książek.</div>

  return (
    <div>
      {books.map((b) => (
        <BookItem
          key={b.id}
          book={b}
          onBorrow={onBorrow}
          onReturn={onReturn}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ))}
    </div>
  )
}

export default BookList
