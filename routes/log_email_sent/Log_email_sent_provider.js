const express = require("express")
const all_recensement_routes = require("./log_email_sent.routes")
const all_recensement_router = express.Router()

all_recensement_router.use("/", all_recensement_routes)

module.exports = all_recensement_router