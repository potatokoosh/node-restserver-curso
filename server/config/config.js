   
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
//   Base de datos
//============================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
  urlDB = 'mongodb://localhost:27017/cafe';
}else {
  urlDB = 'mongodb+srv://jose1:PqwiKgtezKS3Ps9a@cluster0-doyqt.mongodb.net/cafe';
}

//el .URLDB es un nombre creado por nosotros que le damos el valor de let urlDB
process.env.URLDB = urlDB