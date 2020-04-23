'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');

const app = express();
app.enable('trust proxy');

app.use(logger('dev'));
app.use(express.static('public'));

// enable files upload
const fileUpload = require('express-fileupload');
app.use(fileUpload({
  createParentPath: true
}));
var uniqueFilename = require('unique-filename')
//npm install express-fileupload
//npm i unique-filename

app.use(cors());
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
const server = app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

const io = require('socket.io').listen(server);

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine

// Instantiate a datastore client
const {Datastore} = require('@google-cloud/datastore');
const {Storage} = require('@google-cloud/storage');

const projectId = 'tddd27-recommendme';
const keyFilename = './tddd27-recommendme-4b343424751c.json';
const datastore = new Datastore({projectId, keyFilename});
const storage = new Storage({projectId, keyFilename});

const photo_bucket = 'tddd27-recommendme-photos';


const group = require('./group');


//module.exports = {
//    datastore: datastore
//}


app.get('/groups', async (req, res, next) => {
  try {
    let groups = await group.getGroups(datastore);
    console.log("GET /groups", groups);
    res.json(groups);
  } catch (error) {
    next(error);
    res.status(400).send(error);
  }
});

app.get('/groups/:id', async (req, res, next) => {
  console.log("GET /groups/:id ", req.params)
  try {
    const id = req.params.id;
    let groups = await group.getGroup(datastore, id);
    console.log("GET /groups/:id ", groups);
    if (groups == null)
      res.status(404).send({});
    else
      res.json(groups);
  } catch (error) {
    next(error);
    res.status(400).send(error);
  }
});

// Content-type: form-data
app.post('/groups', async (req, res, next) => {
  // upload image and move to GCP Storage

  // TODO: add a default image here
  let imageURL = '';
  try {
    if(req.files) {
        let groupPhoto = req.files.groupPhoto;
        let unique_filename = uniqueFilename('') + path.extname(groupPhoto.name);
        groupPhoto.mv('./uploads/' + unique_filename);
        imageURL = await uploadFile('./uploads/', unique_filename);
    }
  } catch (err) {
      res.status(500).send(err);
  }

  // insert group into GCP DataStore
  try {
    let data = req.body;
    data['imageURL']= imageURL;
    let key = await group.addGroup(datastore, data);
    console.log("POST /groups", key);
    res.json(`{id: ${key.id}}`);
  }
  catch(error) {
    next(error);
  }
});


// Uploads a local file to the bucket
async function uploadFile(filepath, filename) {

  let bucket_item = await storage.bucket(photo_bucket).upload(filepath + filename, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: 'public, max-age=31536000',
    },
  });
  //await storage.bucket(photo_bucket).file(filename).makePublic();

  return 'https://storage.cloud.google.com/' + photo_bucket + '/' + filename;
}











//module.exports = app;