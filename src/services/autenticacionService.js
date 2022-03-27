const { signInWithEmailAndPassword, signOut } = require("firebase/auth");

module.exports = (auth, clientAuth) => {
    // Creating session cookie
    async function iniciarSesion(email, password, res) {
        try {
            if (clientAuth.currentUser) {
                signOut(clientAuth);
            }
            const { user } = await signInWithEmailAndPassword(clientAuth, email, password);
            const idToken = await user.getIdToken();
            const userRecord = await auth.getUserByEmail(email);
            const data = {
                idToken: idToken,
                uid: userRecord.uid,
                email: userRecord.email,
                rol: userRecord.customClaims ? userRecord.customClaims.rol : null,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
            };
            res.status(200).send(data);
        } catch (err) {
            console.log(err);
            res.status(401).send(err);
        }
    }

    return {
        sessionLogin: (req, res, next) => {
            /* 
            const idToken = req.body.idToken.toString();
            const expiresIn = 60 * 60 * 8 * 1000;
            admin
                .auth().createSessionCookie(idToken, { expiresIn })
                .then(
                (sessionCookie) => {
                    const options = { maxAge: expiresIn, httpOnly: true };
                    res.cookie("session", sessionCookie, options);
                    res.end(JSON.stringify({ status: "Success" }));
                },
                (error) => {
                    res.status(401).send("UNAUTHORIZED REQUEST!");
                }
            ); 
            */
            let email = req.body.email.toString();
            let password = req.body.password.toString();
            iniciarSesion(email, password, res);
        },
        sessionLogout: (req, res, next) => {
            res.clearCookie("session");
            //res.redirect("/");
        },
        cambiarContrasena: (req, res, next) => {
            auth.getUser(req.body.uid) // obtener el email del usuario
                .then(userRecord => {
                    signInWithEmailAndPassword(clientAuth, userRecord.email, req.body.contrasenaActual) // iniciar sesion para ver si la contraseña actual es correcta
                        .then(() => {
                            auth.updateUser(req.body.uid, { // actualizar la contraseña
                                    password: req.body.contrasenaNueva,
                                })
                                .then(() => {
                                    res.status(200).send("Contraseña actualizada exitosamente");
                                }).catch(error => {
                                    console.log(error);
                                    res.status(401).send({
                                        message: error.code,
                                    });
                                });
                        }).catch(error => {
                            console.log(error);
                            res.status(401).send({
                                message: error.code,
                            });
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(401).send({
                        message: error.code,
                    });
                });
        },
        // recuperarContrasena: (req, res, next) => {
        //     const actionCodeSettings = {
        //         url: 'https://multapp-front.herokuapp.com/'
        //     };
        //     firebase.auth().sendPasswordResetEmail(req.body.email, actionCodeSettings)
        //         .then(() => {
        //             console.log('E-mail enviado');
        //             res.send('E-mail enviado');
        //         }).catch(error => {
        //             console.log(error);
        //             res.json(error);
        //         });
        // }
    }
}