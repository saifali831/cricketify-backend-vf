const db = require('../models')
const bcryptjs = require('bcryptjs');
const config = require('../config/auth.config')
const jwt = require('jsonwebtoken');
const { request } = require('express');
const User = db.user;
const {ROLE} = require('../config/role.config');


signUp = (req,res,err)=>{
    var salt = bcryptjs.genSaltSync(10);
    var role;
    if(req.body.isAdmin){
        role = ROLE.ADMIN;
    }
    else{
        role = ROLE.USER;
    }
    
    const user = new User({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:bcryptjs.hashSync(req.body.password,salt),
        role:role,
        isActive:req.body.isActive
    })
    user.save((err,user)=>{
       if(err){
           res.status(500).send({message:err})
       }
        res.status(200).send({message:`user inserted successfully!`})
    })
}

signIn=(req,res,next)=>{
    User.findOne({email:req.body.email}).exec((err,user)=>{
        if(err){
            res.status(500).send({message:err});
            return;
        }
        if(!user){
           return res.status(404).send({message:"user not found"});
        }
        if(!user.isActive){
            return res.status(404).send({message:"We are sorry your account is disabled!"});
        }
        const passwordIsValid= bcryptjs.compareSync(req.body.password,user.password);
        if(!passwordIsValid){
            return res.status(404).send({
                accessToken:null,
                message:"Inavlid password"})
        }
        token = jwt.sign({id:user.id},config.secret,{expiresIn:86400})
        req.session.user_id=user.id;
        req.session.isLoggedIn = true;
        console.log(req.session.isLoggedIn)
        res.status(200).send({
            _id:user._id,
            firstName:user.firstName,
            role:user.role,
            accessToken:token,
            isActive:user.isActive
        })
    })
}

const getAllUsers=(req,res)=>{
    User.find({}).lean().exec((err,userData)=>{
        if(err){
            res.status(500).send({message:err})
        }
        else{
            res.status(200).send(userData);
        }
    })
}

const disableAccount=(req,res)=>{
    const userId = req.body.userId;
    User.updateOne({_id:userId},{isActive:false},(err,result)=>{
        if(err){
            res.status(500).send({message:err});
        }
        else{
            res.status(200).send({message:"User account is disabled"})
        }
    })
}
const activateAccount=(req,res)=>{
    const userId = req.body.userId;
    User.updateOne({_id:userId},{isActive:true},(err,result)=>{
        if(err){
            res.status(500).send({message:err});
        }
        else{
            res.status(200).send({message:"User account is activated"})
        }
    })
}
const userCont = { 
    signUp,
    signIn,
    getAllUsers,
    disableAccount,
    activateAccount
}
module.exports = userCont;