module.exports = (db, auth, storage) => {
    return {
        getUsuarioById: (req, res, next) => {
            db.collection("usuarios").doc(req.query.id).get()
                .then(snapshot => {
                    res.send({
                        id: snapshot.id,
                        ...snapshot.data(),
                    });
                }).catch(error => {
                    console.log("Error al recuperar usuario " + req.query.id, error);
                });
        },
        getUsuarios: (req, res, next) => {
            db.collection("usuarios").get()
                .then(snapshot => {
                    let usuariosResumidos = [];
                    snapshot.forEach(usuario => {
                        let usuarioResumido = {
                            id: usuario.id,
                            rol: usuario.data().rol,
                            nombre: usuario.data().apellido + " " + usuario.data().nombre,
                            foto: usuario.data().foto,
                        };
                        usuariosResumidos.push(usuarioResumido);
                    });
                    res.send(usuariosResumidos);
                }).catch(error => {
                    console.log("Error al recuperar usuarios", error);
                });
        },
        addUsuario: (req, res, next) => {
            // aca tambien habria que:
            // guardar la foto del tipo en storage
            // mandarle correo al tipo con su contraseña
            let password = (Math.floor(Math.random() * (1000000 - 100000) ) + 100000).toString();
            console.log(password);
            auth.createUser({ // crea el usuario
                email: req.body.usuario.email,
                password: password,
                displayName: req.body.usuario.nombre + " " + req.body.usuario.apellido,
                phoneNumber: "+54" + req.body.usuario.telefono,
            })
                .then(userRecord => {
                    let uid = userRecord.uid;
                    auth.setCustomUserClaims(uid, {rol: req.body.usuario.rol}) // setea el rol del usuario
                        .then(() => { // guarda los datos personales en la base de datos
                            db.collection("usuarios").doc(uid).set({
                                ...req.body.usuario,
                            })
                                .then(() => {
                                    // storage.ref().child("avatar/" + uid).put(req.body.foto) // guarda la foto de perfil
                                    //     .then(snapshot => {
                                    //         console.log(snapshot);
                                            // userRecord.updateUser({ // guarda la referencia a la foto en authentication
                                            //     // photoURL
                                            // })
                                            //     .then(() => {
                                                    res.status(201).send("Usuario " + uid + " creado correctamente");
                                                // }).catch(error => {
                                                //     res.status(500).send(error);
                                                // });
                                        // }).catch(error => {
                                        //     console.log(error);
                                        //     res.status(500).send(error);
                                        // })
                                }).catch(error => {
                                    console.log(error);
                                    res.status(500).send(error);
                                });
                        }).catch(error => {
                            console.log(error);
                            res.status(500).send(error);
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
        },
        editUsuario: (req, res, next) => {
            // aca tambien habria que:
            // guardar la foto nueva en storage
            // cambiar el correo del tipo en authentication (si es que se cambio)
            // mandarle correo al tipo con el cambio de correo
            db.collection("usuarios").doc(req.body.id).update(req.body.usuario)
                .then(snapshot => {
                    res.send("Usuario " + req.body.id + " actualizado correctamente");
                }).catch(error => {
                    res.send("Error al actualizar usuario " + req.body.id, error);
                });
        },
        deleteUsuario: (req, res, next) => {
            // FALTA
            // eliminar la foto de perfil del usuario (cuando sepa como cargar una)
            let uid;
            db.collection("usuarios").doc(req.query.id).get() // trae el uid guardado en firestore
                .then(snapshot => {
                    uid = snapshot.data().uid;
                    auth.deleteUser(uid) // elimina la cuenta de authentication
                        .then(() => {
                            db.collection("usuarios").doc(req.query.id).delete() // elimina todos los datos del usuario en firestore
                                .then(() => {
                                    res.status(200).send("Usuario " + req.query.id + " eliminado correctamente");
                                }).catch(error => {
                                    console.log(error);
                                    res.status(500).send("Error al eliminar datos de usuario " + res.query.id, error);
                                });
                        }).catch(error => {
                            console.log(error);
                            res.status(500).send("Error al eliminar cuenta " + uid, error);
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send("Error al recuperar el UID del registro " + req.query.id, error);
                });
        }
    }
}