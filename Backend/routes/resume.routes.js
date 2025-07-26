const { Router } = require("express");
const userMiddleware = require("../middleware/user.middleware");
const { Resume } = require("../database/model");
const { isValidObjectId } = require("mongoose");
const router = Router();

router.post("/", userMiddleware, async (req, res) => {
  try {
    const { title, template, resumeData } = req.body;

    if (!title || !template || !resumeData) {
      return res.status(400).json({
        msg: "title,template and resumeData is required",
      });
    }

    const userId = req.user._id;

    const newResume = await Resume.create({
      userId,
      title,
      template,
      resumeData,
    });

    if (!newResume) {
      return res.status(500).json({
        msg: "Something wen wrong while creating the new Resume",
      });
    }
    return res.status(201).json({
      message: "Resume created successfully.",
      resume: newResume,
    });
  } catch (error) {
    console.error("Error creating resume:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating resume." });
  }
});

router.get("/", userMiddleware, async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(401).json({
      msg: "User not found",
    });
  }

  const allResumes = await Resume.find({ userId: userId }).sort({
    updatedAt: -1,
  });

  return res.status(200).json({
    msg: "All resumes fetched successfully",
    Resumes: allResumes,
  });
});

router.get("/:id", userMiddleware, async (req, res) => {
  const { id: resumeId } = req.params;
  if (!isValidObjectId(resumeId)) {
    return res.status(400).json({
      msg: "Invalid resumeId",
    });
  }

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    return res.status(404).json({
      msg: "Resume not found ",
    });
  }

  if (resume.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      msg: "you are not authorised to view this resume",
    });
  }

  return res.status(200).json({
    msg: "fetched the resume successfully",
    resume: resume,
  });
});

router.put("/:id", userMiddleware, async (req, res) => {
  try {
    const { id: resumeId } = req.params;
    const { title, template, resumeData } = req.body;
    if (!title || !template || !resumeData) {
      return res.status(401).json({
        msg: "Title , template and resumeData is required",
      });
    }

    if (!isValidObjectId(resumeId)) {
      return res.status(400).json({
        msg: "Invalid resumeId",
      });
    }

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this resume." });
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      resumeId,
      {
        $set: {
          title,
          template,
          resumeData,
        },
      },
      {
        new: true,
      }
    );
    if (!updatedResume) {
      return res.status(500).json({
        msg: "Something went wrong while updating the Resume",
      });
    }
    return res.status(200).json({
      message: "Resume updated successfully.",
      resume: updatedResume,
    });
  } catch (error) {
    console.error("Error updating resume:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating resume." });
  }
});

router.delete("/:id", userMiddleware, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ msg: "Invalid Resume ID" });
  }

  const resume = await Resume.findById(id);
  if (!resume) {
    return res.status(404).json({ msg: "resume not found" });
  }

  if (resume.userId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Unauthorized to delete this resume." });
  }

  await Resume.findByIdAndDelete(id);

  return res.status(200).json({ msg: "resume deleted successfully" });
});
module.exports = router;
