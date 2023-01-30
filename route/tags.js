const express = require("express");
const router = express.Router();
const tagsController = require("../controllers/tagsController");
const { protectAuth } = require("../controllers/authController");
const { grantAccess } = require("../controllers/roleController");
router.use(protectAuth);


router
  .route("/")
  .get(
    grantAccess("readAny", "tags"),
    tagsController.getTags
  );

router
  .route("/")
  .post(
    grantAccess("createAny", "tags"),
    tagsController.createTags
  );

router
  .route("/:id")
  .get(
    grantAccess("readAny", "tags"),
    tagsController.showTags
  )
  .patch(
    grantAccess("updateAny", "tags"),
    tagsController.updateTags
  )
  .delete(
    grantAccess("deleteAny", "tags"),
    tagsController.deleteTags
  );

module.exports = router;
