const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const User = require('../models/user');
const Product = require('../models/product');

const fs = require('fs');
const path = require('path');

app.use(fileUpload({useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res){

    let tipo = req.params.tipo;
    let id = req.params.id;


    if(!req.files){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'No se subió ningún archivo'
            }
        })  
    }

    let tiposValidos = ['products', 'users'];
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'Tipo no permitido'
            }
        })
    }

    let archivo = req.files.archivo;
    let nombreArchivoCortado = archivo.name.split('.');
    let extension = nombreArchivoCortado[nombreArchivoCortado.length -1];

    

    let extensionesValidas=['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'Extención no permitida'
            }
        })
    }

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`; 

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(tipo === 'users'){
            imagenUsuario(id,res, nombreArchivo);
        }
        if(tipo ==='products'){
            imagenProducto(id,res, nombreArchivo);
        }
       
    });
    
})

function imagenUsuario(id,res, nombreArchivo){
User.findById(id,(err, usuarioDB)=>{
    if (err){
        borraArchivo(nombreArchivo,'users')
        return res.status(500).json({
            ok: false,
            err
        });
    }
    if(!usuarioDB){
        borraArchivo(nombreArchivo,'users')
        return res.status(400).json({
            ok: false,
            err: {
                message:"Usuario no existe"
            }
        });
    }

    borraArchivo(usuarioDB.img,'users')

    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioGuardado)=>{
    res.json({
        ok:true,
        usuario: usuarioGuardado,
        img: nombreArchivo
})

    });

})
}

function imagenProducto(id,res, nombreArchivo){
    Product.findById(id,(err, productoDB)=>{
        if (err){
            borraArchivo(nombreArchivo,'products')
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            borraArchivo(nombreArchivo,'products')
            return res.status(400).json({
                ok: false,
                err: {
                    message:"Producto no existe"
                }
            });
        }
    
        borraArchivo(productoDB.img,'products')
    
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado)=>{
        res.json({
            ok:true,
            producto: productoGuardado,
            img: nombreArchivo
    })
    
        });
    
    })

}

function borraArchivo(nombreImagen, tipo){
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImagen}`)
    if(fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;