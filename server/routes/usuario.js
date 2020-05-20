const express = require('express');
const bcrypt = require('bcryptjs');//para encriptar
const _ = require('underscore');//permite filtrar objetos
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require ('../middlewares/autenticacion');
const app = express();

//el verificaToken es un middleware,, tenemos toda la informacion del usuario en jwt,, de esta manera no esta legible 
app.get('/usuario', verificaToken, (req, res) => {


    let desde = req.query.desde || 0;//sino tiene valor desde entonces su valor 0
    desde = Number(desde);//convirtiendo desde a numero

    let limite = req.query.limite || 10;//sino tiene valor limite entonces su valor es 5
    limite = Number(desde);

   // en find en el primer argumento podriamos especificar que busque los que tengan google,,,, {google: true},,,
  // las '' dentro del find, especifican los campos que quiero mostrar de los objetos
  Usuario.find({estado: true}, 'nombre email role estado google img')
          .skip(desde)//salta los registros, segun el valor de let desde
          .limit(limite)//limita la busqueda a los primeros 5
          .exec( (err,usuarios) => {

            if (err){
              return res.status(400).json({
                ok: false,
                err
              });
            }
            //count me trae al final un conteo de el total de los objetos traidos
            Usuario.countDocuments({estado: true},(err,conteo) => {

              res.json({
                ok: true,
                usuarios,
                cuantos: conteo
              })

            })


          })
});

//el post se utiliza como servicio de peticion al servidor para crear nuevos registros
//[verificaToken,verificaAdmin_Role] estos son middlewares, que van a verificar si la informacion del usuario que hizo login,, tiene los privilegios para hacer esta peticion
app.post('/usuario', [verificaToken,verificaAdmin_Role], function (req, res) {
  let body = req.body;//

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync (body.password, 10),//encripto la password
    role: body.role
  });
  //para guardar en la base de datos,, save es una palabra reservada de mongoose,, Recibo dos parametros un error o un usuarioDB, SI el let usuario tiene un valor entonces el callback usuarioDB toma ese valor 
  usuario.save((err, usuarioDB) => {
    if (err){
      return res.status(400).json({
        ok: false,
        err
      });
    }
    //usuarioDB.password = null;//le ponemos null para que no mande al servidor la respuesta de la contraseña
    //esto es lo que mandamos al servidor
    res.json({
      ok: true,
      usuario: usuarioDB
    })

  });

});

//el put se utiliza como servicio de peticion al servidor para actualizar datos
app.put('/usuario/:id', [verificaToken,verificaAdmin_Role], function (req, res) {

  let id = req.params.id;
  //con _.pick de el require underscorejs.org,, permitr indicar cuales parametros voy a permitir actualizar, y solo permite los que estan dentro del arreglo []
  let body = _.pick(req.body,['nombre','email','img','role', 'estado']);
  //new: true, es para que actualice en vista los datos
  //runValidators: true, es para que valide las validaciones en Schema en Usuario 
  Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true},(err,usuarioDB) => {
    
    if (err){
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      usuario: usuarioDB
    });

  });

});
//el delete se utiliza como servicio de peticion al servidor para eliminar datos
app.delete('/usuario/:id', [verificaToken,verificaAdmin_Role], function (req, res) {

  let id = req.params.id;

  let cambiaEstado = {
    estado: false
  }

  //Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=> {
    Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, usuarioBorrado)=> {

    if (err){
      return res.status(400).json({
        ok: false,
        err
      });
    }    

    if (usuarioBorrado === null){
      return res.status(400).json({
        ok: false,
        err: {
          message:'Usuario no encontrado'
        }
      });
    }

    res.json({
      ok: true,
      usuario: usuarioBorrado
    });

  });

});


module.exports = app;