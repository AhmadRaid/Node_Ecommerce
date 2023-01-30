const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    unique: true,
    required: [true, "A product must have a name"],
    maxlength: [
      40,
      "A product name must have less or equal then 40 characters",
    ],
    minlength: [5, "A product name must have more or equal then 10 characters"],
  },
  description: {
    type: String,
    trim: true,
    required: [true, "A product must have a description"],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: true,
  },
  tags: {
    type: mongoose.Schema.ObjectId,
    ref: "Tags",
    required: true,
  },
  imageCover: {
    type: String,
    required: [true, "A product must have a cover image"],
  },
  images: [String],
  coupon: [String],
  price: {
    type: Number,
    required: [true, "A product must have a price"],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: "Discount price ({VALUE}) should be below regular price",
    },
  },
  available: {
    type: Boolean,
    required: [true, "A product available required"],
  },
  active: {
    type: Boolean,
    required: [true, "A product active required"],
  },
  slug: String,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

productSchema.pre("save", async function (next) {
  await this.populate({
    path: "category",
    select: "-__v",
  });

  await this.populate({
    path: "tags",
    select: "-__v",
  });
  next();
});
module.exports = mongoose.model("Product", productSchema);
