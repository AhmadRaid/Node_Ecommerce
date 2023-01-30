const AppError = require("../utils/AppError");
const factory = require("./handlerFactory");
const Tags= require("../models/tags");

exports.getTags = factory.getAll(Tags)

exports.createTags = factory.createOne(Tags );

exports.showTags = factory.getOne(Tags);

exports.updateTags = factory.updateOne(Tags);

exports.deleteTags = factory.deleteOne(Tags);

