const express = require("express");
const Log_email_sent_controller = require("../../controllers/log_email_sent/log_email_sent.controller");
const log_email_sent_routes = express.Router();


log_email_sent_routes.get("/all", Log_email_sent_controller.findAll);


module.exports = log_email_sent_routes;
