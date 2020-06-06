const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// fs"fileSistem" y path,, son requiere necesarios para consultar un sistema si un archivo existe o no,, en este caso las imgenes de productos y de usuarios, estos paquetes estan integrados en node
const fs = require('fs');
const path = require('path');

//este middleware, trae por defecto todo lo que haya en una carpeta files
app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', function(req, res) {

  let tipo = req.params.tipo;
  let id = req.params.id;


  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400)
                .json({
                  ok: false, 
                  err: {
                    message: 'No se ha seleccionado ningun archivo'
                  } 
                });
  }

  // Validar tipo
  let tiposValidos = ['productos', 'usuarios'];
  if(tiposValidos.indexOf(tipo) <0 ){
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Los tipo permitidos son ' + tiposValidos.join(', '),
      }
    })
  }

  //req.files.archivo,, voy a capturar la informacion que le ponga a archivo desde postman
  let archivo = req.files.archivo;
  let nombreCortado = archivo.name.split('.');// estamos segmentando para identificar la extension, que formato es el archivo
  let extension = nombreCortado[nombreCortado.length -1 ];// el -1 toma la ultima posicion del arreglo, que es donde esta la extension


  // Extensiones permitidas
  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf( extension ) < 0 ){
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
        ext: extension
      }
    })
  }

  // Cambiar nombre al archivo, para que sea unico, y prevenir el cache del navegador web
  // ${new Date().getMilliseconds},, esto es para concadenar los milisegundos al id del producto y hacerlo unico y asi la cache no tenga errores
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
  console.log(nombreArchivo);

  // Use the mv() method to place the file somewhere on your server
  archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
    if (err)
      return res.status(500).json({
        ok: false,
        err
      });

      // Aqui, la imagen ya esta cargada
      // ahora asignamos segun tipo donde la queremos guardar
      if( tipo === 'usuarios' ){
        imagenUsuario(id, res, nombreArchivo);
      }else{
        imagenProducto(id, res, nombreArchivo);
      }

  });

});

function imagenUsuario(id, res, nombreArchivo) {
  
  Usuario.findById(id, (err,usuarioDB) =>{

    if(err){//error en servidor
      //aqui hay que borrar el archivo nombreArchivo que es un archivo que se subio pero se presento un error
      borrarArchivo(nombreArchivo,'usuarios');
      return res.status(500).json({
        ok: false,
        err
      })
    }

    if (!usuarioDB){//usuario no existe
      //aqui hay que borrar el archivo nombreArchivo que es un archivo que se subio pero no esta relacionado a ningun usuario
      borrarArchivo(usuarioDB.img,'usuarios');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario no existe'
        }
      })
    }

    //borramos archivo para no guardar varias imagenes del mismo usuario
    borrarArchivo(usuarioDB.img,'usuarios');

    //vamos a guardar la imagen asignada al usuario respectivo
    usuarioDB.img = nombreArchivo;//.img es por shema, ahi es donde se guarda la img
    usuarioDB.save((err, usuarioGuardado) => {

      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo
      })

    })

  });

};

function imagenProducto(id, res, nombreArchivo) {
  
  Producto.findById(id, (err,productoDB) =>{

    if(err){//error en servidor
      //aqui hay que borrar el archivo nombreArchivo que es un archivo que se subio pero se presento un error
      borrarArchivo(nombreArchivo,'productos');
      return res.status(500).json({
        ok: false,
        err
      })
    }

    if (!productoDB){//producto no existe
      //aqui hay que borrar el archivo nombreArchivo que es un archivo que se subio pero no esta relacionado a ningun producto
      borrarArchivo(productoDB.img,'productos');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no existe'
        }
      })
    }

    //borramos archivo para no guardar varias imagenes del mismo producto
    borrarArchivo(productoDB.img,'usuarios');

    //vamos a guardar la imagen asignada al producto respectivo
    productoDB.img = nombreArchivo;//.img es por shema, ahi es donde se guarda la img
    productoDB.save((err, productoGuardado) => {

      res.json({
        ok: true,
        producto: productoGuardado,
        img: nombreArchivo
      })

    })

  });

};

function borrarArchivo(nombreImagen, tipo){

  //vamos a verificar que la ruta y la imagen exista primero, antes de guardar una img
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
  //fs.existsSync, es una funcion que retorna false o true,
  if(fs.existsSync(pathImagen)){
    fs.unlinkSync(pathImagen)//si existe con fs.unlinkSync,, borra el archivo, para que sobre escriba la nueva imagen que quiero guardar, y no se guarde repetida,, como por params estamos mandando ya un usuario id, es borrar la img que ya tiene el usuarioDB.img, por que con el save le vamos a mandar otra imagen el mismo usuario id que viene por params
  }

};

module.exports = app;