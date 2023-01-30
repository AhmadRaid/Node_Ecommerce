const AppError = require("../utils/AppError");
const factory = require("./handlerFactory");
const category= require("../models/category");

exports.getCategories = factory.getAll(category)

exports.createCategory = factory.createOne(category );

exports.showCategory = factory.getOne(category);

exports.updateCategory = factory.updateOne(category);

exports.deleteCategory = factory.deleteOne(category);

