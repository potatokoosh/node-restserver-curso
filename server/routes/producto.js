const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//==============================
// Obtener productos
//==============================
app.get('/productos', verificaToken, (req,res) => {
  //trae todos los productos
  // populate: usuario categoria
  // paginado

  let desde = req.query.desde || 0;
  desde = Number(desde);

  Producto.find({disponible: true})
      .skip(desde)
      .limit(5)
      .populate('usuario', 'nombre email')//trae informacion del usuario, de verificaToken
      .populate('categoria', 'descripcion')
      .exec((err, productos)=>{
        if (err){
          return res.status(500).json({
            ok: false,
            err
          });
        }

        res.json({
          ok: true,
          productos
        });

      })

});

//==============================
// Obtener un producto por ID
//==============================
app.get('/productos/:id', verificaToken, (req,res) => {
  // populate: usuario categoria
  // paginado
  let id = req.params.id;

  Producto.findById( id ) 
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec( (err, productoDB) => {

      if (err){
        return res.status(500).json({
          ok: false,
          err
        });
      }

      if (!productoDB){//este error si no hay ningun producto con el id
        return res.status(400).json({
          ok: false,
          err: {
            message: 'El id no existe'
          }
        });
      }

      res.json({
        ok: true,
        producto: productoDB
      })

    });

  
});

//==============================
// Buscar productos
//==============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

  let termino = req.params.termino;

  //RegExp, es una funcion de JS,, esta 'i' indica que no diferencia entre mayusculas y minisculas en la busqueda
  let regex =  new RegExp(termino, 'i');

  //{nombre: regex}, el nombre refiere al la palabra nombre del producto
  Producto.find ({nombre: regex})
    .populate('categoria', 'descripcion')
    .exec((err, productos) => {

      if (err){
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        productos
      });

    });

});

//==============================
// Crear un nuevo producto
//==============================
app.post('/productos', verificaToken, (req,res) => {
  // grabar el usuario
  // grabar una categoria del listado
  let body = req.body;

  let producto = new Producto ({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria,
    usuario: req.usuario._id//esta info viene de verificaToken
  })

  producto.save((err, productoDB) => {
    if (err){
      return res.status(500).json({
        ok: false,
        err
      });
    }

    res.status(201).json({
      ok: true,
      producto: productoDB
    });

  });
  
});

//==============================
// Actualizar un producto
//==============================
app.put('/productos/:id',verificaToken, (req,res) => {
  // grabar el usuario
  // grabar una categoria del listado
  
  let id = req.params.id;
  let body = req.body;

  Producto.findById(id,(err,productoDB) => {

    if (err){//este primer error es un error del servidor
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDB){//este error si no hay ningun producto con el id
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El id no existe'
        }
      });
    }

    productoDB.nombre = body.nombre; 
    productoDB.precioUni = body.precioUni;
    productoDB.descripcion = body.descripcion;
    productoDB.disponible = body.disponible;
    productoDB.categoria = body.categoria;

    productoDB.save((err,productoGuardado) => {

      if (err){
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        producto: productoGuardado
      })

    });

  })

});

//==============================
// Borrar un producto
//==============================
app.delete('/productos/:id', verificaToken, (req,res) => {
  // cambiar el estado de true a false
  let id = req.params.id;

  Producto.findById(id, (err, productoDB) => {

    if (err){
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDB){//este error si no hay ningun producto con el id
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El id no existe'
        }
      });
    }

    productoDB.disponible = false;

    productoDB.save((err, productoNoDisponible)=>{
      if (err){
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        producto: productoNoDisponible,
        message: 'Producto no disponible'
      })
      
    })

  })

});

module.exports = app;