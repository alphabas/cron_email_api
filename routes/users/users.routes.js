const express = require("express");
const Recensement_controller = require("../../controllers/recensement/recensement.controller");
const recensement_routes = express.Router();


recensement_routes.get("/all", Recensement_controller.findAll);
recensement_routes.get("/generate_query", Recensement_controller.generateQueries);
recensement_routes.post("/delete", Recensement_controller.deleteItems);


module.exports = recensement_routes;
