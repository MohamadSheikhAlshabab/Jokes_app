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
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/', homeHandler);
function homeHandler(req, res) {
    let url = 'https://official-joke-api.appspot.com/jokes/programming/ten';
    let name='Home';
    superagent.get(url,name)
    .then((result) => {
        let arrUrl = result.body.map(val => {
            return new Jokes(val);
        });
            res.render('pages/index', { data: arrUrl ,name});
        });
}

function Jokes(val) {
    this.type = val.type || 'no type';
    this.setup = val.setup || 'no setup';
    this.punchline = val.punchline || 'no punchline';
}

app.get('/addToDb',addToDbHandler);
function addToDbHandler(req,res){
    let {type,setup,punchline}=req.query;
    let sql='INSERT INTO joke_tb (type,setup,punchline)VALUES($1,$2,$3);';
    let safeVal=[type,setup,punchline];
    client.query(sql,safeVal)
    .then(()=>{
        res.redirect('/favorite');
    });
}

app.get('/favorite',favoriteHandler);
function favoriteHandler(req,res){
    let sql='SELECT * FROM joke_tb;';
    let name='Favorite';
    client.query(sql)
    .then((result)=>{
        res.render('pages/favorite',{data : result.rows,name});
    })
}
app.get('/details/:det_id',detailsHandler);
function detailsHandler(req,res){
let param=req.params.det_id;
let sql='SELECT * FROM joke_tb WHERE id=$1;';
let safeVal=[param];
let name='Details';
client.query(sql,safeVal)
.then((result)=>{
res.render('pages/details',{vals:result.rows[0],name});
})
}
app.put('/update/:up_id',updateHandler);
function updateHandler(req,res){
    let {type,setup,punchline}=req.body;
    let param=req.params.up_id;
    let sql='UPDATE joke_tb SET type=$1,setup=$2,punchline=$3 WHERE id=$4;';
    let safeVals=[type,setup,punchline,param];
    client.query(sql,safeVals)
    .then(()=>{
        res.redirect('/favorite');
    });
}
app.delete('/delete/:del_id',deleteHandler);
function deleteHandler(req,res){
    let param=req.params.del_id;
    let sql ='DELETE FROM joke_tb WHERE id=$1 ;';
let safeVal=[param];
client.query(sql,safeVal)
.then(()=>{
    res.redirect('/favorite');
})
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