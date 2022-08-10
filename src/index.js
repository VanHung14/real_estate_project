const express = require('express')
const app = express()
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerDocument = require('../swagger.json');
const port = process.env.PORT || 3000
const route = require('./routes')
var bodyParser = require('body-parser')


app.use(express.static(path.join(__dirname, 'models')))

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


app.use(
	'/api-docs',
	swaggerUi.serve, 
	swaggerUi.setup(swaggerDocument)
  );


route(app)

module.exports = app

// const server = app.listen(port, () => {
//   console.log(`App listening on port ${port}`)
// })   

// module.exports = server

