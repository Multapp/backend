const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
const healthCheck = require('./controllers/healthCheck.js')
const MULTAS_COLL = 'multas';
require('dotenv/config');
const firebase = require("firebase");
const multer = require('multer');

// Request $CREDS environment variable
const keysEnvVar = process.env['CREDS'];
if (!keysEnvVar) {
  throw new Error('The $CREDS environment variable was not found!');
}
const keys = JSON.parse(keysEnvVar);

// Creating Cloud Firestore instance
admin.initializeApp({
    credential: admin.credential.cert(keys),
    storageBucket: "node-firebase-example-ffff0.appspot.com"
  });
var bucket = admin.storage().bucket();
const uploader = require('./services/imageService.js')(bucket)

// referencia a auth
const auth = admin.auth();

// referencia a cloud firestore
const db = admin.firestore();

// esto de storage no anda, tengo que ver como puta hacer
// referencia a cloud storage
//const storage = admin.storage();
 const { Storage } = require('@google-cloud/storage');
// const firebase = require("firebase");
// const storage = firebase.storage().ref();
// console.log(storage);

const imageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
      fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
  },
});

const autenticacionService = require('./services/autenticacionService.js')(db, auth, firebase)
const autenticacionController = require('./controllers/autenticacionController.js')(autenticacionService)

const multasService = require('./services/multasService.js')(db, auth, uploader)
const multasController = require('./controllers/multasController.js')(multasService)

const usuariosService = require('./services/usuariosService.js')(db, auth, uploader)
const usuariosController = require('./controllers/usuariosController.js')(usuariosService)

const perfilService = require('./services/perfilService.js')(db, auth, uploader)
const perfilController = require('./controllers/perfilController.js')(perfilService)

//HEALTH
router.get('/health', healthCheck)

// Request $CLIENTE environment variable
var cliente = process.env['CLIENTE'];
if (!cliente) {
  throw new Error('The $CLIENTE environment variable was not found!');
}
cliente = JSON.parse(cliente);

firebase.initializeApp(cliente);



/*** Endpoints de autenticación ***/

// iniciar sesion
router.post('/sessionLogin', autenticacionController.sessionLogin);

//cerrar sesion
router.get('/sessionLogout', autenticacionController.sessionLogout)

// cambiar contraseña
router.post("/cambiarContrasena", autenticacionController.cambiarContrasena);

// cambiar contraseña
router.post("/recuperarContrasena", autenticacionController.recuperarContrasena);

/*** Endpoints de multas ***/

// obtener multas resumidas
router.get("/getMultas", multasController.getAllMultas);

// obtener todos los datos de una sola multa
router.get("/getMulta", multasController.getMultaById);

// cambiar de estado una multa
router.post("/actualizarEstado", multasController.actualizarEstado);

//MULTAS
    //POST
router.post('/multa', (req, res) => {
    console.log(req.body);
//    const newMulta = {
//        Domicilio: req.body.domicilio,
//        FechaEmision: req.body.fechaEmision,
//        Hora: req.body.hora,
//        Nacimiento: req.body.nacimiento,
//        NroDoc: req.body.nroDoc,
//        Sexo: req.body.sexo,
//        TipoDoc: req.body.tipoDoc,
//        ApellidoInfractor: req.body.apellidoInfractor,
//        NombresInfractor: req.body.nombresInfractor
//        // Tal vez estaría bueno guardar un identificador del inspector que manda la multa
//    };
    db.collection('multas').add(req.body);
    res.send('Multa guardada');
});

/*** Endpoints de usuarios ***/

// obtener usuarios resumidos
router.get("/getUsuarios", usuariosController.getUsuarios);

// obtener todos los datos de un solo usuario
router.get("/getUsuario", usuariosController.getUsuarioById);

// crear un usuario
// imageMiddleware agrega a req.file el archivo que se manda en el parametro 'image'
router.post("/addUsuario", imageMiddleware.single('image'), usuariosController.addUsuario);

// editar un usuario
router.post("/editUsuario", usuariosController.editUsuario);

// eliminar un usuario
router.delete("/deleteUsuario", usuariosController.deleteUsuario);

/*** Endpoints de perfil ***/

// obtener el perfil del usuario actual
router.get("/getPerfil", perfilController.getPerfil);

module.exports = router;