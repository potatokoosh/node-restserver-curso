   
// ===========================
//   Puerto
//============================
// Aqui estamos diciendo que si no encuentra el PORT del servidor en la nube entonces despliegue la aplicacion en el puerto 3000 localmente.
process.env.PORT = process.env.PORT || 3000;

// ===========================
//   Entorno
//============================
//si la variable process.env.NODE_ENV no existe entonces supongo que esta en dev,, desarrollo
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===========================
//   Vencimiento del Token
//============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
// CADUCIDAD_TOKEN es una nombre personalizado
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ===========================
//   SEED de autenticacion
//============================
//SEED es un nombre personalizado
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo'

// ===========================
//   Base de datos
//============================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
  urlDB = 'mongodb://localhost:27017/cafe';
}else {
  //urlDB = 'mongodb+srv://jose1:PqwiKgtezKS3Ps9a@cluster0-doyqt.mongodb.net/cafe';
  //Se crea en terminal una variable de entorno con el nombre MONGO_URI que tiene el valor de la url de la base de datos en mongoAtlas,,, mongodb+srv://jose1:PqwiKgtezKS3Ps9a@cluster0-doyqt.mongodb.net/cafe,,,,,, esto es para que al momento de subir al repositorio el proyecto no se envie esta url de la base de datos,, 
  urlDB = process.env.MONGO_URI;
}

//el .URLDB es un nombre creado por nosotros que le damos el valor de let urlDB
process.env.URLDB = urlDB

// ===========================
//   Google Client ID
//============================

process.env.CLIENT_ID = process.env.CLIENT_ID || "744675548988-7mhdfm092ljp9o1fbqd95gd0cm5bubbk.apps.googleusercontent.com"