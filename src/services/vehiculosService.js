const { doc, setDoc } = require('firebase/firestore');

module.exports = (db, auth) => {
    return {
        getVehiculos: function(_req, res) {
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
        addVehiculo: function(req, res) {
            db.collection("vehiculos").add({
                marca: req.body.marca,
                modelos: req.body.modelos || []
            }).then(() => {
                res.status(201).send("Marca " + req.body.marca + " creada correctamente");
            }).catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
        },
        editVehiculo: async function(req, res) {
            try {
                await db.collection('vehiculos').doc(req.body.id).update(req.body.data);
                res.status(201).send("Vehículo " + req.body.marca + " actualizado correctamente");
            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
        },
        deleteVehiculo: function(req, res) {
            db.collection("vehiculos").doc(req.query.id).delete()
            .then(() => {
                res.status(200).send("Vehículo " + req.query.id + " eliminado correctamente");
            }).catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
        }
    }
}