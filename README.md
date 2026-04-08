## ¿Qué tecnologías usa este proyecto?

### Bun

[Bun](https://bun.sh) es un entorno de ejecución para JavaScript, similar a Node.js, pero diseñado para ser más rápido. Además de correr código JavaScript, Bun incluye su propio manejador de paquetes (reemplaza a `npm` o `yarn`), un corredor de tests integrado y soporte nativo para SQLite, sin necesidad de instalar librerías externas.

En este proyecto, Bun cumple tres roles:
- **Ejecutar** el servidor con `bun start`
- **Instalar dependencias** con `bun install`
- **Correr los tests** con `bun test`

### Hono

[Hono](https://hono.dev) es un framework web minimalista y muy rápido para construir APIs HTTP. Funciona de forma similar a Express, pero está diseñado desde cero para ser ligero y moderno.

Un endpoint básico en Hono se ve así:

```js
import { Hono } from 'hono'

const app = new Hono()

app.get('/saludo', (c) => {
    return c.json({ mensaje: 'Hola mundo' })
})

export default app
```

- `app.get` / `app.post` definen las rutas y el método HTTP.
- `c` es el contexto de la petición: con `c.req` acceden a los datos que llegan, y con `c.json()` envían la respuesta.

---

## Crear un nuevo repositorio desde esta plantilla

1. Hagan clic en el botón **"Use this template"** en la esquina superior derecha del repositorio en GitHub.
2. Seleccionen **"Create a new repository"**.
3. Asegúrense de que la visibilidad sea **pública** y que la rama principal sea `main`.

## Correr la aplicación

Creen un CodeSpace en la rama main y usen la terminal para instalar las dependencias:

```
bun install
```

Si se ha realizado satisfactoriamente la instalación, deberán ver una carpeta `node_modules` y el archivo `bun.lockb`.

Posteriormente, para correr la aplicación:

```
bun start
```

Para correr los tests:

```
bun test
```

La aplicación creará el archivo de base de datos `base.sqlite3`, y CodeSpace preguntará si desean hacer público el puerto 3000. Respondan que sí.

Pueden verificar que el puerto sea público en la pestaña **"Puertos"**.

Copien la dirección pública que especifica CodeSpace en esta pestaña. Den clic en el enlace para aceptar que van a exponer la aplicación a Internet.

El enlace debería poder usarse desde Postman o la aplicación móvil.

## ¿Qué es GitHub Codespaces?

GitHub Codespaces es un entorno de desarrollo en la nube que corre directamente en el navegador. En lugar de instalar herramientas en su computadora, Codespaces les proporciona una máquina virtual con todo lo necesario ya configurado: el editor de código, la terminal y el servidor.

Para abrir un Codespace en este repositorio:

1. Vayan a su repositorio en GitHub.
2. Hagan clic en el botón verde **"Code"**.
3. Seleccionen la pestaña **"Codespaces"**.
4. Hagan clic en **"Create codespace on main"**.

Se abrirá un editor en el navegador. Desde ahí pueden editar archivos y usar la terminal exactamente igual que en una computadora local.

## Exponer el API con un túnel público

Su aplicación Expo corre en su teléfono o emulador, pero el API corre dentro de Codespaces. Para que ambos puedan comunicarse, necesitan hacer público el puerto del servidor creando un **túnel**.

### Cómo habilitar el túnel en Codespaces

1. Corran la aplicación en la terminal:
   ```
   bun start
   ```
2. Codespaces mostrará una notificación que dice **"Your application running on port 3000 is available"**. Hagan clic en **"Open in Browser"** o vayan a la pestaña **"Ports"** en la parte inferior del editor.
3. En la pestaña **"Ports"**, localicen el puerto **3000** y hagan clic derecho sobre él.
4. Seleccionen **"Port Visibility"** → **"Public"**.

> Si no cambian la visibilidad a pública, su app de Expo no podrá conectarse porque el túnel requerirá autenticación.

### Obtener la URL pública

En la misma pestaña **"Ports"**, copien la URL que aparece en la columna **"Forwarded Address"**. Tendrá un formato similar a:

```
https://tu-usuario-3000.app.github.dev
```

### Conectar el API a su app de Expo

Usen esa URL como la dirección base de su API en la app de Expo. Por ejemplo, si están usando `fetch`:

```js
const API_URL = 'https://tu-usuario-3000.app.github.dev'

const response = await fetch(`${API_URL}/todos`)
const data = await response.json()
```

Reemplacen `https://tu-usuario-3000.app.github.dev` con la URL copiada de la pestaña **"Ports"** de su Codespace.

> La URL cambia cada vez que crean un nuevo Codespace, así que deberán actualizarla en su app cuando eso ocurra.

---

## Usar el archivo base.sqlite3 desde CodeSpace

Para interactuar con la base de datos SQLite desde CodeSpace, sigan estos pasos:

1. Abran una nueva terminal en CodeSpace.

2. Inicien una sesión de SQLite con el archivo de base de datos:
   ```
   sqlite3 base.sqlite3
   ```

3. Para ver el esquema de la tabla "todos":
   ```
   .schema todos
   ```

4. Para hacer consultas SELECT en la tabla "todos":
   ```
   SELECT * FROM todos;
   ```
   Esto mostrará todos los registros en la tabla.

5. Pueden hacer consultas más específicas, por ejemplo:
   ```
   SELECT * FROM todos WHERE created_at = <fecha>;
   ```
   Esto mostrará las tareas en una fecha en específico.

6. Para salir de la sesión de SQLite:
   ```
   .quit
   ```

Recuerden que SQLite es sensible a mayúsculas y minúsculas en los nombres de las tablas y columnas. Asegúrense de escribir los comandos exactamente como se muestran.

## Usar SQLite con Hono y Bun

Bun incluye soporte nativo para SQLite a través del módulo `bun:sqlite`, sin necesidad de instalar ningún paquete adicional.

### Abrir la base de datos

```js
import { Database } from 'bun:sqlite'

const db = new Database('./base.sqlite3')
```

Bun crea el archivo automáticamente si no existe. Para usar una base de datos solo en memoria (útil para tests):

```js
const db = new Database(':memory:')
```

### Crear una tabla

```js
db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`)
```

### Insertar un registro

```js
const stmt = db.prepare('INSERT INTO todos (todo) VALUES (?)')
const result = stmt.run('Mi primera tarea')

console.log(result.lastInsertRowid) // ID del registro insertado
```

### Consultar registros

```js
// Todos los registros
const todos = db.query('SELECT * FROM todos').all()

// Un solo registro por ID
const todo = db.query('SELECT * FROM todos WHERE id = ?').get(1)
```

### Usar la base de datos en un endpoint de Hono

```js
import { Hono } from 'hono'
import { Database } from 'bun:sqlite'

const db = new Database('./base.sqlite3')
const app = new Hono()

app.get('/todos', (c) => {
    const todos = db.query('SELECT * FROM todos').all()
    return c.json(todos)
})

app.post('/todos', async (c) => {
    const { todo } = await c.req.json()
    const stmt = db.prepare('INSERT INTO todos (todo) VALUES (?)')
    const result = stmt.run(todo)
    return c.json({ id: Number(result.lastInsertRowid) }, 201)
})
```

### Cerrar la base de datos

```js
db.close()
```

---

## Subir sus cambios mediante un Pull Request

Un Pull Request (PR) es la forma correcta de proponer cambios en un repositorio. Sigan estos pasos desde la terminal de CodeSpace:

### 1. Creen una rama nueva para sus cambios

Nunca trabajen directamente en `main`. Creen una rama con su nombre o una descripción corta del cambio:

```
git checkout -b mi-nombre/mi-cambio
```

Por ejemplo:
```
git checkout -b ana/agregar-endpoint
```

### 2. Realicen sus cambios

Editen los archivos que necesiten modificar.

### 3. Verifiquen qué archivos cambiaron

```
git status
```

### 4. Agreguen los archivos al área de preparación

```
git add .
```

### 5. Creen un commit con un mensaje descriptivo

```
git commit -m "Descripción breve de lo que hicieron"
```

### 6. Suban la rama a GitHub

```
git push origin mi-nombre/mi-cambio
```

> Reemplacen `mi-nombre/mi-cambio` por el nombre de la rama que crearon en el paso 1.

### 7. Abran el Pull Request en GitHub

1. Vayan a su repositorio en GitHub.
2. Aparecerá un banner amarillo que dice **"Compare & pull request"** — hagan clic ahí.
3. Asegúrense de que la rama destino sea `main`.
4. Escriban un título y descripción clara de sus cambios.
5. Hagan clic en **"Create pull request"**.

Sus cambios quedarán en revisión. Los tests de CI correrán automáticamente para verificar que todo funcione correctamente.
