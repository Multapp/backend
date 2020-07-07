const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
require('dotenv/config');

//Deploy

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
//HEALTH
router.get('/health', (req, res) => {
    res.send("It's alive")
})

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
router.get('/getMultas', (req, res) => {
    db.collection('multas').get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log("Colección de multas vacía");
            }
            else {
                const multasResumidas = snapshot.map(multa => {
                    return {
                        id: multa.id,
                        nombreConductor: multa.data.conductor.nombre,
                        dniConductor: multa.data.conductor.nroDocumento,
                        fecha: multa.data.ubicacion.fecha,
                        extracto: multa.data.infraccion.extracto,
                        estado: multa.data.estado,
                    }
                });
                res.send(multasResumidas);
            }
        }).catch(error => {
            console.log("Error al recuperar multas", error);
        });
});

// obtener todos los datos de una sola multa
router.get("/getMulta", (req, res) => {
    db.collection("multas").doc(req.id).get()
        .then(snapshot => {
            res.send({
                id: snapshot.id,
                ...snapshot.data,
            });
        }).catch(error => {
            console.log("Error al recuperar multa", error);
        })
});

// cambiar de estado una multa
router.patch("/actualizarEstado", (req, res) => {
    const multaSinActualizar = {};
    db.collection("multas").doc(req.id).get()
        .then(snapshot => {
            multasSinActualizar = {
                ...snapshot.data,
            };
        });
    db.collection("multas").doc(req.id).set({
        ...multaSinActualizar,
        estado: req.estado,
        razon: req.razon,
        idSupervisor: null, // aca tendria que poner el id del supervisor que aprueba la multa
    });
});

//MULTAS
    //POST
router.post('/multa', (req, res) => {
    console.log(req.body);
    const newMulta = {
        Domicilio: req.body.domicilio,
        FechaEmision: req.body.fechaEmision,
        Hora: req.body.hora,
        Nacimiento: req.body.nacimiento,
        NroDoc: req.body.nroDoc,
        Sexo: req.body.sexo,
        TipoDoc: req.body.tipoDoc,
        ApellidoInfractor: req.body.apellidoInfractor,
        NombresInfractor: req.body.nombresInfractor
        // Tal vez estaría bueno guardar un identificador del inspector que manda la multa
    };
    db.collection('multa').add(newMulta);
    res.send('Multa guardada');
});

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