import { describe, it, expect, afterAll } from 'bun:test'
import { app, db } from './index'

describe('API Endpoints', () => {

    // Cerramos la conexión a la BD al terminar todos los tests
    afterAll(() => {
        db.close()
    })

    // 1. Test para GET /
    describe('GET /', () => {
        it('Debería retornar status 200 y el objeto { status: "ok" }', async () => {
            const res = await app.request('/')

            expect(res.status).toBe(200)
            expect(await res.json()).toEqual({ status: 'ok' })
        })
    })

    // 2. Test para POST /login
    describe('POST /login', () => {
        it('Debería retornar status 200 al hacer login', async () => {
            const res = await app.request('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'test', password: '123' }),
            })

            expect(res.status).toBe(200)
            expect(await res.json()).toEqual({ status: 'ok' })
        })
    })

    // 3. Tests para POST /insert
    describe('POST /insert', () => {

        it('Debería crear una tarea correctamente (Status 201)', async () => {
            const res = await app.request('/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todo: 'Aprender Bun' }),
            })

            expect(res.status).toBe(201)
            expect(await res.json()).toHaveProperty('message', 'Insert was successful')
        })

        it('Debería fallar si no se envía el campo "todo" (Status 400)', async () => {
            const res = await app.request('/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            expect(res.status).toBe(400)
        })
    })
})
