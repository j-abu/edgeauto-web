# edgeauto-web



The portal allows end users to replay data collected from previous driving sessions. The data is displayed in a table, allowing users to plot up to 3 arbitration IDs by selecting an entry. Also featured is a map showing the path a vehicle took for the duration of the driving session.

This folder contains all the files used for the web portal displayed on the front end.

App created with Nodejs/Reactjs.

**Node 10.15.1**

**Yarn 1.13.0**

[Preview](https://i.imgur.com/b1yW4QN.png)

## Documentation

**server.js**

Responsible for setting proxy(from port 3000 to port 1776) and starting the node server.

**routes/routes.js**

Contains the API call definitions(SQL statements) for use by the react application.

To retrieve all available sessions:

`SELECT DISTINCT session_id FROM message`

To retrieve all relevant data for a specific session:

`SELECT arb_id, message, cantime, latitude, longitude FROM message WHERE session_id=?`

**data/config.js**

Contains credentials for mysql database connection.

**client/src/App.js**

Application code for web portal.

On page load, an API call to fetch all available sessions(`/getsessions`) is made in the `componentDidMount()` method.

Selecting a session and clicking "load" will make an API call(`/session/1/?`) to fetch all relevant data for the selected session via the `getDataForSession()` method.

Session data is stored in a hashmap with the arbitration ID as a key and an object as a value. The object has two members: name and a nested hashmap with time as a key and messages as values:

`HashMap<aid, {name, HashMap<time, message>}>`

Geographical map data is stored in a separate hashmap on session load, with time as a key and an object as value. This object has 2 members, lat and lng:

`Hashmap<time, {lat,lng}>`

Any changes the app makes to the data table, plots or map marker are made through `this.setState({...})`. This forces Reactjs to rerender the componenets instantly.

## Install and run

To run this app locally:

First clone the repository to your machine.

Navigate to the project directory: `cd [path-to-app]/react-app`

Install yarn with the node package manager: `npm i yarn -g`

Install all the required dependencies: `yarn install`

Run the application and development server: `yarn dev`

View the application at localhost:3000


## Dependencies

Note: for package versions please see package.json

body-parser : https://www.npmjs.com/package/body-parser

chartjs-plugin-annotation : https://www.npmjs.com/package/chartjs-plugin-annotation

express : https://www.npmjs.com/package/express

hashmap : https://www.npmjs.com/package/hashmap

leaflet : https://www.npmjs.com/package/leaflet

mysql : https://www.npmjs.com/package/mysql

react : https://www.npmjs.com/package/react

react-chartjs : https://www.npmjs.com/package/react-chartjs

react-dropdown : https://www.npmjs.com/package/react-dropdown
    
react-leaflet : https://www.npmjs.com/package/react-leaflet

react-modal : https://www.npmjs.com/package/react-modal

react-polyline : https://www.npmjs.com/package/react-polyline

react-rangeslider : https://www.npmjs.com/package/react-rangeslider

react-table : https://www.npmjs.com/package/react-table

react-router : https://www.npmjs.com/package/react-router


## Inquiries

Contact me at jabu@oakland.edu
