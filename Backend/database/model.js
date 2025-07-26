const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");





const userSchema =new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
      accessToken: {
      type: String,
    },
},{
    timestamps:true
});

userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken=async function () {
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    
}
const User = mongoose.model("User",userSchema)


const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    default: "Untitled Resume",
  },
  template: {
    type: String, 
    required: true,
  },
  resumeData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
     links: [
      {
        label: String, 
        url: String   
      }
    ]
    },
    education: [
      {
        institution: String,
        degree: String,
        startYear: String,
        endYear: String,
        description: String,
      },
    ],
    experience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    skills: [
        {
            skillType:String,
            skill:String
        }
    ],
    projects: [
      {
        title: String,
        description: String,
        link: String,
        techStack: [String],
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        date: String,
      },
    ],
    achievements: [String],
  }
},{
    timestamps:true
});




const Resume = mongoose.model("Resume", ResumeSchema);
module.exports={
    User,
    Resume
}