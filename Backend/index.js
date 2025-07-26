const express = require("express")
const dotenv =require("dotenv")
const resumeRoutes=require("./routes/resume.routes")
const userRoutes=require("./routes/user.routes")

dotenv.config();
const connectDB = require("./database/db");
connectDB();

const app=express();

const port = process.env.PORT 

app.use(express.json())

app.get("/healthy",function(req,res){
    return res.send("I am healthy")

})

// write all routes here
app.use("/user",userRoutes)
app.use("/resume",resumeRoutes)






app.listen(port,()=>console.log(`server is running at http://localhost:${port}`))