const AppError = require("../utils/AppError");
const factory = require("./handlerFactory");
const request = require("../models/request");
const Product = require("../models/product");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const catchAsync = require("../utils/catchAsync");

exports.getRequests = async(req,res) => {

  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;

  const page = req.query.page ? parseInt(req.query.page) : 0;

  let data = await factory.getAll(Request, {path: "user",select: "-password -__v"} ,pageSize, page,res ,req);

  let Total_data_count = await Request.countDocuments(data).exec();

  res.status(200).json({
  Total_data_count,
  data
  });

} 

exports.createRequest = factory.createOne(request , 'requestFile');

exports.showRequest = factory.getOne(request);

exports.updateRequest = factory.updateOne(request);

exports.deleteRequest = factory.deleteOne(request);

exports.geospatial = async(req,res,next) => {


  const {distance , latlng , unit} = req.params;
  const [lat , lng] = latlng.split(',');

  if(!lat || !lng){
    res.status(400).json('Please Provide latitutr and longitude in the formate lat , lng')
  }

  let location = {
    "type": "Point",
    "coordinates": [lat , lng]
}

  let doc = await request.create({
    name : 'Request',
    description : 'Request dsadasdmas',
    user :req.body.user,
    location : location,
  })


  res.status(400).json({
    count:tours.length,
      data:tours
  })

}

exports.getCheckoutSession = catchAsync(async(req,res,next) => {
  // 1) Get the currently booked product
const product = Product.findById(req.params.product_id)

  // 2) Create checkout session
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/product/${product.slug}`,
    customer_email: 'ahmadraid256@gmail.com',
    client_reference_id: req.params.product_id,
    // in line items we put some details about product 
    line_items:[
        {
            // all of this field from doc stipe.js
            price_data: {
              currency: 'usd',
              unit_amount: 2000,
              product_data: {
                name: `asd Product`,
                description: 'sadq',
                images: ['https://www.alqassam.ps/arabic/attachments/album/pics/1805/6583b6a7f7b23c65a4ac1eff417f0241.jpg'],
              },
            },
            quantity: 1,
        }],

        mode: 'payment',
})

// 3) Create session as response
res.status(200).json({
    status: 'success',
    session
});

})
