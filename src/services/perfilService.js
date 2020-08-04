module.exports = (db, auth, storage) => {
    return {
        getPerfil: (req, res, next) => {
            auth.getUser(req.query.uid)
                .then(userRecord => {
                    let response = {
                        id: userRecord.uid,
                        datos: null,
                        foto: userRecord.photoURL,
                    };
                    db.collection("usuarios").doc(userRecord.uid).get()
                        .then(snapshot => {
                            const datos = {
                                nombre: userRecord.displayName,
                                rol: userRecord.customClaims.rol,
                                email: userRecord.email,
                                dni: snapshot.data().dni,
                                fechaNacimiento: snapshot.data().fechaNacimiento,
                                sexo: snapshot.data().sexo,
                                telefono: userRecord.phoneNumber,
                                direccion: snapshot.data().calle + " " + snapshot.data().numero,
                                localidad: snapshot.data().localidad,
                                provincia: snapshot.data().provincia,
                            }
                            response.datos = datos;
                            res.send(response);
                        }).catch(error => {
                            console.log(error);
                            res.send(error);
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send("Error al obtener datos de usuario");
                });
        },
        cambiarContrasena: (req, res, next) => {
            // FALTA HACER
            // verificar que req.body.contrasenaActual sea realmente la contraseña actual
            auth.updateUser(req.body.uid, {
                password: req.body.contrasenaNueva,
            })
                .then(() => {
                    res.status(200).send("Contraseña actualizada exitosament");
                }).catch(error => {
                    console.log(error);
                    res.status(500).send("No se pudo cambiar la contraseña");
                });
        },
    }
}