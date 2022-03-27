module.exports = (db, auth) => {
    return {
        getPerfil: async (req, res) => {
            try {
                const userRecord = await auth.getUser(req.query.uid);
                const response = {
                    id: userRecord.uid,
                    datos: null,
                    foto: userRecord.photoURL,
                };
                const snapshot = await db.collection("usuarios").doc(userRecord.uid).get();
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
            } catch (err) {
                console.log(err);
                res.status(500).send({
                    message: err.code,
                });
            }
        }
    }
}