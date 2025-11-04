export type Role = 'student' | 'librarian' | 'admin'

export interface User {
  id: string
  name: string
  role: Role
}

export type BookStatus = 'available' | 'borrowed'

export interface Book {
  id: string
  title: string
  author: string
  category: string
  year: number
  status: BookStatus
  borrowerId?: string | null
}
