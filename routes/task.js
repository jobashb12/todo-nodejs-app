const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const {
  Tasks,
  createTask,
  completeTask,
  deleteTask,
} = require("../controllers/task");

router.route("/all").get(isAuthenticated, Tasks);
router.route("/new").post(isAuthenticated, createTask);
router.route("/complete").put(isAuthenticated, completeTask);
router.route("/delete").delete(isAuthenticated, deleteTask);

module.exports = router;
