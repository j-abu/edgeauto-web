const express = require('express');
const port = 1776;
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes/routes.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));

routes(app);

// Start the server
const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);

    console.log(`Server listening on port ${server.address().port}`);
});
