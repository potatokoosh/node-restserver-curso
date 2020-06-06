const express = require('express');
const fs = require('fs');
const path = require('path');

const {verificaTokenImg} = require('../middlewares/autenticacion')

let app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

//se requiere la informacion de tipo y de img para poder desplegar este get
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

  let tipo = req.params.tipo;
  let img = req.params.img;
  
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

  //primero se corrobora que el path existe para poder traer la imagen
  if (fs.existsSync( pathImagen ) ){
    res.sendFile( pathImagen )//si existe la imagen, la envio
  }else {
    let noImagePath = path.resolve(__dirname,'../assets/no-image.jpg');
    res.sendFile(noImagePath);//si no existe envio esta imagen noImage
  }



})


module.exports = app;