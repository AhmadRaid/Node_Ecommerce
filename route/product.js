const express = require("express");
const util = require("util");
const router = express.Router();
const productController = require("../controllers/productController");
const { protectAuth } = require("../controllers/authController");
const { grantAccess } = require("../controllers/roleController");
const multer = require("multer");

router.use(protectAuth);

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

router 
  .route("/")
  .get(
    grantAccess("readAny", "product"),
    productController.getProducts
  );

router
  .route("/")
  .post(
    grantAccess("createAny", "product"),
    uploadProductImages,
    productController.resizeSaveProductImages,
    productController.createProduct
  );

router
  .route("/:id")
  .get(
    grantAccess("readAny", "product"),
    productController.showProduct
  )
  .patch(
    grantAccess("updateAny", "product"),
    productController.updateProduct
  )
  .delete(
    grantAccess("deleteAny", "product"),
    productController.deleteProduct
  );

module.exports = router;
