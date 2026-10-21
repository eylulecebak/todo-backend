const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000
const DATA_FILE = path.join(__dirname, 'todos.json')

app.use(cors())
app.use(express.json())

// Read all todos from the JSON file (empty list if the file does not exist yet)
function readTodos() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {
    return []
  }
}

// Save all todos to the JSON file
function saveTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2))
}

app.get('/', (req, res) => {
  res.send('Hello World from Node.js 👋')
})

// List all todos
app.get('/todos', (req, res) => {
  res.json(readTodos())
})

// Add a new todo
app.post('/todos', (req, res) => {
  const text = (req.body.text || '').trim()
  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }
  const todos = readTodos()
  const todo = { id: Date.now().toString(), text, done: false }
  todos.push(todo)
  saveTodos(todos)
  res.status(201).json(todo)
})

// Mark a todo as done / not done
app.patch('/todos/:id', (req, res) => {
  const todos = readTodos()
  const todo = todos.find((t) => t.id === req.params.id)
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' })
  }
  todo.done = !todo.done
  saveTodos(todos)
  res.json(todo)
})

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const todos = readTodos()
  const remaining = todos.filter((t) => t.id !== req.params.id)
  if (remaining.length === todos.length) {
    return res.status(404).json({ error: 'Todo not found' })
  }
  saveTodos(remaining)
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})