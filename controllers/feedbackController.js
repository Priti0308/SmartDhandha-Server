const Feedback = require("../models/Feedback");

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, mobile, feedback } = req.body;

    if (!name || !email || !feedback) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newFeedback = new Feedback({ name, email, mobile, feedback });
    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully", data: newFeedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all feedbacks
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
