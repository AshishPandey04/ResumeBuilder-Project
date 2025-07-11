const {Router} = require("express")
const userMiddleware = require("../middleware/user.middleware");
const { User } = require("../database/index");
const router=Router()


const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();

    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken };
  } catch (error) {
    throw new Error("Something went wrong while generating Access Token.");
  }
};

// User Routes
router.post("/signup", async (req, res) => {
  // Implement user signup logic
  //get inputs from user
  const { username, email, password } = req.body;

  if (username == "") {
    return res.status(400).json({
      msg: "Username is Required",
    });
  }
  if (email == "") {
    return res.status(400).json({
      msg: "email is Required",
    });
  }
  if (password == "") {
    return res.status(400).json({
      msg: "password is Required",
    });
  }

  const exitedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (exitedUser) {
    return res.status(409).json({
      msg: "Username or Email already exists",
    });
  }

  const user = await User.create({
    username,
    email,
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -accessToken "
  );
  if (!createdUser) {
    return res.status(500).json({
      msg: "Something went wrong while registery the user",
    });
  }
  return res.status(200).send(createdUser);
});

router.post("/login", async (req, res) => {
  // Implement user login logic

  // email and password
  const { email, password } = req.body;
  //check if email or password is empty

  if (email === "") {
    return res.status(400).json({
      msg: "Email is required",
    });
  }
  if (password === "") {
    return res.status(400).json({
      msg: "password is required",
    });
  }
  const user = await User.findOne({
    email: { $eq: email },
  });
  if (!user) {
    return res.status(400).json({
      msg: "User is not found , Sign Up",
    });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      msg: "Password is Wrong",
    });
  }
  const { accessToken } = await generateAccessToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -accessToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };


  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json({
      msg: "User logged in successfully",

      user: loggedInUser, accessToken

    });
});



router.post("/logout", userMiddleware, async (req, res) => {
  // Implement logout logic
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        accessToken: 1
      }
    }, {
    new: true
  }
  )

  const options = {
    httpOnly: true,
    secure: true
  }
  res.status(200).clearCookie("accessToken", options).json({
      msg: "Logout successfully"
    })



});

module.exports = router;


