const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult }
    = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'Devansh Agrawal';   //used for signing the web token
 var fetchUser = require('../middleware/fetchUser');


// Route 1: cretae a user using : POST "/api/auth" . no login required


router.post('/createuser', [
    body('name', "Enter a valid name").isLength({ min: 3 }),
    body('email', "Enter a valid Email").isEmail(),
    // body('username', "Enter a valid username").isLength({ min: 10 }),
    body('password', "Enter a valid password of atleast 6 characters").isLength({ min: 6 }),
], async (req, res) => {
    let success= false;

    // if there are error return bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    // check whether user with same email exists
    try {

        let user = await User.findOne({ email: req.body.email });
        // let userName = await User.findOne({ username: req.body.username });
        if (user ) {
            return res.status(400).json({success, error: "Sorry!! a user with same email already exists, Try something different!!" })
        }
        // else if (userName && !user) {
        //     return res.status(400).json({ error: "Sorry!! a user with same username already exists, Try a new one!!" })
        // }
        // else if (user && userName){
        //     return res.status(400).json({ error: "Sorry!! a user with same username and same email already exists, Try something different!!" })
        // }

        const salt = await bcrypt.genSalt(10);

        const secPass = await bcrypt.hash(req.body.password, salt);

        // create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            // username: req.body.username,
            email: req.body.email,
        });
        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        //    console.log(jwtData);

        //    res.json(user)
        success= true;
        res.json({ success,authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error occured");
    }
})


// route 2: authenticate a user using : POST "/api/auth/login" . no login required
router.post('/login', [
   
    body('email', "Enter a valid Email").isEmail(),
    body('password', "Password can't be blank").exists(),
    
], async (req, res) => {
    let success= false;
    // if there are error return bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const{email,password}= req.body;
    try{
        let user =await User.findOne({email});
        if(!user){
            success= false;
            return res.status(400).json({error:"Please try to Login with correct Credentials"});
        }

        const passwordCompare =await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            success= false;
            return res.status(400).json({ success, error: "Please try to Login with correct Credentials" });
        }
        const data ={
            user:{
                id: user.id
            }
        }
        const authtoken= jwt.sign(data, JWT_SECRET);
        success= true;
        res.json({success,authtoken})

    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error occured");

    }


});

// route 3: give the detail of the logded in user using POST . login required

router.post('/getuser',fetchUser, async (req, res) => {
    
try {
    userId=req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
    
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error occured");
}
})

module.exports = router