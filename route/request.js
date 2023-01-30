const express = require("express");
const util = require("util");
const router = express.Router();
const requestController = require("../controllers/requestController");
const { protectAuth } = require("../controllers/authController");
const { grantAccess } = require("../controllers/roleController");
const multer = require("multer");

router.use(protectAuth);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(new Error("Error in upload image"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.post("/upload", upload.single("requestFile"), function (req, res) {
  res.status(200).json("upload");
});

router
  .route("/")
  .get(
    grantAccess("readAny", "request"),
    requestController.getRequests
  );

router
  .route("/")
  .post(
    upload.single("requestFile"),
    requestController.createRequest
  );

router
  .route("/:id")
  .get(
    grantAccess("readAny", "request"),
    requestController.showRequest
  )
  .patch(
    grantAccess("updateAny", "request"),
    requestController.updateRequest
  )
  .delete(
    grantAccess("deleteAny", "request"),
    requestController.deleteRequest
  );

router.get(
  "/checkout-session/:productId",
  grantAccess("readAny", "request"),
  requestController.getCheckoutSession
);

router
  .route("/request-within/:distance/center/:latlng/unit/:unit")
  .get(
    grantAccess("readAny", "category"),
    requestController.geospatial
  );

module.exports = router;
