const { doc, setDoc } = require('firebase/firestore');

module.exports = (db, auth) => {
    return {
        getInfracciones: function(_req, res) {
            db.collection("infracciones").get()
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
                    res.status(500).send("Error al obtener datos de infracciones");
                });
        },
        addInfraccion: function(req, res) {
            db.collection("infracciones").add({
                ley: req.body.ley,
                codigo: req.body.codigo,
                articulo: req.body.articulo,
                inciso: req.body.inciso,
                vigencianIcio: req.body.vigenciaInicio,
                vigenciaFin: req.body.vigenciaFin,
                unidadesFijasMin: req.body.unidadesFijasMin,
                unidadesFijasMax: req.body.unidadesFijasMax,
                extracto: req.body.extracto || []
            }).then(() => {
                res.status(201).send("Infracción Ley: " + req.body.ley + " - Art. " + req.body.articulo + " - Inciso " + req.body.inciso  + "Extracto: " + req.body.extracto + " creada correctamente");
            }).catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
        },
        editInfraccion: async function(req, res) {
            try {
                await db.collection('infracciones').doc(req.body.id).update(req.body.data);
                res.status(201).send("Infracción " + req.body.marca + " actualizado correctamente");
            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
        },
        deleteInfraccion: function(req, res) {
            db.collection("infracciones").doc(req.query.id).delete()
            .then(() => {
                res.status(200).send("Infracción " + req.query.id + " eliminado correctamente");
            }).catch(error => {
                console.log(error);
                res.status(500).send(error);
            });
        }
    }
}