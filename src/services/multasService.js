module.exports = function (db) {
    return {
        getMultaById: function (req, res, next) {
            db.collection("multas").doc(req.query.id).get()
                .then(snapshot => {
                    res.send({
                        id: snapshot.id,
                        ...snapshot.data(),
                    });
                }).catch(error => {
                    console.log("Error al recuperar multa", error);
                })
        },
        getMultas: function (req, res, next) {
            db.collection("multas").get()
                .then(snapshot => {
                    let multasResumidas = [];
                    snapshot.forEach(multa => {
                        console.log("id", multa.id);
                        console.log("data", multa.data());
                        let multaResumida = {
                            id: multa.id,
                            nombreConductor: multa.data().conductor.apellido + " " + multa.data().conductor.nombre,
                            dniConductor: multa.data().conductor.nroDocumento,
                            fecha: multa.data().ubicacion.fecha,
                            extracto: multa.data().infraccion.extracto,
                            estado: multa.data().estado,
                        };
                        multasResumidas.push(multaResumida);
                    });
                    res.send(multasResumidas);
                }).catch(error => {
                    console.log("Error al recuperar multas", error);
                });
        },
        actualizarEstado: function (req, res, next) {
            db.collection("multas").doc(req.body.id).update({
                estado: req.body.estado,
                razon: req.body.razon,
                idSupervisor: null, // aca tendria que poner el id del supervisor que aprueba la multa
            }).then(snapshot => {
                res.send("Estado de multa " + req.id + " actualizado con éxito");
            }).catch(error => {
                res.send("Error al actualizar estado de multa " + req.id);
            });
        }
    }
}