const multer = require("multer");

const upload = (req, res, next) => {
  try {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "uploads/");
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      },
    });
    multer({ storage: storage });
    next();
  } catch (err) {
    res.status(400).send({ Error: "somthing gooing wrong" });
  }
};

module.exports = upload;
