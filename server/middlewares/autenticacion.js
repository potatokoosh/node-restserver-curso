const jwt = require ('jsonwebtoken');

// ===========================
//   Verificacion Token
//============================
//verificaToken va a recibir 3 argumentos
// el primero es el requerimiento o peticion req
//el segundo es la respuesta res, que es lo que quiero obtener
//el tercero es el next, que siga con la ejecucion del programa
let verificaToken = (req, res, next) => {
  //res.get  trea del header de postman el {{token }}
  // el token lo crea el archivo login.js
  let token = req.get('token');

  //jwt.verify recibe 3 parametros (1,2,3),,el 1 es el token que estamos introduciondo, el 2 es la SEED que creamos y esta en terminal, y el 3 es un callback que tiene el err y la informacion decodificada
  //SEED es una variable de entorno creada en terminal 
  jwt.verify(token, process.env.SEED, (err, decoded) => {

    if (err){
      return res.status(401).json({
        ok: false,
        err:{
          message: 'Token no válido'
        }
      });
    }

    //req.usuario es una nueva variable que le estamos dando el valor de decoded.usuario decodificada del token
    req.usuario = decoded.usuario

    next();//es para que siga ejecutando el resto de la funcion, que utiliza este middleware

  });

};

// ===========================
//   Verificacion AdminRole
//============================
let verificaAdmin_Role = (req, res, next) => {
    //este req.usuario el token decodificado que se hizo en verificaToken
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE'){
      next();//es para que siga ejecutando el resto de la funcion, que utiliza este middleware
    }else{

      res.json({
        ok: false,
        err:{
          message: 'El usuario no es administrador'
        }
      })

    }


};

// ===========================
//   Verifica token para imagen
//============================
let verificaTokenImg = (req, res, next) => {

  let token = req.query.token;//el token viene por url

  //jwt.verify recibe 3 parametros (1,2,3),,el 1 es el token que estamos introduciondo, el 2 es la SEED que creamos y esta en terminal, y el 3 es un callback que tiene el err y la informacion decodificada
  //SEED es una variable de entorno creada en terminal 
  jwt.verify(token, process.env.SEED, (err, decoded) => {

    if (err){
      return res.status(401).json({
        ok: false,
        err:{
          message: 'Token no válido'
        }
      });
    }

    //req.usuario es una nueva variable que le estamos dando el valor de decoded.usuario decodificada del token
    req.usuario = decoded.usuario

    next();//es para que siga ejecutando el resto de la funcion, que utiliza este middleware

  });
  
}


module.exports = {
  verificaToken,
  verificaAdmin_Role,
  verificaTokenImg
}