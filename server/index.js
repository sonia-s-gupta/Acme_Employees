// imports here for express and pg
const express = require('express'); // Loads express framework
const app = express(); // Initializes the app
const path = require('path'); // Loads path module
const pg = require('pg'); // Loads pg module
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://soniagupta:muttonchop@localhost/acme_hr_db');

// static routes here (you only need these for deployment)
app.use(express.static(path.join(__dirname, '../client/dist'))); // Serves static files from the client directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html')); // Serves the index.html file
});

// app routes here
app.get('/api/employees', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM employees;');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// create your init function
const init = async () => {
    try {
        // connect to the database
        await client.connect();
        console.log('Connected to the database');

        // create the employees table
        await client.query(`
            DROP TABLE IF EXISTS employees;
            CREATE TABLE employees (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                is_admin BOOLEAN DEFAULT false
            );
        `);

        // Seeding the employees table with some data
        await client.query(`
            INSERT INTO employees (name, is_admin)
            VALUES
            ('Shaggy Rogers', true),
            ('Daphne Blake', false),
            ('Fred Jones', false),
            ('Velma Dinkley', false);
        `);
        console.log('Employees table created and seeded');

        // listen on port 3000
        if (require.main === module) {
            app.listen(3000, () => {
            console.log('Server is running on port 3000');
            });
        }
    } catch (error) {
        console.error('Error initializing the database', error);
    }
};

// init function invocation
init();