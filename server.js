const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const ip = require("ip");
const fileUpload = require("express-fileupload");
const RESPONSE_CODES = require("./constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("./constants/RESPONSE_STATUS");
const app = express();
const bindUser = require("./middleware/bindUser");
const bodyParser = require('body-parser');


app.use(bodyParser.json()); // Vérifiez que cela est bien configuré



dotenv.config({ path: path.join(__dirname, "./.env") });

const { Server } = require("socket.io");
const { CRON_SENT_EMAIL_EXECUTABLE_SCHEDULE, CRON_SENT_EMAIL_ONE_MULTIPLE_EXECUTABLE } = require("./controllers/crons/cron_sent_mails_executable");
const all_log_email_sent_router = require("./routes/log_email_sent/Log_email_sent_provider");
const all_crons_router = require("./routes/crons/Crons_provider");

// const recensement_router = require("./routes/recensement/Recensement_provider");
// const usa_state_country_router = require("./routes/usa_state_country/Usa_stateCountry_provider");

app.use(cors());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());

app.all("*", bindUser);


app.use("/log_email_sent", all_log_email_sent_router);
app.use("/crons",all_crons_router);

app.all("*", (req, res) => {
  res.status(RESPONSE_CODES.NOT_FOUND).json({
    statusCode: RESPONSE_CODES.NOT_FOUND,
    httpStatus: RESPONSE_STATUS.NOT_FOUND,
    message: "Route non trouvé",
    result: [],
  });
});
const port = process.env.PORT || 8000;
const isHttps = process.env.HTTPS ? process.env.HTTPS : false;
var server;
if (isHttps) {
  var options = {
    key: fs.readFileSync("/var/www/html/api/https/privkey.pem"),
    cert: fs.readFileSync("/var/www/html/api/https/fullchain.pem"),
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}
const io = new Server(server);
io.on("connection", (socket) => {
  socket.on("join", (data) => {
    console.log(data.userType, data.userId, "Connect to a socket");
    socket.join(data.userId);
  });
});
io.on("disconnect", () => {
  console.log("user disconnected");
});
app.io = io;



server.listen(port, async () => {
  // =====> CALLS ALL CRONS < ==========
  CRON_SENT_EMAIL_EXECUTABLE_SCHEDULE();
  // CRON_SENT_EMAIL_ONE_MULTIPLE_EXECUTABLE();
  console.log(
    `Cron Server is running on : http://${ip.address()}:${port}/`
  );
});
