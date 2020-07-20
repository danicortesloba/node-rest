const express = require('express');
const {verificaToken} = require('../middleware/authentication');
let app = express(); 
let Product = require('../models/product');

app.get('/product', verificaToken, (req,res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Product.find({disponible:true})
    .skip(desde)
    .limit(limite)
    .populate('category', 'nombre')
    .populate('user', 'nombre email')
    .exec((err, products) =>{
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok:true,
            products
        })
    })
})

//obtener un producto por id, populate usuario y categoria
app.get('/product/:id', verificaToken, (req,res) => {
    let id = req.params.id
    Product.findById(id)
            .populate('user', 'nombre email')
            .populate('category', 'nombre')
            .exec ((err, productoDB) =>{
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }
    
        res.json({
            ok:true,
            productoDB
        })
    })

})

app.get('product/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Product.find({nombre: regex})
        .populate('category', 'nombre')
        .exec( (err, productos) => {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok:true,
                productos
            })
        })

})


app.post('/product', verificaToken, (req, res) => {
    let body = req.body;
    let product = new Product({
        nombre: body.nombre,
        precioUni: body.precioUni,
        category: body.category,
        user: req.usuario._id
    });

    product.save((err,productoDB) => {
      if(err) {
          return res.status(500).json({
              ok: false,
              err
          });
      }
      if(!productoDB) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se guardó'
            }
        });
    }

      res.json({
          ok: true,
          productoDB
      })

    });

})

app.put('/product/:id', verificaToken, (req,res) => {
    let id = req.params.id;
    let body = req.body;
   
    Product.findById(id, (err, productoDB) =>{
      if(err) {
          return res.status(500).json({
              ok: false,
              err
          });
      }
      if(!productoDB) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El producto no existe'
            }
        });
    }

      productoDB.nombre = body.nombre;
      productoDB.precioUni = body.precioUni;
      productoDB.category = body.category;
      productoDB.disponible = body.disponible;
      productoDB.descripcion = body.descripcion;

      productoDB.save((err, productoGuardado) =>{
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            productoGuardado
        })
      })
      
    });

})

//borrar producto. cambiar a no disponible. 
app.delete('/product/:id', (req,res) => {
    let id = req.params.id;
    let body = req.body;
    let cambiaEstado = {
        disponible: false
      }
    Product.findByIdAndUpdate(id, cambiaEstado, {new:true, runValidators: true}, (err, productoDB) =>{
      if(err) {
          return res.status(500).json({
              ok: false,
              err
          });
      }
      if(!productoDB) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El producto no existe'
            }
        });
    }

      res.json({
          ok: true,
          category: productoDB
      })
      
    });

})

module.exports = app;