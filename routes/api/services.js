const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bodYParser = require('body-parser');
const multer = require('multer');
const keys = require('../../config/key');
//import model
const User = require('../../models/User');
const Service = require('../../models/Services');
const fs = require('fs');

const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: keys.CLOUD_NAME,
  api_key: keys.API_KEY,
  api_secret: keys.API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    console.log(file);
    const now = new Date().toISOString();
    const date = now.replace(/:/g, '-');
    cb(null, date + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  //dest:'uploads/',
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpeg'
    ) {
      console.log('uploading...')
      cb(null, true);
    } else {
      console.log('error')
      cb(new Error('file not supported'), false);
    }
  },
});

const deleteFile = file => {
  fs.unlink('./uploads/' + file, function (err) {
    if (err && err.code == 'ENOENT') {
      // file doens't exist
      console.info("File doesn't exist, won't remove it.");
    } else if (err) {
      // other errors, e.g. maybe we don't have enough permission
      console.error('Error occurred while trying to remove file');
    } else {
      console.info(`removed`);
    }
  });
};



router.post(
  '/postService',

  upload.single('thumbnail'),
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    console.log('yeah!!!!!!!')

    if (req.user.email === 'dhanmoninath@gmail.com') {
      console.log('uploading.......')
      const result = await cloudinary.uploader.upload(req.file.path);
      const newService = new Service({
        title: req.body.title,
        short_description: req.body.short_description,
        about: req.body.about,
        thumbnail: result.secure_url,
      });
      newService
        .save()
        .then(service => {
          console.log(service);
          res.status(200).json(service);
        })
        .catch(err => console.log(err))

      if (result.secure_url) {
        deleteFile(req.file.filename);
        console.log('deleting');
      }
    } else {
      return res.status(401).json({ msg: 'SOmething went wrong' })
    }



  }
);

//Update service 

router.post(
  '/updateService/:id',

  upload.single('thumbnail'),
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    console.log('updating...')

    if (req.user.email === 'dhanmoninath@gmail.com') {

      const result = await cloudinary.uploader.upload(req.file.path);
      const newService = {
        title: req.body.title,
        short_description: req.body.short_description,
        about: req.body.about,
        thumbnail: result.secure_url,
      };
      Service.findById({ _id: req.params.id }).then(service => {
        Service.findOneAndUpdate(
          { _id: req.params.id },
          { $set: newService },
          { new: true }
        ).then(service => res.json(service))
      })


        .catch(err => console.log(err))

      if (result.secure_url) {
        deleteFile(req.file.filename);
        console.log('deleting');
      }
    } else {
      return res.status(401).json({ msg: 'SOmething went wrong' })
    }



  }
);


// router.post(
//   '/postService',
//   upload.single('thumbnail'),
//   passport.authenticate('jwt', { session: false }),
//   async (req, res) => {
//     console.log('yeah!!!!!!!')
//     User.findOne({ email: 'dhanmoninath@gmail.com' }).then(async user => {
//       if (!user) {
//         return res.status(401).json({ error: 'You are not the admin!' });
//       }
//       console.log('uploading.......')
//       const result = await cloudinary.uploader.upload(req.file.path);
//       const newService = new Service({
//         title: req.body.title,
//         short_description: req.body.short_description,
//         about: req.body.about,
//         thumbnail: result.secure_url,
//       });
//       newService
//         .save()
//         .then(service => {
//           console.log(service);
//           res.status(200).json(service);
//         })
//         .catch(err => console.log(err))
//         .catch(err => {
//           console.log(err);
//           res.status(401).json({
//             message: 'Something went wrong!',
//           });
//         });
//       if (result.secure_url) {
//         deleteFile(req.file.filename);
//         console.log('deleting');
//       }
//     });
//   }
// );

router.get('/allServices', (req, res) => {

  Service.find()
    .sort({ date: -1 })
    .then(allservices => {
      res.status(200).json(allservices)
    })
    .catch(err =>
      res.status(404).json({ noServiceFound: 'No service found' })
    );
});

router.get('/allServices/:id', (req, res) => {
  Service.findById(req.params.id)
    .then(services => res.status(200).json(services))
    .catch(err =>
      res.status(404).json({ noServiceFound: 'No service found' })
    );
});

router.delete('/allServices/:id', (req, res) => {
  Service.findById(req.params.id)
    .then(service => {
      service.remove().then(() => res.json({ success: true }));
    })
    .catch(err =>
      res.status(404).json({ noServiceFound: 'No service found' })
    );
});

module.exports = router;
