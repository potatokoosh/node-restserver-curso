const express = require('express');
const bcrypt = require('bcryptjs');//para encriptar
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');//para la autenticacion de google
const client = new OAuth2Client(process.env.CLIENT_ID);//para la autenticacion de google

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

// Configuraciones de Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  console.log(payload.name);

  return{//estos nombre de variables nombre, email, img,google,, los utilizamos para relacionarlos con el archivo de model/usuarios.js
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true 
  }
  
}


app.post('/google', async (req, res) => {

  //idtoken viene del req, que asi llama google la variable y asi la mensionamos en el public/index.html
  let token = req.body.idtoken;

  let googleUser = await verify(token)
      .catch(e => {
        return res.status(403).json({
          ok: false,
          err: e
        });
      });

  //validando si el usuario de google ya esta registrado en la base de datos
  //email es el de base de datos y googleUser.email es el email de google 
  Usuario.findOne({email: googleUser.email}, (err, usuarioDB) =>{

    if (err){
      return res.status(500).json({
        ok: false,
        err// esto imprime el error si entra a este if
      });
    };

    //usuarioDB es un usuario de base de datos y el model de usuario tiene la variable google, entonces si esta variable es false,, es por que ya se habia registrado por el metodo normal y no por google,, asi que no lo debe dejar registrar por google,,
    if (usuarioDB){
      if(usuarioDB.google === false){
        return res.status(400).json({
          ok:false,
          err: {
            message: 'Debe de usar su autenticacion normal'
          }
        })
      }else{// si si se habia registrado con google quiero hacer esta accion//renovar el token
        //Utilizando jsonwebtoken
        let token = jwt.sign({
          usuario: usuarioDB // Data, informacion usuario
          },process.env.SEED,// secret o SEED,, es una palabra clave
          {expiresIn: process.env.CADUCIDAD_TOKEN}//segundo * min * horas * dias,, expira
        );

          return res.json({
            ok: true,
            usuario: usuarioDB,
            token
          });

      }
    }else{// Si el usuario no existe en nuestra base de datos,, mensiono estas variables
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;//se esta creando el usuario con google
      usuario.password = ':)';//como es obligatorio en nuestro models/usuario.js pasar el password mandamos cualquier caracter para que no presente error,, pero este password como es un inicio de sesion con google la validacion de el password se hace en el appi de google,,

      //guardo en base de datos a el usuario 
      usuario.save((err, usuarioDB) => {
        if (err){
          return res.status(500).json({
            ok: false,
            err// esto imprime el error si entra a este if
          });
        };

        //Utilizando jsonwebtoken
        let token = jwt.sign({
          usuario: usuarioDB // Data, informacion usuario
          },process.env.SEED,// secret o SEED,, es una palabra clave
          {expiresIn: process.env.CADUCIDAD_TOKEN}//segundo * min * horas * dias,, expira
        );

          return res.json({
            ok: true,
            usuario: usuarioDB,
            token
          });

      })
    }

  })


});


module.exports = app;