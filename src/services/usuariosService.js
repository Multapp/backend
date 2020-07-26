module.exports = (db, admin) => {
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
            admin.auth().createUser({
                email: req.body.usuario.email,
                password: (Math.floor(Math.random() * (1000000 - 100000) ) + 100000).toString(),
                displayName: req.body.usuario.nombre + " " + req.body.usuario.apellido,
                phoneNumber: "+54" + req.body.usuario.telefono,
                // photoURL: null,
            })
                .then(userRecord => {
                    let uid = userRecord.uid;
                    admin.auth().setCustomUserClaims(uid, {rol: req.body.usuario.rol})
                        .then(() => {
                            db.collection("usuarios").add({
                                ...req.body.usuario,
                                uid: uid,
                            })
                                .then(() => {
                                    res.status(201).send("Usuario " + uid + " creado correctamente");
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
            db.collection("usuarios").doc(req.query.id).delete()
                .then(snapshot => {
                    res.send("Usuario " + req.query.id + " eliminado correctamente");
                }).catch(error => {
                    res.send("Error al eliminar usuario " + res.query.id, error);
                });
            
        }
    }
}