const express = require("express");
const Crons_controller = require("../../controllers/crons/cron_sent_mails_executable");
const crons_routes = express.Router();


crons_routes.post("/send_email", Crons_controller.SENDING_EMAILS);


module.exports = crons_routes;
