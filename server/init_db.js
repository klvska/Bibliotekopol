const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const { v4: uuid } = require('uuid')

const db = new sqlite3.Database('./bibliotekopol.db')

async function run() {
  db.serialize(async () => {
    db.run(`DROP TABLE IF EXISTS users`)
    db.run(`DROP TABLE IF EXISTS books`)
    db.run(`DROP TABLE IF EXISTS borrowings`)

    db.run(`CREATE TABLE users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, name TEXT, role TEXT)`)
    db.run(`CREATE TABLE books (id TEXT PRIMARY KEY, title TEXT, author TEXT, category TEXT, year INTEGER, status TEXT, borrowerId TEXT)`)
    db.run(`CREATE TABLE borrowings (id TEXT PRIMARY KEY, bookId TEXT, userId TEXT, borrowedAt INTEGER, returnedAt INTEGER)`)

    const saltRounds = 10
    const adminPass = await bcrypt.hash('admin123', saltRounds)
    const libPass = await bcrypt.hash('lib123', saltRounds)
    const studentPass = await bcrypt.hash('student123', saltRounds)

    const users = [
      { id: 'u-admin', username: 'admin', password: adminPass, name: 'Admin', role: 'admin' },
      { id: 'u-lib', username: 'librarian', password: libPass, name: 'Bibliotekarz', role: 'librarian' },
      { id: 'u-stu', username: 'student', password: studentPass, name: 'Uczeń', role: 'student' },
    ]

    const insertUser = db.prepare('INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)')
    users.forEach((u) => insertUser.run(u.id, u.username, u.password, u.name, u.role))
    insertUser.finalize()

    const books = [
      { id: 'b1', title: 'Pan Tadeusz', author: 'Adam Mickiewicz', category: 'Literatura polska', year: 1834, status: 'available' },
      { id: 'b2', title: 'Harry Potter i Kamień Filozoficzny', author: 'J.K. Rowling', category: 'Fantasy', year: 1997, status: 'available' },
      { id: 'b3', title: 'W pustyni i w puszczy', author: 'Henryk Sienkiewicz', category: 'Przygoda', year: 1911, status: 'borrowed', borrowerId: 'u-stu' },
    ]

    const insertBook = db.prepare('INSERT INTO books (id, title, author, category, year, status, borrowerId) VALUES (?, ?, ?, ?, ?, ?, ?)')
    books.forEach((b) => insertBook.run(b.id, b.title, b.author, b.category, b.year, b.status, b.borrowerId || null))
    insertBook.finalize()

    const borrowings = [
      { id: uuid(), bookId: 'b3', userId: 'u-stu', borrowedAt: Date.now(), returnedAt: null },
    ]
    const insertBorrow = db.prepare('INSERT INTO borrowings (id, bookId, userId, borrowedAt, returnedAt) VALUES (?, ?, ?, ?, ?)')
    borrowings.forEach((r) => insertBorrow.run(r.id, r.bookId, r.userId, r.borrowedAt, r.returnedAt))
    insertBorrow.finalize()

    console.log('Database initialized with seed data.')
    db.close()
  })
}

run().catch((err) => console.error(err))
