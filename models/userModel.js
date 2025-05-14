import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: {type : String , required : true},
  email : {type : String,unique : true},
  address : {type : String,required : true},
  pincode : {type : String,required : true},
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
