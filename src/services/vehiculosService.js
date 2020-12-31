module.exports = (db, auth) => {
    return {
        getVehiculos: function(req, res, next) {
            db.collection("vehiculos").get()
                .then(snapshot => {
                    let data = [];
                    snapshot.forEach(doc => {
                        data.push({
                            id: doc.id,
                            ...doc.data(),
                        })
                    });
                    res.send(data);
                }).catch(error => {
                    console.log(error);
                    res.status(500).send("Error al obtener datos de vehículos");
                });
        },
        addMarca: function(req, res, next) {
            db.collection("vehiculos").add({
                logo: "",
                marca: req.body.marca,
                modelos: req.body.modelos,
            }).then(() => {
                res.status(201).send("Marca " + req.body.marca + " creada correctamente");
            }).catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
        },
        addModelo: function(req, res, next) {
            
        },
        deleteMarca: function(req, res, next) {
            db.collection("vehiculos").doc(req.query.id).delete()
            .then(() => {
                res.status(200).send("Marca " + req.query.id + " eliminada correctamente");
            }).catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
        },
        deleteModelo: function(req, res, next) {
            
        },
    }
}