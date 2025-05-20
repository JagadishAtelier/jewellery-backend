import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    columnClass:  { type: String, required: true},
    items : [
        { 
            link : {type : String , required : true,trim : true},
            description : {type : String , required : true, trim : true , maxlength : 200},
            imageUrl : {type : String , required : true,trim: true},
            label : {type : String , required : true,trim : true,maxlength : 50},
            bg : {type : String ,required : true},
            heightClass : {type : String , required : true}
        }
    ]
}, { timestamps: true });

export default mongoose.model('Jewels_Categories', categorySchema);
