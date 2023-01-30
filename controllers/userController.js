const express = require('express')
const User = require('../models/user');
const AppError = require('../utils/AppError')


const catchAsync = fn => {
    return (req,res,next) => {
    fn(req,res,next).catch(next)
  }}


const indexUser = (req, res) => {
    res.send('All_data')
}

const storeUser = async(req, res) => {
    const task = await User.create(req.body)
    res.status(201).json({task})
}

const showUser = async (req, res,next) => {
    
    try{
        const user =  await User.find({_id : req.params.id});
        if (!user) {
            console.log('das')
            return next('Error');
          }

        res.status(200).json({
            status:"Fail",
            user
        })
}catch(err){
    next(new AppError(`Can't find user on this website!`, 404));

}
}

const updateUser = (req, res) => {
    res.send('Update Data')
}

const deleteUser = (req, res) => {
    res.send('Destroy Data')
}

module.exports = {
    indexUser,
    storeUser,
    showUser,
    updateUser,
    deleteUser
}