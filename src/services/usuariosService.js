const { sendPasswordResetEmail } = require("firebase/auth");

module.exports = (db, auth, imageService, clientAuth) => {
    return {
        getUsuarioById: async (req, res) => {
            try {
                const userRecord = await auth.getUser(req.query.id);
                const snapshot = await db.collection("usuarios").doc(userRecord.uid).get();
                let direccion = snapshot.data().calle; // arma el string de la direccion
                if (snapshot.data().numero === "") {
                    direccion = direccion.concat(" S/N");
                }
                else {
                    direccion = direccion.concat(" ", snapshot.data().numero);
                }
                if (snapshot.data().piso !== "") {
                    direccion = direccion.concat(", Piso ", snapshot.data().piso);
                }
                if (snapshot.data().departamento !== "") {
                    direccion = direccion.concat(", Departamento ", snapshot.data().departamento);
                }
                const datos = {
                    id: userRecord.uid,
                    foto: userRecord.photoURL,
                    displayName: userRecord.displayName,
                    rol: userRecord.customClaims.rol,
                    email: userRecord.email,
                    dni: snapshot.data().dni,
                    apellido: snapshot.data().apellido,
                    nombre: snapshot.data().nombre,
                    fechaNacimiento: snapshot.data().fechaNacimiento,
                    sexo: snapshot.data().sexo,
                    telefono: userRecord.phoneNumber,
                    direccion: direccion,
                    calle: snapshot.data().calle,
                    numero: snapshot.data().numero,
                    piso: snapshot.data().piso,
                    departamento: snapshot.data().departamento,
                    localidad: snapshot.data().localidad,
                    provincia: snapshot.data().provincia,
                }
                res.send(datos);
            } catch (err) {
                console.log(err);
                res.status(500).send("Error al obtener datos de usuario");
            }
        },
        getUsuarios: async (_req, res) => {
            try {
                const listUsersResult = await auth.listUsers();
                const usuarios = listUsersResult.users.map(userRecord => ({
                    id: userRecord.uid,
                    rol: userRecord.customClaims ? userRecord.customClaims.rol : null,
                    nombre: userRecord.displayName,
                    email: userRecord.email,
                    foto: userRecord.photoURL,
                }));
                res.status(200).send(usuarios);
            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
        },
        addUsuario: async (req, res) => {
            try {
                // aca tambien habria que:
                // mandarle correo al tipo con su contraseña
                const password = (Math.floor(Math.random() * (1000000 - 100000)) + 100000).toString();
                console.log(password)
                const userRecord = await auth.createUser({ // crea el usuario
                    email: req.body.email,
                    password: password,
                    displayName: req.body.nombre + " " + req.body.apellido,
                    phoneNumber: req.body.telefono,
                });
                const uid = userRecord.uid;
                await auth.setCustomUserClaims(uid, { rol: req.body.rol }) // setea el rol del usuario
                await db.collection("usuarios").doc(uid).set({
                    dni: req.body.dni,
                    apellido: req.body.apellido,
                    nombre: req.body.nombre,
                    fechaNacimiento: req.body.fechaNacimiento,
                    sexo: req.body.sexo,
                    calle: req.body.calle,
                    numero: req.body.numero,
                    piso: req.body.piso,
                    departamento: req.body.departamento,
                    localidad: req.body.localidad,
                    provincia: req.body.provincia,
                });
                if (req.file) {
                    const publicURL = await imageService.uploader("avatar", uid, req, res, null); // sube su avatar a storage
                    await auth.updateUser(uid, { // asigna la url del avatar al usuario
                        photoURL: publicURL,
                    })
                }
                var actionCodeSettings = {};
                if (req.body.rol == "Ciudadano"){
                    actionCodeSettings.url = 'https://multapp-citizen.herokuapp.com/';
                } else {
                    actionCodeSettings.url = 'https://multa-app-front.herokuapp.com/';
                }
                await sendPasswordResetEmail(clientAuth, req.body.email, actionCodeSettings);
                const link = await auth.generateEmailVerificationLink(req.body.email);
                res.status(201).send("Usuario " + uid + " creado correctamente");
            } catch (err) {
                console.log(err);
                res.status(500).send({
                    message: err.code,
                });
            }
        },
        editUsuario: async (req, res) => {
            try {
                // aca tambien habria que:
                // mandarle correo al tipo con el cambio de correo
                await auth.updateUser(req.body.id, { // actualiza los datos en authentication
                    email: req.body.email,
                    phoneNumber: req.body.telefono,
                    displayName: req.body.nombre + " " + req.body.apellido,
                });
                await db.collection("usuarios").doc(req.body.id).update({ // actualiza los datos en firestore
                    dni: req.body.dni,
                    apellido: req.body.apellido,
                    nombre: req.body.nombre,
                    fechaNacimiento: req.body.fechaNacimiento,
                    sexo: req.body.sexo,
                    calle: req.body.calle,
                    numero: req.body.numero,
                    piso: req.body.piso,
                    departamento: req.body.departamento,
                    localidad: req.body.localidad,
                    provincia: req.body.provincia,
                });
                if (req.file) { // si se carga foto se actualiza, sino no
                    // sube su avatar a storage
                    const publicURL = await imageService.uploader("avatar", req.body.id, req, res, null);
                    // asigna la url del avatar al usuario
                    auth.updateUser(req.body.id, { photoURL: publicURL });
                }
                res.status(201).send("Usuario " + req.body.id + " actualizado correctamente");
            } catch (err) {
                console.log(err);
                res.status(500).send({
                    message: err.code,
                });
            }
        },
        deleteUsuario: async (req, res) => {
            try {
                // FALTA
                // eliminar la foto de perfil del usuario (cuando sepa como cargar una)
                await auth.deleteUser(req.query.id) // elimina la cuenta de authentication
                await db.collection("usuarios").doc(req.query.id).delete() // elimina los datos del usuario en firestore
                res.status(200).send("Usuario " + req.query.id + " eliminado correctamente");
            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
        }
    }
}