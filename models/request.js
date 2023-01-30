const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    price:{
      type:Number,
      required: true,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    status: {
      type: String,
      default: "Pending",
      enum: {
        values: ["Pending", "On-Progress", "Finish", "Canceled"],
        message:
          "The status request is either: pending, on-progress, finish, canceled",
      },
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);


requestSchema.pre("save", async function (next) {
  await this.populate({
    path: "user",
    select: "-__v",
  });
  await this.populate({
    path: "product",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("Request", requestSchema);
