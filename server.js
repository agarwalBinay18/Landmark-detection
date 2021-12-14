const express = require("express");
const multer = require("multer");
const ImageUploadHelper = require("./helpers/helpers");
const imageUploadHelper = new ImageUploadHelper();
const vision = require('@google-cloud/vision');
const path = require('path');
const serviceKey = path.join(__dirname, './keys.json')
const fs = require('fs');


const client = new vision.ImageAnnotatorClient({keyFilename: serviceKey
});
const app = express();
const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.disable("x-powered-by");
app.use(multerMid.single("file"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/uploads", async (req, res, next) => {
  try {
    const myFile = req.file;
    const imageUrl = await imageUploadHelper.uploadImage(myFile);
    res.status(200).json({
      message: "Upload was successful",
      imageUrl,
    });
  } catch (error) {
    console.log("error===>", error);
    next(error);
  }
});


app.post("/detect", async (req, res, next) =>{
  try{
      const myFile = req.file;
      const imageUrl = await imageUploadHelper.uploadImage(myFile);
      const [result] = await client.landmarkDetection(imageUrl);
      const landmarks = result.landmarkAnnotations[0].description;
      console.log(landmarks);
      res.status(200).json({
      message: "Landmarks Detected successfully",landmarks});
      // Explicit content safeearch Detection
      // const [result] = await client.safeSearchDetection(imageUrl);
      // const detections = result.safeSearchAnnotation;
      // const adult = detections.adult;
      // const Medical = detections.medical;
      // const Spoof = detections.spoof;
      // const violence = detections.violence;
      // const Racy = detections.racy;
      
      // console.log(answer);
      // const detections = result.textAnnotations;
      // const [ text, ...others ] = detections
      // console.log(text.description)
      // res.send(`Text: ${ text.description }`)
      // const [result] = await client.safeSearchDetection(imageUrl);
      // const detections = result.safeSearchAnnotation;
      // console.log('Safe search:');
      // console.log(`Adult: ${detections.adult}`);
      // res.status(200).json({
      // message: "Detected successfully",adult,Medical,Spoof,violence,Racy});
}catch(error){
    console.log(error);
    next(error);
}

});


app.use((err, req, res, next) => {
  res.status(500).json({
    error: err,
    message: "Internal server error!",
  });
  next();
})

app.listen(9001, () => {
  console.log("app now listening for requests!!!");
});