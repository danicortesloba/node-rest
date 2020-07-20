const express = require('express')
const app = express()
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('504816006944-2cc09e3r64c2884d5l06kga3ugkveh5d.apps.googleusercontent.com');

app.post('/login', (req, res) => {
    let body = req.body;
    User.findOne({email: body.email}, (err, userDB)=> {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!userDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        if(!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: userDB
        }, 'secret', {expiresIn: 60 * 60 * 24 * 30});

        res.json({
            ok:true,
            usuario: userDB,
            token
        });

    })
});


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '504816006944-2cc09e3r64c2884d5l06kga3ugkveh5d.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}
    
 

app.post('/google', async (req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
                    .catch(e => {
                        return res.status(403).json({
                            ok: false,
                            err: e
                        })
                    })

    User.findOne({email: googleUser.email}, (err, usuarioDB) =>{
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if(usuarioDB) {
            if (usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                }); 
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, 'secret', {expiresIn: 60 * 60 * 24 * 30});
            
                return res.json({
                    ok:true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            let usuario = new User();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save( (err, usuarioDB) => {
                if(err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                let token = jwt.sign({
                    usuario: usuarioDB
                }, 'secret', {expiresIn: 60 * 60 * 24 * 30});
            
                return res.json({
                    ok:true,
                    usuario: usuarioDB,
                    token
                })

            })
        }
    })
    
});

module.exports = app;