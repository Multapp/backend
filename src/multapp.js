const { Router } = require('express');
const router = Router();
const healthCheck = require('./controllers/healthCheck.js')
require('dotenv/config');
const multer = require('multer');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { initializeApp: initializeClientApp } = require('firebase/app');
const { getAuth: getClientAuth } = require('firebase/auth');

// Request $CREDS environment variable
const creds = process.env['CREDS'];
if (!creds) {
    throw new Error('The $CREDS environment variable was not found!');
}
const adminApp = initializeApp({
    credential: cert(JSON.parse(creds)),
    storageBucket: "multas-36b0c.appspot.com"
});
const bucket = getStorage(adminApp).bucket();
const auth = getAuth(adminApp);
const db = getFirestore(adminApp);

// Request $CLIENTE environment variable
const cliente = process.env['CLIENTE'];
if (!cliente) {
    throw new Error('The $CLIENTE environment variable was not found!');
}
const clientApp = initializeClientApp(JSON.parse(cliente));
const clientAuth = getClientAuth(clientApp);


const imageMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
    },
});

const imageService = require('./services/imageService.js')(bucket)

const autenticacionService = require('./services/autenticacionService.js')(auth, clientAuth)
const autenticacionController = require('./controllers/autenticacionController.js')(autenticacionService)

const multasService = require('./services/multasService.js')(db, auth, imageService)
const multasController = require('./controllers/multasController.js')(multasService)

const usuariosService = require('./services/usuariosService.js')(db, auth, imageService, clientAuth)
const usuariosController = require('./controllers/usuariosController.js')(usuariosService)

const vehiculosService = require('./services/vehiculosService.js')(db, auth)
const vehiculosController = require('./controllers/vehiculosController.js')(vehiculosService)

const perfilService = require('./services/perfilService.js')(db, auth)
const perfilController = require('./controllers/perfilController.js')(perfilService)

//HEALTH
router.get('/health', healthCheck)

/*** Endpoints de autenticación ***/
router.post('/sessionLogin', autenticacionController.sessionLogin);
router.get('/sessionLogout', autenticacionController.sessionLogout)
router.post("/cambiarContrasena", autenticacionController.cambiarContrasena);
router.post("/recuperarContrasena", autenticacionController.recuperarContrasena);

/*** Endpoints de multas ***/
router.get("/getMultas", multasController.getAllMultas);
router.get("/getMulta", multasController.getMultaById);
router.post("/actualizarEstado", multasController.actualizarEstado);

/*** Endpoints de usuarios ***/
router.get("/getUsuarios", usuariosController.getUsuarios);
router.get("/getUsuario", usuariosController.getUsuarioById);
// imageMiddleware agrega a req.file el archivo que se manda en el parametro 'image'
router.post("/addUsuario", imageMiddleware.single('file'), usuariosController.addUsuario);
router.post("/editUsuario", imageMiddleware.single('file'), usuariosController.editUsuario);
router.delete("/deleteUsuario", usuariosController.deleteUsuario);

/*** Endpoints de vehiculos ***/
router.get("/getVehiculos", vehiculosController.getVehiculos);
router.post("/addVehiculo", vehiculosController.addVehiculo);
router.post("/editVehiculo", vehiculosController.editVehiculo);
router.delete("/deleteVehiculo", vehiculosController.deleteVehiculo);

/*** Endpoints de perfil ***/
router.get("/getPerfil", perfilController.getPerfil);

module.exports = router;