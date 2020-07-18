module.exports = (db) => {
    return {
        getUsuarioById: (req, res, next) => {
            db.collection("usuarios").doc(req.query.id).get()
                .then(snapshot => {
                    res.send({
                        id: snapshot.id,
                        ...snapshot.data(),
                    });
                }).catch(error => {
                    console.log("Error al recuperar usuario", error);
                });
        },
        getUsuarios: (req, res, next) => {
            db.collection("usuarios").get()
                .then(snapshot => {
                    let usuariosResumidos = [];
                    snapshot.forEach(usuario => {
                        console.log("id", usuario.id);
                        console.log("data", usuario.data());
                        let usuarioResumido = {
                            id: usuario.id,
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
    }
}