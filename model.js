const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    space:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model('Room',userSchema);