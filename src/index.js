const express = require("express");
const app = express();
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerDocument = require("../swagger.json");
const port = process.env.PORT || 3000;
const route = require("./routes");
var bodyParser = require("body-parser");
const utils = require("../src/utils/utils");

app.use(express.static(path.join(__dirname, "models")));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

route(app);

app.get("/auth", async (req, res) => {
  try {
    res.redirect(utils.request_get_auth_code_url);
  } catch (error) {
    res.sendStatus(500);
    console.log(error.message);
  }
});

app.get(process.env.REDIRECT_URI, async (req, res) => {
  const authorization_token = req.query;
  console.log({ auth_server_response: authorization_token });
  try {
    // get access token using authorization token
    const response = await utils.get_access_token(authorization_token.code);
    // get access token from payload
    const { access_token } = response.data;
    // get user profile data
    console.log("token", access_token);
    const user = await utils.get_profile_data(access_token);
    const user_data = user.data;
    console.log(user_data);
    res.send(`
      <h1> welcome ${user_data.name}</h1>
      <img src="${user_data.picture}" alt="user_image" />
    `);
    console.log(user_data);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = app;

// const server = app.listen(port, () => {
//   console.log(`App listening on port ${port}`)
// })

// module.exports = server
