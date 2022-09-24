const express = require('express')
const kdtree = require("./kdtree.js")  
const app = express()
const port = 3001
const fs = require("fs")
const path = require("path")
const cv = require('opencv4nodejs')  

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

const createImageFeatures = function(image) {
  // # redimensionar imagenes
  mat = image.resize(32, 32);
  // # convertir en un solo array
  let pixel_list = mat.getdataasarray().flat().flat();
}

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname}); 
  console.log("Reading all images");
  let image_paths = getAllFiles("D://Bibliotecas//Descargas//train32")
  let raw_images = []
  let labels = []

  image_paths.forEach(function(image_path) {
    
    let image = cv.imread(image_path);
    let label = image_path.split('\\')[4];
    let pixels = createImageFeatures(image)
    raw_images.push(pixels);
    labels.push(label);
  });

  let image = cv.imread("D://Bibliotecas//Descargas//cosko.jpeg")
  let busq = createImageFeatures(image)  

  console.log("Datos Cargados");
  var root = kdtree.build_kdtree( raw_images, labels ) ;

  // console.log("Ejecutando closest_point");
  // best1 = kdtree.closest_point(root, busq); 
  // console.log('BEST:');
  // console.log(best1);

  console.log('MEJORES K COINCIDENCIAS:')
  bests = kdtree.KNN(raw_images, labels, 5, busq);  
  console.log(bests);
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})