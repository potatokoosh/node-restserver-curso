const express = require('express');

let {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//==============================
// Mostrar todas las categorias
//==============================
app.get('/categoria', verificaToken, (req, res)=>{
  Categoria.find({})
      .sort('descripcion')//ordena de acuerdo al parametro 'descripcion'
      .populate('usuario', 'nombre email')//trae informacion del usuario, de verificaToken
      .exec((err, categorias)=>{
        if (err){
          return res.status(500).json({
            ok: false,
            err
          });
        }

        res.json({
          ok: true,
          categorias
        })

      })
});

//==============================
// Mostrar una categoria por ID
//==============================
app.get('/categoria/:id', verificaToken, (req, res)=>{
  let id = req.params.id;//este id el el id que viene por url :id
  
  Categoria.findById(id, (err, categoriaDB)=>{
    if (err){
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB){
      return res.status(500).json({
        ok: false,
        err: {
          message: 'El id no es correcto'
        }
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    })

  })
  
});

//==============================
// Crear nueva categoria
//==============================
app.post('/categoria', verificaToken, (req, res)=>{
  // regresa la nueva categoria
  // req.usuario._id
  let body = req.body;

  let  categoria = new Categoria({
        descripcion: body.descripcion,//esta info viene de los datos del body
        usuario: req.usuario._id//esta info viene de verificaToken
  });

  categoria.save((err, categoriaDB) => {
    if (err){
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB){
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    })

  });

});

//==============================
// Actualizar la categorias
//==============================
app.put('/categoria/:id', verificaToken, (req, res)=>{
  let id = req.params.id;//este id el el id que viene por url :id
  let body = req.body;

  let desCategoria = {
    descripcion: body.descripcion
  }

  //primer parametro es el id
  //segundo parametro es la informacion que quiero actualizar
  //new: true, es para que actualice en vista los datos
  //runValidators: true, es para que valide las validaciones en Schema en Categoria
  //(err, categoriaBD),, este es el callback
  Categoria.findByIdAndUpdate(id, desCategoria, {new: true, runValidators: true}, (err, categoriaDB)=>{
    if (err){
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB){
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    })
  });

});

//==============================
// Eliminar categoria
//==============================
app.delete('/categoria/:id', (req, res)=>{
  // solo un administrador puede borrar categoria
  // Categoria.findByIdAndRemove
  let id = req.params.id;

  Categoria.findByIdAndRemove(id, [verificaToken,verificaAdmin_Role], (err,categoriaDB)=>{
    if (err){
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB){
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El id no existe'
        }
      });
    }

    res.json({
      ok: true,
      message: 'Categoria Borrada'
    })

  })

});

module.exports = app;
