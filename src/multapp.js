const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
const healthCheck = require('./controllers/healthCheck.js')
const MULTAS_COLL = 'multas';
require('dotenv/config');
const firebase = require("firebase");

// Request $CREDS environment variable
const keysEnvVar = process.env['CREDS'];
if (!keysEnvVar) {
  throw new Error('The $CREDS environment variable was not found!');
}
const keys = JSON.parse(keysEnvVar);

// Creating Cloud Firestore instance
admin.initializeApp({
    credential: admin.credential.cert(keys),
    storageBucket: process.env.STORAGE_BUCKET,
});

// referencia a auth
const auth = admin.auth();

// referencia a cloud firestore
const db = admin.firestore();

// esto de storage no anda, tengo que ver como puta hacer
// referencia a cloud storage
const storage = admin.storage();
// const storage = require('@google-cloud/storage');
// const firebase = require("firebase");
// const storage = firebase.storage().ref();
// console.log(storage);

const multasService = require('./services/multasService.js')(db)
const multasController = require('./controllers/multasController.js')(multasService)

const usuariosService = require('./services/usuariosService.js')(db, auth, storage)
const usuariosController = require('./controllers/usuariosController.js')(usuariosService)

const perfilService = require('./services/perfilService.js')(db, auth, storage)
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


// Creating session cookie
function iniciarSesion(email, password, res){
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    }
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(({ user }) => {
    return user.getIdToken().then((idToken) => {
       const expiresIn = 60 * 60 * 8 * 1000;
       admin
           .auth()
           .createSessionCookie(idToken, { expiresIn })
           .then(
           (sessionCookie) => {
               const options = { maxAge: expiresIn, httpOnly: true };
               res.cookie("session", sessionCookie, options);
               res.redirect('/');
           },
           (error) => {
               res.status(401).send("REQUEST DESAUTORIZADO!");
           }
       );
       return;
    });
    })
    .then(() => {
        return firebase.auth().signOut();
    }).catch(function(error) {
        // Handle Errors
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
            res.jsonp({
                fail : true, 
                mensaje : "CONTRASEÑA INCORRECTA"
            });
        } else {
            console.log(error);
            res.jsonp({
                fail : true, 
                mensaje : errorMessage
            });
        }
        // [END_EXCLUDE]
    });
}



// Set session cookie
router.post('/sessionLogin', (req, res) => {
    /* 
    const idToken = req.body.idToken.toString();
    const expiresIn = 60 * 60 * 8 * 1000;
    admin
        .auth().createSessionCookie(idToken, { expiresIn })
        .then(
        (sessionCookie) => {
            const options = { maxAge: expiresIn, httpOnly: true };
            res.cookie("session", sessionCookie, options);
            res.end(JSON.stringify({ status: "Success" }));
        },
        (error) => {
            res.status(401).send("UNAUTHORIZED REQUEST!");
        }
    ); 
    */
   let email = req.body.email.toString();
   let password = req.body.password.toString();
   iniciarSesion(email, password, res);

});

// Clear session cookie
router.get('/sessionLogout', (req, res) => {
    res.clearCookie("session");
    //res.redirect("/");
})

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
router.post("/addUsuario", usuariosController.addUsuario);

// editar un usuario
router.post("/editUsuario", usuariosController.editUsuario);

// eliminar un usuario
router.delete("/deleteUsuario", usuariosController.deleteUsuario);

/*** Endpoints de perfil ***/

// obtener el perfil del usuario actual
router.get("/getPerfil", perfilController.getPerfil);

// cambiar contraseña
router.post("/cambiarContrasena", perfilController.cambiarContrasena);

module.exports = router;
