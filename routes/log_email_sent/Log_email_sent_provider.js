const express = require("express")
const all_log_email_sent_routes = require("./log_email_sent.routes")
const all_log_email_sent_router = express.Router()

all_log_email_sent_router.use("/", all_log_email_sent_routes)

module.exports = all_log_email_sent_router