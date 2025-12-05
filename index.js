const express = require("express");
const app = express();
const cors = require("cors");
const {initializeDatabase} = require("./db/db.connect");
initializeDatabase();
const User = require("./models/User.model");
const bcrypt = require("bcrypt");
require("dotenv").config();

// JWT Secret key

const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);
const jwt = require("jsonwebtoken");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());



// User Signup

app.post("/auth/signup",async(req,res)=>{
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
          return  res.status(404).json({error:"Unable to add new user, check your form again"});
        }

        // check email is existing or not

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(409).json({error:"Email already exists"});
        }

        const hasedPassword = await bcrypt.hash(password, 10);


        if(password.length < 8){
        return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

    // create new user
    const newUser = new User ({
        name,
        email,
        password:hasedPassword
    });
    await newUser.save();

      return res.status(200).json({message:"User created successfully!",newUser});

    }catch(error){
        res.status(500).json({message:"Internal Server Error",error});
    }
})

// verifyJWT

const verifyJWT = (req,res,next)=>{
     const token = req.headers["authorization"];

     if(!token){
        return res.status(401).json({message:"No token provided"});
     }

     try{
        const decodedToken = jwt.verify(token,JWT_SECRET);
        req.user = decodedToken;
        next();
     }catch(error){
        return res.status(402).json({error:"Invalid token"});
     }
}

// User login
app.post("/auth/login",async(req,res)=>{
    try{
        const {email, password}= req.body;
        console.log(req.body);

        const user = await User.findOne({email});

        if(!user){
            res.status(404).json({message:"User not found"});
        }

        // compare password

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({message:"Invalid Password"});
        }

        // create token

        const token = jwt.sign(
            {id:user._id, email:user.email},
            JWT_SECRET,
            {expiresIn:"24h"}
        );

        res.status(200).json({message:"Login Successful",token});

    }catch(error){
        res.status(500).json({message:"Internal Server Error",message:error.message});
    }
})



const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

