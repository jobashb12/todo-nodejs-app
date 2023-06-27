const Task = require("../models/task");

const Tasks = async (req, res) => {
  try {
    const { _id } = req.user;

    const tasks = await Task.find({
      user: _id,
    });

    res.status(201).json({
      success: true,
      message: "Your Tasks",
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { _id } = req.user;
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const task = await Task.create({
      title,
      description,
      user: _id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeTask = async (req, res) => {
  try {
    const { _id } = req.body;
    const task = await Task.findOne({
      _id,
    });
    task.isCompleted = !task.isCompleted;
    await task.save();

    res.status(201).json({
      success: true,
      message: "Task completed successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { _id } = req.body;
    await Task.findByIdAndDelete({
      _id,
    });

    res.status(201).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { Tasks, createTask, completeTask, deleteTask };
