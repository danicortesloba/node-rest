const express = require('express')
const app = express()
const User = require('../models/user');
const bcrypt = require('bcrypt');
const _=require('underscore');
const { verificaToken, verificaAdminRole} = require('../middleware/authentication')


app.get('/user/:id', verificaToken, (req,res) => {
  let id = req.params.id
  User.findById(id)
          .exec ((err, userDB) =>{
      if(err) {
          return res.status(500).json({
              ok: false,
              err
          });
      }

      if(!userDB) {
          return res.status(400).json({
              ok: false,
              err: {
                  message: 'El id no existe'
              }
          });
      }
  
      res.json({
          ok:true,
          userDB
      })
  })

})

app.get('/user', verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  let limite = req.query.limite || 5;
  limite = Number(limite);

    User.find({state:true}, 'nombre email role state google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
          if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        User.count({state:true}, (err, conteo)=> {
          res.json({
            ok:true,
            usuarios,
            cuantos: conteo
          });
        })
        

        })
  });
   
  app.post('/user', [verificaToken, verificaAdminRole], function (req, res) {
      let body = req.body;
      let usuario = new User({
          nombre: body.nombre,
          email: body.email,
          password: bcrypt.hashSync( body.password,10),
          role: body.role
      });

      usuario.save((err,usuarioDB) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })

      });
      
    });
  
    app.put('/user/:id', [verificaToken, verificaAdminRole], function (req, res) {
      let id = req.params.id;
      let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'state']);
      User.findByIdAndUpdate(id, body, {new:true, runValidators: true}, (err,usuarioDB) => {
        if(err) {
          return res.status(400).json({
              ok: false,
              err
          });
      }

        res.json({
          ok: true,
          usuario: usuarioDB
        });

      })
     
    });
  
    app.delete('/user/:id', [verificaToken, verificaAdminRole], function (req, res) {
      let id = req.params.id;
      let cambiaEstado = {
        state: false
      }
      //User.findByIdAndRemove(id, (err, usuarioDB)=> {
        User.findByIdAndUpdate(id, cambiaEstado, {new:true}, (err, usuarioDB)=> {
        if(err) {
          return res.status(400).json({
              ok: false,
              err
          });
      }

      if(!usuarioDB) {
        return res.status(400).json({
            ok: false,
            err: {
              message: 'Usuario no encontrado'
            }
        });
    }


      res.json({
        ok: true,
        usuario: usuarioDB
      });
      });
    });

    module.exports = app;