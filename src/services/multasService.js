const sendEmail = require('../utils/mailSender.js');
const templateTicket = require('../mail/mail');

module.exports = function (db, auth, storage) {
    return {
        getMultaById: function (req, res, next) {
            db.collection("multas").doc(req.query.id).get()
                .then(snapshot => {
                    auth.getUser(snapshot.data().idInspector)
                        .then(inspectorRecord => {
                            let response = {
                                id: snapshot.id,
                                ...snapshot.data(),
                                nombreInspector: inspectorRecord.displayName,
                                nombreSupervisor: "",
                            };
                            if (snapshot.data().idSupervisor !== "") {
                                auth.getUser(snapshot.data().idSupervisor)
                                    .then(supervisorRecord => {
                                        response.nombreSupervisor = supervisorRecord.displayName;
                                        res.send(response);
                                    }).catch(error => {
                                        console.log(error);
                                        res.status(500).send({
                                            message: error.code,
                                        });
                                    });
                            }
                            else {
                                res.send(response);
                            }
                        }).catch(error => {
                            console.log(error);
                            res.status(500).send({
                                message: error.code,
                            });
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send({
                        message: error.code,
                    });
                })
        },
        getMultas: function (req, res, next) {
            db.collection("multas").get()
                .then(snapshot => {
                    let multasResumidas = [];
                    snapshot.forEach(multa => {
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
                idSupervisor: req.body.idSupervisor,
            })/* .then(snapshot => {
                res.send("Estado de multa " + req.id + " actualizado con éxito");
            }).catch(error => {
                console.log(error);
                res.status(500).send({
                    message: error.code,
                });
            }); */
            .then(async snapshot => {
                const multaVar = await db.collection("multas").doc(req.body.id).get()
                .then(snapshot => { 
                    return snapshot.data();
                });
                const documento = multaVar.conductor.nroDocumento;
                const user = await db.collection("usuarios").where("dni", "==", documento).get()
                .then(snapshot => { 
                    const respuesta = {
                        id: snapshot.docs[0].id,
                        data: snapshot.docs[0].data()
                    };
                    return respuesta;
                });
                const authUser = await auth.getUser(user.id);
                const plantilla = templateTicket(user.data.nombre, user.data.apellido, user.data.sexo);
                sendEmail(authUser.email, "Multas con Actualizaciones Recientes", plantilla);
                res.send("Estado de multa " + req.body.id + " actualizado con éxito");
            }).catch(error => {
                console.log(error);
                res.status(500).send({
                    message: error.code,
                });
            });
        }
    }
}