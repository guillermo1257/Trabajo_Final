const express = require('express')
const kdtree = require("./kdtree.js")  
const app = express()
const port = 3001
const fs = require("fs")
const path = require("path")
const cv = require('opencv4nodejs')  

//Para instalar opencv4nodejs:
//https://www.npmjs.com/package/opencv4nodejs
//npm install --global windows-build-tools
//npm install --save opencv4nodejs
// si no funciona npm install --global windows-build-tools:
// Desinstalar otras versiones de python, o instalar 2.7.17 y modificar el path, visual studio 2017 para compilar

const Jimp = require('jimp');

const getAllFiles = function(dirPath, arrayOfFiles){
    files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []

    files.forEach(function(file){
        if(fs.statSync(dirPath + "/" + file).isDirectory()){
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        }else{
            arrayOfFiles.push(path.join(dirPath, "/", file))
        }
    })
    return arrayOfFiles
}