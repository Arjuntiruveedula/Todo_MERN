require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = "https://todo-mern-q2er.vercel.app";

app.use(cors({
  origin: "https://todo-mern-chi-sable.vercel.app", // Allow requests from the frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Optional: Allow cookies if needed
}));
 // Allow cross-origin requests
app.use(bodyParser.json()); // Parse incoming JSON data



const db = mysql.createConnection({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'BmdDJrLrpFCckfrJUOgTishJsljrltrR',
  database: 'todos',
});

// Test MySQL Connection
db.connect(err => {
  if (err) {
    console.log('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Create todos table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_on DATETIME
  )
`;

db.query(createTableQuery, err => {
  if (err) {
    console.log('Error creating table:', err);
  } else {
    console.log('Todos table is ready');
  }
});

// API Routes
// Get all todos
app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/todos', (req, res) => {
  db.query('SELECT * FROM todos', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add a new todo
app.post('/todos', (req, res) => {
  const { title, description } = req.body;
  db.query(
    'INSERT INTO todos (title, description) VALUES (?, ?)',
    [title, description],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to add todo' });
      }
      res.status(201).json({ id: results.insertId, title, description });
    }
  );
});

// Update a todo
app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  db.query(
    'UPDATE todos SET title = ?, description = ? WHERE id = ?',
    [title, description, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update todo' });
      }
      res.json({ id, title, description });
    }
  );
});

// Mark a todo as completed
app.put('/todos/complete/:id', (req, res) => {
  const { id } = req.params;
  const completedOn = new Date();
  db.query(
    'UPDATE todos SET completed = true, completed_on = ? WHERE id = ?',
    [completedOn, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to complete todo' });
      }
      res.json({ id, completedOn });
    }
  );
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete todo' });
    }
    res.status(204).send();
  });
});

// Delete a completed todo
app.delete('/completed/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete completed todo' });
    }
    res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`Server running on port `);
});
