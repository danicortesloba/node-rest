const express = require('express')
const { verificaToken, verificaAdminRole} = require('../middleware/authentication')
let app = express();
let Category = require('../models/category')

app.get('/category', verificaToken,(req, res) =>{
    Category.find({})
    .sort('nombre')
    .populate('user', 'nombre email')
    .exec((err, categories) =>{
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok:true,
            categories
        })
    })
})

app.get('/category/:id', verificaToken,(req,res) => {
    let id = req.params.id
    Category.findById(id, (err, categoriaDB) =>{
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }
    
        res.json({
            ok:true,
            categoriaDB
        })
    })
    
});


app.post('/category', verificaToken, function (req, res) {
    let body = req.body;
    let category = new Category({
        nombre: body.nombre,
        user: req.usuario._id
    });

    category.save((err,categoriaDB) => {
      if(err) {
          return res.status(500).json({
              ok: false,
              err
          });
      }
      if(!categoriaDB) {
        return res.status(400).json({
            ok: false,
            err
        });
    }

      res.json({
          ok: true,
          category: categoriaDB
      })

    });
    
  });

  app.put('/category/:id', verificaToken, (req,res) => {
      let id = req.params.id;
      let body = req.body;
      let nameCategory = {
          nombre: body.nombre
      }
      Category.findByIdAndUpdate(id, nameCategory, {new:true, runValidators: true}, (err, categoriaDB) =>{
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!categoriaDB) {
          return res.status(400).json({
              ok: false,
              err
          });
      }
  
        res.json({
            ok: true,
            category: categoriaDB
        })
        
      });
  })

  app.delete('/category/:id', [verificaToken, verificaAdminRole], (req, res) => {
      let id = req.params.id;
      Category.findByIdAndRemove(id, (err, categoriaDB) =>{
        if(err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error 500'
                }
            });
        }
        if(!categoriaDB) {
          return res.status(400).json({
              ok: false,
              err: {
                  message: 'El id no existe'
              }
          });
      }

      res.json({
          ok: true,
          message: 'categoría borrada'
      })

      })
  })

module.exports = app;