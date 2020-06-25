const express = require('express')
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(require('./routes/user'));



  mongoose.connect('mongodb://localhost:27017/cafe', (err, res) => {
    if (err) throw err;
    console.log('Base de datos Online');
  });


app.listen(3000, () => {
    console.log('Escuchando puerto', 3000)
})