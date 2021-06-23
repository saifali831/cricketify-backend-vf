const db = require('../app/models');
const User = db.user;
module.exports={
    increment: inc=>{
        return inc+1;
    },
   isInArray: (array,id)=>{
    return array.some(item=>item.equals(id))
   },
   adminExist: email=>{
    User.findOne({email:email})
    .exec((err,user)=>{
        if(err){
            console.log(err);
        }
        if(user){ 
            console.log(true);
        }
        else{
            console.log(false);
        }
    })

}

}