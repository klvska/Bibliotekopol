require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')

const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

const db = new sqlite3.Database('./bibliotekopol.db')

const app = express()
app.use(cors())
app.use(express.json())

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err)
      resolve(this)
    })
  })
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))))
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))))
}

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Wszystkie pola są wymagane' })
  try {
    const user = await getAsync('SELECT * FROM users WHERE username = ?', [username])
    if (!user) return res.status(401).json({ error: 'Niepoprawny login lub hsało' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Niepoprawny login lub hsało' })
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' })
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.post('/api/auth/register', async (req, res) => {
    const { username, password, name, role } = req.body
    if (!username || !password || !name || !role) return res.status(400).json({ error: 'username/password/name/role required' + username })
    try {
        const existing = await getAsync('SELECT * FROM users WHERE username = ?', [username])
        if (existing) return res.status(400).json({ error: 'username taken' })
        const hashed = await bcrypt.hash(password, 10)
        const id = uuid()
        await runAsync('INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)', [id, username, hashed, name, role])
        const user = await getAsync('SELECT * FROM users WHERE id = ?', [id])
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' })
        res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'server error' })
    }
})

function authMiddleware(req, res, next) {
  const header = req.headers['authorization']
  if (!header) return res.status(401).json({ error: 'missing authorization' })
  const parts = header.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid auth header' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user
    if (!user || !roles.includes(user.role)) return res.status(403).json({ error: 'forbidden' })
    next()
  }
}

// Books
app.get('/api/books', async (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase()
  try {
    if (!q) {
      const all = await allAsync('SELECT * FROM books ORDER BY title')
      return res.json(all)
    }
    const like = `%${q}%`
    const rows = await allAsync(
      'SELECT * FROM books WHERE lower(title) LIKE ? OR lower(author) LIKE ? OR lower(category) LIKE ? ORDER BY title',
      [like, like, like],
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.post('/api/books', authMiddleware, requireRole('librarian', 'admin'), async (req, res) => {
  const { title, author, category, year } = req.body
  if (!title || !author) return res.status(400).json({ error: 'title and author required' })
  const id = uuid()
  try {
    await runAsync('INSERT INTO books (id, title, author, category, year, status) VALUES (?, ?, ?, ?, ?, ?)', [id, title, author, category || '', year || null, 'available'])
    const created = await getAsync('SELECT * FROM books WHERE id = ?', [id])
    res.status(201).json(created)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.put('/api/books/:id', authMiddleware, requireRole('librarian', 'admin'), async (req, res) => {
  const id = req.params.id
  const { title, author, category, year, status } = req.body
  try {
    await runAsync('UPDATE books SET title = ?, author = ?, category = ?, year = ?, status = ? WHERE id = ?', [title, author, category, year, status, id])
    const updated = await getAsync('SELECT * FROM books WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.delete('/api/books/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const id = req.params.id
  try {
    await runAsync('DELETE FROM books WHERE id = ?', [id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.post('/api/books/:id/borrow', authMiddleware, async (req, res) => {
  const id = req.params.id
  const user = req.user
  try {
    const book = await getAsync('SELECT * FROM books WHERE id = ?', [id])
    if (!book) return res.status(404).json({ error: 'not found' })
    if (book.status === 'borrowed') return res.status(400).json({ error: 'already borrowed' })
    await runAsync('UPDATE books SET status = ?, borrowerId = ? WHERE id = ?', ['borrowed', user.id, id])
    const borrowId = uuid()
    await runAsync('INSERT INTO borrowings (id, bookId, userId, borrowedAt, returnedAt) VALUES (?, ?, ?, ?, ?)', [borrowId, id, user.id, Date.now(), null])
    const updated = await getAsync('SELECT * FROM books WHERE id = ?', [id])
    res.json({ success: true, book: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.post('/api/books/:id/return', authMiddleware, async (req, res) => {
  const id = req.params.id
  const user = req.user
  try {
    const book = await getAsync('SELECT * FROM books WHERE id = ?', [id])
    if (!book) return res.status(404).json({ error: 'not found' })
    if (book.status === 'available') return res.status(400).json({ error: 'book not borrowed' })
    // allow librarian/admin to return any, student only their own
    if (user.role === 'student' && book.borrowerId !== user.id) return res.status(403).json({ error: 'forbidden' })
    await runAsync('UPDATE books SET status = ?, borrowerId = ? WHERE id = ?', ['available', null, id])
    await runAsync('UPDATE borrowings SET returnedAt = ? WHERE bookId = ? AND returnedAt IS NULL', [Date.now(), id])
    const updated = await getAsync('SELECT * FROM books WHERE id = ?', [id])
    res.json({ success: true, book: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.get('/api/borrowings', authMiddleware, async (req, res) => {
  const user = req.user
  try {
    if (user.role === 'librarian' || user.role === 'admin') {
      const all = await allAsync('SELECT * FROM borrowings ORDER BY borrowedAt DESC')
      return res.json(all)
    }
    const mine = await allAsync('SELECT * FROM borrowings WHERE userId = ? ORDER BY borrowedAt DESC', [user.id])
    res.json(mine)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.get('/api/users', authMiddleware, requireRole('librarian', 'admin'), async (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase()
  const user = req.user
  try {
    if (!q) {
      let users
      if (user.role === 'librarian') {
        users = await allAsync('SELECT id, username, name, role FROM users WHERE role != ? ORDER BY name', ['admin'])
      } else {
        users = await allAsync('SELECT id, username, name, role FROM users ORDER BY name')
      }
      return res.json(users)
    } else {
      const like = `%${q}%`
      let users
      if (user.role === 'librarian') {
        users = await allAsync(
          'SELECT id, username, name, role FROM users WHERE (lower(username) LIKE ? OR lower(name) LIKE ?) AND role != ? ORDER BY name',
          [like, like, 'admin'],
        )
      } else {
        users = await allAsync(
          'SELECT id, username, name, role FROM users WHERE lower(username) LIKE ? OR lower(name) LIKE ? ORDER BY name',
          [like, like],
        )
      }
      res.json(users)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.get('/api/users/:id', authMiddleware, requireRole('librarian', 'admin'), async (req, res) => {
  const id = req.params.id
  try {
    const user = await getAsync('SELECT id, username, name, role FROM users WHERE id = ?', [id])
    if (!user) return res.status(404).json({ error: 'not found' })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.put('/api/users/:id', authMiddleware, requireRole('librarian', 'admin'), async (req, res) => {
  const id = req.params.id
  const { username, name, role, password } = req.body
  try {
    const existing = await getAsync('SELECT * FROM users WHERE id = ?', [id])
    if (!existing) return res.status(404).json({ error: 'not found' })

    if (username && username !== existing.username) {
      const conflict = await getAsync('SELECT * FROM users WHERE username = ? AND id != ?', [username, id])
      if (conflict) return res.status(400).json({ error: 'username taken' })
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10)
      await runAsync('UPDATE users SET username = ?, name = ?, role = ?, password = ? WHERE id = ?', [username || existing.username, name || existing.name, role || existing.role, hashed, id])
    } else {
      await runAsync('UPDATE users SET username = ?, name = ?, role = ? WHERE id = ?', [username || existing.username, name || existing.name, role || existing.role, id])
    }

    const updated = await getAsync('SELECT id, username, name, role FROM users WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.delete('/api/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const id = req.params.id
  try {
    await runAsync('DELETE FROM users WHERE id = ?', [id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Bibliotekopol mock API listening on http://localhost:${PORT}`)
})
