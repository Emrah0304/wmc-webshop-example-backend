const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();

const port = 5500;

app.use(cors());

app.use(bodyParser.json());

const db = new sqlite3.Database('./webshop.db', (err) => {
    if(err){
        console.error('Database opening error: ', err);
    }
    else{
        console.log('Connected to the SQLite database.');
    }
});

app.get('/hello-world-json', (req, res) => {
    res.json({ message: 'Hello World!' });
    });

app.get('/api/products', (req, res) => {
    const { priceFrom, priceTo, name } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];

    const conditions = [];
    if (priceFrom) {
        conditions.push('price >= ?');
        params.push(priceFrom);
    }
    if (priceTo) {
        conditions.push('price <= ?');
        params.push(priceTo);
    }
    if (name) {
        conditions.push('name ALIKE ?');
        params.push(`%${name}%`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(sql, params, (err, rows) => {
        if(err){
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/products', (req, res) => {
    const { name, price, description } = req.body;
    const sql = 'INSERT INTO products (name, price, description) VALUES (?, ?, ?)';
    const params = [name, price, description];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Product added successfully',
            data: { id: this.lastID, name, price, description }
        });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const sql = 'DELETE FROM products WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    });