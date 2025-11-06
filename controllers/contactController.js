const Contact = require("../models/Contact");

const submitContact = async (req, res) => {
  try {
    const { name, email, mobile, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    await Contact.create({ name, email, mobile, message });
    res.status(201).json({ message: "Contact submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { submitContact };
