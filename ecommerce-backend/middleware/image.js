const multer=require('multer');

// 📁 Configure storage for uploaded image
//s
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/'); // Save to 'uploads/' directory
    }
    ,
    filename:function(req,file,cb){
        const uniqueSuffix=Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null,file.fieldname+'-'+uniqueSuffix+'.'+file.mimetype.split('/')[1]);
    }
});

// 📁 File filter to accept only images
const fileFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image/')){
        cb(null,true); // Accept file
    }else{
        cb(new Error('Not an image! Please upload an image.'),false); // Reject file
    }
};

// 📁 Initialize multer with storage and file filter
const upload=multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:1024*1024*5} // Limit file size to 5MB
});     
module.exports=upload;