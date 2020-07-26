const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
const healthCheck = require('./controllers/healthCheck.js')
const MULTAS_COLL = 'multas';
require('dotenv/config');

// Request $CREDS environment variable
const keysEnvVar = process.env['CREDS'];
if (!keysEnvVar) {
  throw new Error('The $CREDS environment variable was not found!');
}
const keys = JSON.parse(keysEnvVar);

// Creating Cloud Firestore instance
admin.initializeApp({
    credential: admin.credential.cert(keys)
})
const db = admin.firestore();

const multasService = require('./services/multasService.js')(db)
const multasController = require('./controllers/multasController.js')(multasService)

const usuariosService = require('./services/usuariosService.js')(db, admin)
const usuariosController = require('./controllers/usuariosController.js')(usuariosService)

//HEALTH
router.get('/health', healthCheck)

// Request $CLIENTE environment variable
var cliente = process.env['CLIENTE'];
if (!cliente) {
  throw new Error('The $CLIENTE environment variable was not found!');
}
cliente = JSON.stringify(cliente);

// Set session cookie
router.post('/sessionLogin', (req, res) => {
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

//INSPECTORES
    //GET
router.get('/inspectores/todos', (req,res) =>{
    var texto = '{ ';
    db.collection('inspectores').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            texto += '"' + doc.id + '" : ' + JSON.stringify(doc.data()) + ', ';
        });  
        texto = texto.slice(0, -2);
        texto += '}'
        if(texto.length > 2){
            res.send(JSON.parse(texto));
        } else{
            res.send('Base de datos vacía o inexistente')
        }
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

//INSPECTORES
    //POST
router.post('/inspectores/nuevo', (req, res) => {
    const newInspector = {
        NombresInspector: req.body.nombreInspector,
        ApellidoInspector: req.body.apellidoInspector,
        Domicilio: req.body.domicilio,
        Nacimiento: req.body.nacimiento,
        NroDoc: req.body.nroDoc,
        Sexo: req.body.sexo,
        TipoDoc: req.body.tipoDoc
    };
    db.collection('inspectores').add(newInspector);
    res.send('Inspector creado');
})

//INSPECTORES
    //DELETE
router.get('/inspectores/:id', (req,res) => {
    db.collection('inspectores').doc(req.params.id).delete();
    res.send('Inspector borrado');
});

//JUECES
    //GET
router.get('/jueces/todos', (req,res) =>{
    var texto = '{ ';
    db.collection('jueces').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            texto += '"' + doc.id + '" : ' + JSON.stringify(doc.data()) + ', ';
        });  
        texto = texto.slice(0, -2);
        texto += '}'
        if(texto.length > 2){
            res.send(JSON.parse(texto));
        } else{
            res.send('Base de datos vacía o inexistente')
        }
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

//JUECES
    //POST
router.post('/jueces/nuevo', (req, res) => {
    const newJuez = {
        NombresJuez: req.body.nombreInspector,
        ApellidoJuez: req.body.apellidoInspector,
        Domicilio: req.body.domicilio,
        Nacimiento: req.body.nacimiento,
        NroDoc: req.body.nroDoc,
        Sexo: req.body.sexo,
        TipoDoc: req.body.tipoDoc
    };
    db.collection('jueces').add(newJuez);
    res.send('Juez creado');
});

//JUECES
    //DELETE
router.get('/jueces/:id', (req,res) => {
    db.collection('jueces').doc(req.params.id).delete();
    res.send('Juez borrado');
});


module.exports = router;