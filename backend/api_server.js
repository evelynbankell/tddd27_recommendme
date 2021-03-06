/*
Evelyn Bankell, eveba996
Emil Edström, emied641
2020-04-26

REST APIS for course tddd27
Written in Nodejs with express

database stored in Google Cloud Platform
*/

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

//Request of js files
const group = require('./group');
const post = require('./chatPost');
const user = require('./user');
const recommendation = require('./recommendation');


//
// GROUOPS
//
//get all groups
app.get('/groups', async (req, res, next) => {
  try {
    let groups = await group.getGroups(datastore);
    console.log("GET /groups", groups);
    res.json(groups);
  } catch (error) {
    next(error);
    console.log(err);
    return res.sendStatus(400);
  }
});

//get one specific groups
app.get('/groups/:id', async (req, res, next) => {
  //console.log("GET /groups/:id ", req.params)
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
    console.log(err);
    return res.sendStatus(400);
  }
});

// insert new group
// Content-type: form-data
app.post('/groups', async (req, res, next) => {
  // upload image and move to GCP Storage
  let imageURL = '';
  try {
    if(req.files) {
        imageURL = req.files.imageURL;
        let unique_filename = uniqueFilename('') + path.extname(imageURL.name);
        imageURL.mv('./uploads/' + unique_filename);
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

//Update group
app.put('/groups/:id', async (req, res, next) => {
  console.log("PUT /groups/:id ", req.params.id);

  let imageURL = '';
  try {
    if(req.files) {
        imageURL = req.files.imageURL;
        let unique_filename = uniqueFilename('') + path.extname(imageURL.name);
        imageURL.mv('./uploads/' + unique_filename);
        imageURL = await uploadFile('./uploads/', unique_filename);
    }
  } catch (err) {
    res.status(500).send(err);
  }

  try {
    const id = req.params.id;
    let title = req.body.title;
    //data['imageURL']= imageURL;
    let key = await group.updateGroup(datastore, id, title, imageURL);
    console.log("PUT /groups/:id ", key);
    if (key)
      res.json(key);
    else
      return res.sendStatus(404);
  } catch (error) {
    next(error);
    res.status(400).send(error);
  }
});


//delete group
app.delete('/groups/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    let groups = await group.deleteGroup(datastore, id);
    console.log("DELETE /group/:id", groups);

    res.json(groups);
  } catch (error) {
    next(error);
  }
});


//
// RECOMMENDATIONS
//
// get recommendations for a group
app.get('/groups/:id/recommendations', async (req, res, next) => {
  try {
    const id = req.params.id;

    let recommendations = await recommendation.getRecommendations(datastore, id);
    console.log("GET /group/:id/recommendations", recommendations);

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

// post a recommendation in a group
app.post('/groups/:id/recommendations', async (req, res, next) => {
  let imageURL = '';
  console.log('files', req.files);
  try {
    if(req.files) {
        imageURL = req.files.imageUrl;
        let unique_filename = uniqueFilename('') + path.extname(imageURL.name);
        imageURL.mv('./uploads/' + unique_filename);
        imageURL = await uploadFile('./uploads/', unique_filename);
    }
  } catch (err) {
      console.log(err);
      return res.sendStatus(500);
  }
  try {
    console.log('img', imageURL);
    let data = req.body;
    const id = req.params.id;
    data['imageUrl']= imageURL;
    let key = await recommendation.addRecommendation(datastore, id, data);
    console.log("POST /groups/:id/recommendations", key);
    res.json(`{id: ${key.id}}`);
  } catch (error) {
    next(error);
    console.log(error);
    return res.sendStatus(400);
  }

});

//delete recommendation
app.delete('/groups/:groupId/recommendations/:recommendationId', async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const recommendationId = req.params.recommendationId;

    let recommendations = await recommendation.deleteRecommendation(datastore, groupId, recommendationId);
    console.log("DELETE /groups/:groupId/recommendations/:recommendationId", recommendations);

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});



//
// USERS
//
// get all users
app.get('/users', async (req, res, next) => {
  try {
    let users = await user.getUsers(datastore);
    console.log("GET /users", users);

    res.json(users);
  } catch (error) {
    next(error);
    res.status(400).send(error);
  }
});

// get a user
app.get('/users/:email', async (req, res, next) => {
  console.log("GET /users/:email ", req.params.email)
  try {
    const email = req.params.email;
    let users = await user.getUser(datastore, email);
    console.log("GET /users/:email ", users);
    if (users)
      res.json(users);
    else
      return res.sendStatus(404);
  } catch (error) {
    next(error);
    res.status(400).send(error);
  }
});

app.put('/users/:email', async (req, res, next) => {
  console.log("PUT /users/:email ", req.params.email)
  try {
    const email = req.params.email;
    let active = req.body.active;
    let imageURL = req.body.imageURL;
    let key = await user.updateUser(datastore, email, active, imageURL);
    console.log("PUT /users/:email ", key);
    if (key)
      res.json(key);
    else
      return res.sendStatus(404);
  } catch (error) {
    next(error);
    res.status(400).send(error);
  }
});


//add a user
app.post('/users', async (req, res, next) => {
  try {
    let data = req.body;
    let key = await user.addUser(datastore, data);
    console.log("POST /users", key);
    res.json(`{id: ${key.id}}`);
  }
  catch(error) {
    next(error);
  }
});

//
// REST API chatPost
//
// get al posts in a group
app.get('/groups/:id/chatposts', async (req, res, next) => {
  try {
    const id = req.params.id;

    let chatPosts = await post.getChatPosts(datastore, id);
    console.log("GET /groups/:id/chatposts", chatPosts);

    res.json(chatPosts);
  } catch (error) {
    next(error);
  }
});

// inser new post in a group
app.post('/groups/:id/chatpost', async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let key = await post.insertChatPost(datastore, id, data);
    console.log("POST /groups/:id/chatpost", key, data);

    res.json(key); //`{key: ${key}}`
  } catch (error) {
    next(error);
    res.status(400).send(error);
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

/*
 * manage Socket.io
 */

io.on('connection', socket => {
  socket.on('NewPost', id => {
    console.log('a new post in group: ', id);
    socket.broadcast.emit('NewPost', id);
  });
  socket.on('NewRecommendation', id => {
    console.log('a new rec in group: ', id);
    socket.broadcast.emit('NewRecommendation', id);
  });
  socket.on('NewGroup', id => {
    console.log('new group: ', id);
    socket.broadcast.emit('NewGroup', id);
  });
  socket.on('UpdateGroup', id => {
    console.log('update group: ', id);
    socket.broadcast.emit('UpdateGroup', id);
  });
  socket.on('DeleteGroup', id => {
    console.log('delete group: ', id);
    socket.broadcast.emit('DeleteGroup', id);
  });
  socket.on('DeleteRecommendation', id => {
    console.log('delete recommendation: ', id);
    socket.broadcast.emit('DeleteRecomendation', id);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});




//module.exports = app;
