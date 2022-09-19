const path = require('path')

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const User = require('./models/user')

const app = express();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSOWRD}@cluster0.pizod.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`


app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next();
})

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    console.log(file,'-------filefile')
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('profile'));
app.use('/images', express.static(path.join(__dirname, 'images')));





app.post('/addUser',async (req,res,next) => {
    const {name, email, phone} = req.body;

    const image = req.file;
    
    const imageUrl = `http://localhost:5000/${image.path}`;
    
    let newUser = new User({
        name, email, phone, profilImage: imageUrl
    })

    if (newUser){
        let createdUser = await newUser.save()
        console.log(createdUser, "ccccccccccccccccc", imageUrl, name, email, phone)
        res.json({ message: "user added!", data: createdUser })
    }

})


app.get('/getUsers', async (req, res, next) => {
   let allUsers = await User.find({})
//    console.log("🚀 ~ file: app.js ~ line 74 ~ app.get ~ allUsers", allUsers)

   res.status(200).json({message:'All Users', data: allUsers})

})

mongoose.connect(MONGODB_URI)
    .then((result) => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("App is listning On 5000")
        })
    })
    .catch(err => {
        console.log(err);
    })