const Visitor = require('../models/Visitor');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({}).sort({ checkInTime: -1 });
        res.status(200).json(visitors);
    } catch (error) {
        res.status(500).json({ message: "Server error while fetching visitors." });
    }
};

exports.addVisitor = async (req, res) => {
    try {
        const { name, phone, purpose, whomToMeet, photo } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and Phone are required.' });
        }
        const newVisitor = new Visitor({ ...req.body, checkInTime: new Date().toISOString() });
        const savedVisitor = await newVisitor.save();
        res.status(201).json(savedVisitor);
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding visitor.' });
    }
};

exports.updateVisitor = async (req, res) => {
    const { id } = req.params; // Using URL parameter as it's more RESTful
    const { checkOutTime } = req.body;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid visitor ID format.' });
    }
    try {
        const visitor = await Visitor.findById(id);
        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found.' });
        }
        visitor.checkOutTime = checkOutTime || new Date().toISOString();
        const updatedVisitor = await visitor.save();
        res.status(200).json(updatedVisitor);
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating visitor.' });
    }
};