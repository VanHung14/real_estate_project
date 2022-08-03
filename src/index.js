const express = require('express')
const app = express()
const path = require('path')
// const emailExistence = require('email-existence')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const port = process.env.PORT || 3000
const route = require('./routes')
var bodyParser = require('body-parser')

// const options = {
// 	definition: {
// 		openapi: "3.0.0",
// 		info: {
// 			title: "Library API",
// 			version: "1.0.0",
// 			description: "A simple Express Library API",
// 		},
// 		servers: [
// 			{
// 				url: "http://localhost:3306",
// 			},
// 		],
// 	},
// 	apis: ["./routes/*.js"],
// };

// const specs = swaggerJsDoc(options);

// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const options = {
	definition: {
	  openapi: "3.0.0",
	  info: {
		title: "LogRocket Express API with Swagger",
		version: "0.1.0",
		description:
		  "This is a simple CRUD API application made with Express and documented with Swagger",
		license: {
		  name: "MIT",
		  url: "https://spdx.org/licenses/MIT.html",
		},
		contact: {
		  name: "LogRocket",
		  url: "https://logrocket.com",
		  email: "info@email.com",
		},
	  },
	  servers: [
		{
		  url: "http://localhost:3000/books",
		},
	  ],
	},
	apis: ["./routes/books.js"],
  };
  
  const specs = swaggerJsDoc(options);
  app.use(
	"/api-docs",
	swaggerUI.serve,
	swaggerUI.setup(specs)
  );

app.use(express.static(path.join(__dirname, 'models')))


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

route(app)
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})  