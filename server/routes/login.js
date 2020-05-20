const express = require('express');
const bcrypt = require('bcryptjs');//para encriptar
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();


// =============
//Hay que tener en cuenta que este app.post /login,,,, lo que quiero es generar temporalmente un token que en si es toda la informacion de un usuario que se encuentra en la base de datos, la cual se encripta ,, y lo que queremos es darle privilegios que que peticiones puede hacer o no hacer, y para eso creamos el archovo de middleware para que compare la informacion del usuario token y valide las acciones que le va a permitir hacer
// =============


app.post('/login', (req, res) => {
  //el body tiene trae el json con la peticion del usuario {email y password}
  let body = req.body;
  //email: body.email aqui estoy comparando que el body.email sea igual al email de la base se datos,, SI eso coinside ese valor lo toma el callback usuarioDB
  Usuario.findOne({email: body.email}, (err, usuarioDB) => {
    
    if (err){
      return res.status(500).json({
        ok: false,
        err// esto imprime el error si entra a este if
      });
    }

    // si usuarioDB no coinside con ningun usuario de base de datos 
    if(!usuarioDB) {
      return res.status(400).json({
        ok:false,
        err: {
          message: 'Usuariooo o contraseña incorrectos'//este mensaje no puede indicar solo que fallo el usuario porque no es bueno que el cliente sepa cual de los dos fallo
        }
      });
    }

    //Esta funcion es para comparar la contraseña que se encripto con el bcrypt en ./usuario.js que es como se capturaron los datos
    // bcrypt.compareSync() esto solo retorna un true o false al momento de comparar
    //body.password es la peticion del usuario
    //usuarioDB.password es la infromacion de la base de datos, que se trae con Usuario.fidOne        
    // el signo ! expresa si no son iguales,, endonces si no son iguales entra a este if
    if (!bcrypt.compareSync(body.password, usuarioDB.password)){
      return res.status(400).json({
        ok:false,
        err: {
          message: 'Usuario o contraseñaaa incorrectos'//este mensaje no puede indicar solo que fallo la contraseña porque no es bueno que el cliente sepa cual de los dos fallo
        }
      });
    }

    //Utilizando jsonwebtoken
    let token = jwt.sign({
      usuario: usuarioDB // Data, informacion usuario
      },process.env.SEED,// secret o SEED,, es una palabra clave
      {expiresIn: process.env.CADUCIDAD_TOKEN}//segundo * min * horas * dias,, expira
    );

    res.json({
      ok: true,
      usuario: usuarioDB,//aqui esta toda la info del usuario
      token// aqui esta toda la info del usuario encriptada
    })

  })

})


module.exports = app;