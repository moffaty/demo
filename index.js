const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db.js');

const dbFile = 'db.json';
const secret = 'someshit';
const database = new db.classDB(dbFile);
console.log(database.getConnectInfo());

const PORT = 3100;

const viewsDir = 'views';
const cssDir = 'css';

app.use(session({
    username: '',
    position: '',
    logged: false,
    secret: secret,
    resave: false,
    saveUninitialized: true
}))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public', viewsDir)));
app.use(express.static(path.join(__dirname, 'public', cssDir)));

app.get('/1', (req, res) => {
    if (req.session.logged) {
        res.sendFile(path.join(__dirname, 'public', viewsDir, 'index.html'));
    }
    else {
        res.sendFile(path.join(__dirname, 'public', viewsDir, 'login.html'));
    }
})

app.get('/logout', (req, res) => {
    req.session.username = '';
    req.session.logged = false;
    res.json({ status:'success', response: 'Logouted!' });
})

app.post('/register', async (req, res) => {
    try {
        const data = req.body.dataForm;
        data['role_id'] = 2;
        console.log(data);
        const registerResponse = await database.register(data);
        console.log(registerResponse);
    }
    catch (error) {
        console.log(error); 
    }
})

app.post('/login', async (req, res) => {
    console.log('login');
    try {
        const userData = req.body;
        console.log(userData);
        const loginStatus = await database.login(userData);
        req.session.username = userData.login;
        req.session.logged = true;
        res.json(loginStatus);
    }
    catch (error) {
        res.json({ status: 'error', response: 'Неверный логин или пароль' });
    }
})

let server;

async function startServer() {
    server = app.listen(PORT, () => {
        console.log(`Started http://localhost:${PORT}`)
    })
}

startServer();