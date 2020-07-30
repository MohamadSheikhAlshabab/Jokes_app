'use strict';

require('dotenv').config();

const express = require('express');
const methodOverride = require('method-override');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');


const app = express();
const PORT = process.env.PORT || 2000;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/', homeHandler);
function homeHandler(req, res) {
    let url = 'https://official-joke-api.appspot.com/jokes/programming/ten';
    superagent.get(url)
        .then((result) => {
            let arrUrl = result.body.map(val => {
                return new Jokes(val);
            });
            res.render('pages/index', { data: arrUrl });
        });
}

function Jokes(val) {
    this.type = val.type || 'no type';
    this.setup = val.setup || 'no setup';
    this.punchline = val.punchline || 'no punchline';
}

client.connect()
    .then(() => app.listen(PORT, console.log(`up & run on port ${PORT}`)));

function notFoundHandler(req, res) {
    res.status(404).send('Page Not Found ERROR 404');
}
function errorHandler(err, req, res) {
    res.status(500).send(err);
}
app.use('*', notFoundHandler);