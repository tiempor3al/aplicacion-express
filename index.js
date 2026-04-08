import { Hono } from 'hono'
import { Database } from 'bun:sqlite'

// Abre la base de datos
const db = new Database('./base.sqlite3')
db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`)

const app = new Hono()

app.get('/', (c) => {
    return c.json({ status: 'ok' })
})

app.post('/login', async (c) => {
    return c.json({ status: 'ok' })
})

app.post('/insert', async (c) => {
    let body
    try {
        body = await c.req.json()
    } catch {
        return c.json({ error: 'Falta información necesaria' }, 400)
    }

    const { todo } = body

    if (!todo) {
        return c.json({ error: 'Falta información necesaria' }, 400)
    }

    try {
        const stmt = db.prepare('INSERT INTO todos (todo) VALUES (?)')
        const result = stmt.run(todo)
        return c.json({ id: Number(result.lastInsertRowid), message: 'Insert was successful' }, 201)
    } catch (err) {
        return c.json({ error: err.message }, 500)
    }
})

export { app, db }

export default {
    port: process.env.PORT || 3000,
    fetch: app.fetch,
}
