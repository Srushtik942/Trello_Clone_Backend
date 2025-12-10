const express = require("express");
const app = express();
const cors = require("cors");
const {initializeDatabase} = require("./db/db.connect");
initializeDatabase();
const User = require("./models/User.model");
const Task = require("./models/Task.model");
const Team = require("./models/Team.model");
const Project = require("./models/Project.model")
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
console.log("MIDDLEWARE EXECUTED FIRST");
     const authHeader  = req.headers["authorization"];
     console.log("passing authHeader inside the split",authHeader);

     if (!authHeader) {
    return res.status(401).json({ message: "No auth provided" });
  }

   const parts = authHeader.trim().split(/\s+/);

   if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).json({ message: "Malformed token header" });
    }

    const token = parts[1];

    console.log("JWT Secret (loaded):", JWT_SECRET);
    console.log("Token (extracted):", token);

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

console.log("Server started. Loaded verifyJWT =", verifyJWT);


// User login
app.post("/auth/login",async(req,res)=>{
    try{
        const {email, password}= req.body;
        console.log(req.body);

        const user = await User.findOne({email});

        if(!user){
           return res.status(404).json({message:"User not found"});
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

        console.log(token)

       return res.status(200).json({message:"Login Successful",token});

    }catch(error){
        res.status(500).json({message:"Internal Server Error",message:error.message});
    }
})

console.log("verifyJWT -->", verifyJWT);
console.log("verifyJWT typeof -->", typeof verifyJWT);

// protected route

app.get("/admin/api/data",verifyJWT,(req,res)=>{
        console.log("Route handler executed AFTER verifyJWT");
    res.json({message:"Protected route accessbile"})
})

//get user details

app.get("/auth/me",verifyJWT, async(req,res)=>{
    try{
        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        res.json({
            message:"User details fetched successfully!",
            user,
        })

    }catch(error){
      return  res.status(500).json({message:"Internal Server Error",error:error.message});
    }
})

// create new tasks
app.post("/tasks", async(req,res)=>{
    try{
        console.log("Create new task api started")
        const {name, project, team, owners, tags, timeToComplete, status} = req.body;
        console.log(req.body)

        if(!name || !project || !team || !owners || !timeToComplete){
            return res.status(404).json({error:"Check your form again. Some field are missing"});
        }
       const newTask = new Task({
        name,
        project,
        team,
        owners,
        tags,
        timeToComplete,
        status
       });

       console.log("replicating task",newTask)

       const saveTask = await newTask.save();
       console.log("saving Tasks",saveTask);

       return res.status(201).json({message:"Task Created successfully!", task: saveTask});
    }catch(error){
       return res.status(500).json({message:"Internal Server Error",error:error.message});
    }
});

// fetching all tasks

app.get("/tasks", async (req, res) => {
  try {
    const { team, owner, tags, project, status } = req.query;

    let filter = {};


    if (project) filter.project = project;
    if (status) filter.status = status;
    if (tags) filter.tags = tags;

    //  Find tasks first
    let tasks = await Task.find(filter)
      .populate({
        path: "team",
        select: "name",
        match: team ? { name: team } : {}
      })
      .populate({
        path: "owners",
        select: "name",
        match: owner ? { name: new RegExp(owner, "i") } : {}
      });

    //  Filter populated results
    if (team) {
      tasks = tasks.filter(task => task.team !== null);
    }

    if (owner) {
      tasks = tasks.filter(task => task.owners.length > 0);
    }

    if (tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found!" });
    }

    return res.status(200).json({
      message: "Successfully fetched all tasks",
      tasks
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});


// create team

app.post("/team",async(req,res)=>{
    try{

        const {name, description} = req.body;

        if(!name || !description){
           return res.status(404).json({error:"Unable to create new team"});
        }

        const newTeam = new Team({
            name,
            description
        });
        const teams = await newTeam.save();
        return res.status(200).json({message:"Successfully Created new team", teams});

    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
})

// create new Project

app.post("/projects",async(req,res)=>{
    try{
        const {name, description} = req.body;

        if(!name){
            return res.status(404).json({error:"Unable to create new project as Name is missing!"});
        }

        const newProject = new Project({
            name,
            description
        });

        const saveNewProject = await newProject.save();

        return res.status(200).json({message:"Successfully created new project!",saveNewProject});

    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
});

// update task

app.put("/tasks/:id",async(req,res)=>{
    try{
        const id = req.params.id;

        const updatedData = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updatedData,
            {new:true}
        );

    if (!updatedTask) {
        return res.status(404).json({
        error: `Task with ID ${id} not found.`,
      });
    }

      return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });

    }catch(error){
        res.status(500).json({error:"Internal Server Error",error:error.message});
    }
})


// delete task by id:

app.delete("/tasks/:id",async(req,res)=>{
    try{
        const id = req.params.id;
        if(!id){
            return res.status(402).json({message:"Please Provide the ID"});
        }

        const taskData = await Task.findByIdAndDelete(id);

        if(!taskData){
            return res.status(404).json({error:"Task Id is not present!"});
        }

        res.status(200).json({message:"Task deleted successfully!",taskData});


    }catch(error){
        return res.status(500).json({message:"Internal Server error",error:error.message});
    }
})

const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

