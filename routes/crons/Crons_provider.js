const express = require("express")
const all_crons_routes = require("./crons.routes")
const all_crons_router = express.Router()

all_crons_router.use("/", all_crons_routes)

module.exports = all_crons_router