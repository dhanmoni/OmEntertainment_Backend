const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const bodYParser = require("body-parser");
const multer = require("multer");
const keys = require("../../config/key");
//import model
const User = require("../../models/User");
const Service = require("../../models/Services");
const fs = require("fs");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: keys.CLOUD_NAME,
  api_key: keys.API_KEY,
  api_secret: keys.API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    console.log(file);
    const now = new Date().toISOString();
    const date = now.replace(/:/g, "-");
    cb(null, date + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  //dest:'uploads/',
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpeg"
    ) {
      console.log("uploading...");
      cb(null, true);
    } else {
      console.log("error");
      cb(new Error("file not supported"), false);
    }
  },
});

const deleteFile = (file) => {
  fs.unlink("./uploads/" + file, function (err) {
    if (err && err.code == "ENOENT") {
      // file doens't exist
      console.info("File doesn't exist, won't remove it.");
    } else if (err) {
      // other errors, e.g. maybe we don't have enough permission
      console.error("Error occurred while trying to remove file");
    } else {
      console.info(`removed`);
    }
  });
};

router.post(
  "/postService",

  upload.single("thumbnail"),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("yeah!!!!!!!");

    if (req.user.email === "dhanmoninath@gmail.com") {
      console.log("uploading.......");
      const result = await cloudinary.uploader.upload(req.file.path);
      const newService = new Service({
        title: req.body.title,
        short_description: req.body.short_description,
        about: req.body.about,
        thumbnail: result.secure_url,
        banner: "",
        public: false,
      });
      newService
        .save()
        .then((service) => {
          console.log(service);
          res.status(200).json(service);
        })
        .catch((err) => console.log(err));

      if (result.secure_url) {
        deleteFile(req.file.filename);
        console.log("deleting");
      }
    } else {
      return res.status(401).json({ msg: "SOmething went wrong" });
    }
  }
);

//Update service

router.post(
  "/updateService/:id",

  upload.single("thumbnail"),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("updating...", req.params.id);

    if (req.user.email === "dhanmoninath@gmail.com") {
      const result = await cloudinary.uploader.upload(req.file.path);

      Service.findById({ _id: req.params.id })
        .then((service) => {
          Service.findOneAndUpdate(
            { _id: req.params.id },
            {
              $set: {
                title: req.body.title,
                short_description: req.body.short_description,
                about: req.body.about,
                thumbnail: result.secure_url,
              },
            },
            { new: true }
          ).then((service) => {
            console.log("service===", service);
            res.json(service);
          });
        })

        .catch((err) => console.log(err));

      if (result.secure_url) {
        deleteFile(req.file.filename);
        console.log("deleting");
      }
    } else {
      return res.status(401).json({ msg: "SOmething went wrong" });
    }
  }
);

//add / edit about
router.post(
  "/updateServiceAbout/:id",

  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("updating...", req.body);

    if (req.user.email === "dhanmoninath@gmail.com") {
      Service.findById({ _id: req.params.id })
        .then((service) => {
          Service.findOneAndUpdate(
            { _id: req.params.id },
            {
              $set: {
                about: req.body.about,
              },
            },
            { new: true }
          ).then((service) => {
            console.log("service===", service);
            res.json(service);
          });
        })
        .catch((err) => console.log(err));
    } else {
      return res.status(401).json({ msg: "SOmething went wrong" });
    }
  }
);

//Chnage visibility

router.post(
  "/changeVisibility/:id",

  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.email === "dhanmoninath@gmail.com") {
      Service.findById({ _id: req.params.id })
        .then((service) => {
          if (service.public === false) {
            Service.findOneAndUpdate(
              { _id: req.params.id },
              { $set: { public: true } },
              { new: true }
            ).then((service) => res.json(service));
          } else {
            Service.findOneAndUpdate(
              { _id: req.params.id },
              { $set: { public: false } },
              { new: true }
            ).then((service) => res.json(service));
          }
        })
        .catch((err) => console.log(err));
    } else {
      return res.status(401).json({ msg: "SOmething went wrong" });
    }
  }
);

router.post(
  "/updateServiceBanner/:id",
  upload.single("banner"),

  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.email === "dhanmoninath@gmail.com") {
      console.log("req file is ", req.file);
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log("result==", result);

      Service.findById({ _id: req.params.id })
        .then((service) => {
          Service.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { banner: result.secure_url } },
            { new: true }
          ).then((service) => res.json(service));
        })

        .catch((err) => console.log(err));

      if (result.secure_url) {
        deleteFile(req.file.filename);
        console.log("deleting");
      }
    } else {
      return res.status(401).json({ msg: "SOmething went wrong" });
    }
  }
);

//upload images for service slideshow

router.post(
  "/serviceMediaPhotos/:id",

  upload.array("photos"),
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.files) {
      let result = [];
      for (let i = 0; i < req.files.length; i++) {
        await result.push(await cloudinary.uploader.upload(req.files[i].path));
      }

      let finalPhotos = [];
      await result.map((photo) => {
        finalPhotos.push(photo.secure_url);
      });
      Service.findById({ _id: req.params.id })
        .then((service) => {
          Service.findOneAndUpdate(
            { _id: req.params.id },
            {
              $set: {
                mediaPhoto: finalPhotos,
              },
            },
            { new: true }
          ).then((service) => {
            res.json(service);
          });
        })

        .catch((err) => console.log(err));
    } else {
      return res.status(401).json({ msg: "SOmething went wrong" });
    }
  }
);

router.get("/allServices", (req, res) => {
  Service.find()
    .sort({ date: -1 })
    .then((allservices) => {
      res.status(200).json(allservices);
    })
    .catch((err) =>
      res.status(404).json({ noServiceFound: "No service found" })
    );
});

router.get("/allServices/:id", (req, res) => {
  Service.findById(req.params.id)
    .then((services) => {
      res.status(200).json(services);
    })
    .catch((err) =>
      res.status(404).json({ noServiceFound: "No service found" })
    );
});

router.delete("/allServices/:id", (req, res) => {
  Service.findById(req.params.id)
    .then((service) => {
      service.remove().then(() => res.json({ success: true }));
    })
    .catch((err) =>
      res.status(404).json({ noServiceFound: "No service found" })
    );
});

//Send Emails

router.post("/sendEmail", async (req, res) => {
  auth = {
    auth: {
      api_key: "823230a921388f9aa98ecc6c51e635db-4a62b8e8-e712365d",
      domain: "sandboxf7c9e419d357459ab5aecec01e88fe36.mailgun.org",
    },
  };
  const nodemailerMailgun = nodemailer.createTransport(mg(auth));
  const mailOpts = {
    from: "dhanmoninath989@gmail.com",
    to: "dhanmoninath989@gmail.com",
    subject: "New Service Request !",
    html: `<h4>Email From:</h4>
                      <p>Name: ${req.body.name}</p>
                      <p>Email: ${req.body.email}</p>
                      <p>Contact: ${req.body.phone}</p>
                      <p>Location: ${req.body.location}</p>
                      <h4>Message: </h4>
                      <p>${req.body.message}</p>
              `,
  };
  nodemailerMailgun.sendMail(mailOpts, function (err, info) {
    if (err) {
      console.log("something wrong happend!", err);
    } else {
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  });
});

module.exports = router;
