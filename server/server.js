//al ser este el primer archivo require('./config/config'); es lo primero que se va a ejecuar, y con esto logramos que si no encuentra el puerto en la nube lo ejecute localmente en el puerto 3000.
require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const bodyParser = require('body-parser')//nos ayuda a traer los resultados como objetos

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json,, convertimos en formato json
app.use(bodyParser.json())

// Habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

//configuracion global de rutas
app.use(require('./routes/index'));

//mongoose.connect es para conecar a la base de datos que aqui se especifica
mongoose.connect(process.env.URLDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then( resp => {
  console.log( `Connecion to MongoDB is OK!` );
}).catch( err => {
  console.log( `Error connecion: `, err );
});

app.listen(process.env.PORT, () => {
  console.log('Escuchando puerto: ', process.env.PORT);
})


//Clase udemy
//https://www.udemy.com/course/node-de-cero-a-experto/learn/lecture/9604112#questions 