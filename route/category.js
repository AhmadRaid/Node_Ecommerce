const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protectAuth } = require("../controllers/authController");
const { grantAccess } = require("../controllers/roleController");
router.use(protectAuth);


router
  .route("/")
  .get(
    grantAccess("readAny", "category"),
    categoryController.getCategories
  );

router
  .route("/")
  .post(
    grantAccess("createAny", "category"),
    uploadProductImages,
    categoryController.createCategory
  );

router
  .route("/:id")
  .get(
    grantAccess("readAny", "category"),
    categoryController.showCategory
  )
  .patch(
    grantAccess("updateAny", "category"),
    categoryController.updateCategory
  )
  .delete(
    grantAccess("deleteAny", "category"),
    categoryController.deleteCategory
  );

module.exports = router;
