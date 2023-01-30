const factory = require("./handlerFactory");
const Product = require("../models/product");
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const sharp = require("sharp");
const multerStorage = multer.memoryStorage();
const { roles } = require("../utils/role");

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

exports.uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeSaveProductImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `product-${req.body.name}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/assets/img/product/${req.body.imageCover}`);

  // 2) Images
  req.body.images = []
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/assets/img/product/${filename}`);

      
      req.body.images.push(filename);
    })
  );

  next();
});

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.getProducts = factory.getAll(Product);

exports.createProduct = factory.createOne(Product);

exports.showProduct = factory.getOne(Product);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);
