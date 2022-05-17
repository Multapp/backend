module.exports = (db, auth) => {
    return {
        getPerfil: async (req, res) => {
            try {
                const [userRecord, snapshot] = await Promise.all([
                    auth.getUser(req.query.uid),
                    db.collection("usuarios").doc(req.query.uid).get()
                ]);
                const response = {
                    id: userRecord.uid,
                    datos: null,
                    foto: userRecord.photoURL,
                    datos: {
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
                        ...(snapshot.data().patentes && {patentes: snapshot.data().patentes})
                    }
                };
                res.send(response);
            } catch (err) {
                console.log(err);
                res.status(500).send({
                    message: err.code,
                });
            }
        }
    }
}