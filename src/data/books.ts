import type { Book } from '../types'

export const initialBooks: Book[] = [
  {
    id: '1',
    title: 'Pan Tadeusz',
    author: 'Adam Mickiewicz',
    category: 'Literatura polska',
    year: 1834,
    status: 'available',
  },
  {
    id: '2',
    title: 'Harry Potter i Kamień Filozoficzny',
    author: 'J.K. Rowling',
    category: 'Fantasy',
    year: 1997,
    status: 'available',
  },
  {
    id: '3',
    title: 'W pustyni i w puszczy',
    author: 'Henryk Sienkiewicz',
    category: 'Przygoda',
    year: 1911,
    status: 'borrowed',
    borrowerId: 'u1',
  },
]
