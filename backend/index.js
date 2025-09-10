import http from 'http'
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
});

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    if (req.url === '/') {
        try {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('Hola, bienvenido');
            res.end();
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error interno del servidor');
        }
    } else if (req.url === '/tasks' && req.method === 'GET') {
        try {
            const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
        } catch (error) {
            console.error('Error al obtener las tareas:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error interno del servidor');
        }
    } else if (req.url === '/tasks' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { description } = JSON.parse(body);
                const query = 'INSERT INTO tasks (description) VALUES ($1) RETURNING *';
                const result = await pool.query(query, [description]);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows[0]));
            } catch (error) {
                console.error('Error al insertar la tarea:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error interno del servidor');
            }
        })
    } else if (req.url.startsWith('/tasks/') && req.method === 'DELETE') {
        try {
            const taskId = req.url.split('/')[2];
            const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
            if (result.rowCount === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Tarea no encontrada' }));
                return;
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Tarea eliminada' }));
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error interno del servidor');
        }
    } else if (req.url.startsWith('/tasks/') && req.method === 'PATCH') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const taskId = req.url.split('/')[2];
                const { completed } = JSON.parse(body);
                const query = 'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *';
                const result = await pool.query(query, [completed, taskId]);
                if (result.rowCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Tarea no encontrada' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows[0]));
            } catch (error) {
                console.error('Error al actualizar la tarea:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error interno del servidor');
            }
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});