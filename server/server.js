//al ser este el primer archivo require('./config/config'); es lo primero que se va a ejecuar, y con esto logramos que si no encuentra el puerto en la nube lo ejecute localmente en el puerto 3000.
require('./config/config');

const express = require('express')
const app = express()

const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.get('/usuario', function (req, res) {
  res.json('get Usuario')
});
//el post se utiliza como servicio de peticion al servidor para crear nuevos registros
app.post('/usuario', function (req, res) {
  let body = req.body;
  if (body.nombre === undefined){
    res.status(400).json({
      ok: false,
      mensaje: 'El nombre es necesario'
    });
  }else{
  res.json({
    persona: body
    });
  }
});
//el put se utiliza como servicio de peticion al servidor para actualizar datos
app.put('/usuario/:idd', function (req, res) {

  let id = req.params.idd;
  res.json({
    //id: id // la id despues de los : refiere a let id, 
    id// se puede resumir con solo id por que las mensione igual id: id
  });
});
//el delete se utiliza como servicio de peticion al servidor para eliminar datos
app.delete('/usuario', function (req, res) {
  res.json('delete Usuario')
});

app.listen(process.env.PORT, () => {
  console.log('Escuchando puerto: ', process.env.PORT);
})


//Clase udemy
//https://www.udemy.com/course/node-de-cero-a-experto/learn/lecture/9604112#questions 