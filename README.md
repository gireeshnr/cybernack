<h1 align="center">
🌐 MERN Stack
</h1>
<p align="center">
MongoDB, Expressjs, React/Redux, Nodejs
</p>

<p align="center">
   <a href="https://github.com/amazingandyyy/mern/blob/master/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-green.svg" />
   </a>
   <a href="https://circleci.com/gh/amazingandyyy/mern">
      <img src="https://circleci.com/gh/amazingandyyy/mern.svg?style=svg" />
   </a>
</p>

> MERN is a fullstack implementation in MongoDB, Expressjs, React/Redux, Nodejs.

MERN stack is the idea of using Javascript/Node for fullstack web development.

## clone or download
```terminal
$ git clone https://github.com/amazingandyyy/mern.git
$ yarn # or npm i
```

## project structure
```terminal
LICENSE
package.json
server/
   package.json
   .env (to create .env, check [prepare your secret session])
client/
   package.json
...
```

# Usage (run fullstack app on your machine)

## Prerequisites
- [MongoDB](https://gist.github.com/nrollr/9f523ae17ecdbb50311980503409aeb3)
- [Node](https://nodejs.org/en/download/) ^10.0.0
- [npm](https://nodejs.org/en/download/package-manager/)

notice, you need client and server runs concurrently in different terminal session, in order to make them talk to each other

## Client-side usage(PORT: 3000)
```terminal
$ cd client          // go to client folder
$ yarn # or npm i    // npm install packages
$ npm run dev        // run it locally

// deployment for client app
$ npm run build // this will compile the react code using webpack and generate a folder called docs in the root level
$ npm run start // this will run the files in docs, this behavior is exactly the same how gh-pages will run your static site
```

## Server-side usage(PORT: 8000)

### Prepare your secret

run the script at the first level:

(You need to add a JWT_SECRET in .env to connect to MongoDB)

```terminal
// in the root level
$ cd server
$ echo "JWT_SECRET=YOUR_JWT_SECRET" >> src/.env
```

### Start

```terminal
$ cd server   // go to server folder
$ npm i       // npm install packages
$ npm run dev // run it locally
$ npm run build // this will build the server code to es5 js codes and generate a dist file
```

## Deploy Server to [Heroku](https://dashboard.heroku.com/)
```terminal
$ npm i -g heroku
$ heroku login
...
$ heroku create
$ npm run heroku:add <your-super-amazing-heroku-app>
// remember to run this command in the root level, not the server level, so if you follow the documentation along, you may need to do `cd ..`
$ pwd
/Users/<your-name>/mern
$ npm run deploy:heroku
```

### After creating heroku

if using webpack:
remember to update the file of [client/webpack.prod.js](https://github.com/amazingandyyy/mern/blob/master/client/webpack.prod.js)
```javascript
 'API_URI': JSON.stringify('https://your-super-amazing-heroku-app.herokuapp.com')
```
if using parcel
remember to update the file of [client/.env.production](https://github.com/amazingandyyy/mern/blob/master/client/.env.production.js)
```
 REACT_APP_API_URI=https://your-super-amazing-heroku-app.herokuapp.com
```
# Dependencies(tech-stacks)
Client-side | Server-side
--- | ---
axios: ^0.15.3 | bcrypt-nodejs: ^0.0.3
babel-preset-stage-1: ^6.1.18|body-parser: ^1.15.2
lodash: ^3.10.1 | cors: ^2.8.1
react: ^16.2.0 | dotenv: ^2.0.0
react-dom: ^16.2.0 | express: ^4.14.0
react-redux: ^4.0.0 | jwt-simple: ^0.5.1
react-router-dom: ^4.2.2 | mongoose: ^4.7.4
redux: ^3.7.2 | morgan: ^1.7.0
redux-thunk: ^2.1.0 |

# Screenshots of this project

User visit public and Home page
![User visit public and Home page](http://i.imgur.com/ORCGHHY.png)

User can sign in or sign up
![User can sign in or sign up](http://i.imgur.com/rrmbU5I.png)

After signing in user can go to account route and make request to token-protected API endpoint
![After signing in user can go to account route](http://i.imgur.com/FzLB51u.png)

## Standard

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## BUGs or comments

[Create new Issues](https://github.com/amazingandyyy/mern/issues) (preferred)

Email Me: amazingandyyy@gmail.com (welcome, say hi)

## Author
[Amazingandyyy](https://amazingandyyy.com)

I recently launch my monthly mentorship program, feel free to reach out and see what we can grow together:

<a href="https://mentorcruise.com/mentor/andychen/"> <img src="https://cdn.mentorcruise.com/img/banner/fire-sm.svg" width="240" alt="MentorCruise"> </a>

## Join the growing community

[![Star History Chart](https://api.star-history.com/svg?repos=amazingandyyy/mern&type=Date)](https://star-history.com/#amazingandyyy/mern&Date)


### License
[MIT](https://github.com/amazingandyyy/mern/blob/master/LICENSE)
#   C y b e r n a c k _ 2 
 
 Asset Management and OS Distribution System
Project Overview
This project aims to provide a comprehensive asset management system with a focus on network scanning and OS distribution visualization. The system leverages various scanning tools to discover assets, gather detailed information about them, and present this data in an intuitive and user-friendly interface.

Recent Achievements
Integration of Nmap Scanning: Implemented the Nmap scanning feature to perform detailed network scans. The scans include service detection, OS detection, and more.
Scan Result Visualization: Developed components to visualize scan results, particularly focusing on OS distribution across discovered assets.
Improved Data Fetching and Display: Enhanced the backend to fetch scan results correctly and updated the frontend to display these results accurately.
Error Handling and Logging: Improved error handling and logging mechanisms to ensure robustness and easier debugging.
Key Components
Backend
NmapScanResult Model

Schema to store Nmap scan results.
Fields include organization, user, scan information, run statistics, and additional fields for storing raw XML data.
Nmap Service

runNmapScan(domain): Executes the Nmap scan command.
saveNmapScanResult(orgId, userId, domain, scanData): Saves the Nmap scan results to the database and updates or creates the corresponding asset.
Asset Controller

getAssetDetail: Fetches asset details and associated scan results, including the newly implemented OS details extraction.
Frontend
OSDistributionChart Component

Utilizes the Chart.js library to display a pie chart of OS distribution based on scan results.
Parses raw XML data from scan results to extract OS information.
AssetDetailView Component

Displays detailed information about a selected asset, including network information, OS distribution, and scan history.
Integrates the OSDistributionChart component to visualize OS distribution.
Utilities
ChartSetup.js
Registers necessary components for Chart.js to work seamlessly with the application.
API Utils
API Functions
fetchAssetDetail(assetId): Fetches detailed information about an asset, including its scan results.
Additional API calls for asset management, including fetching assets, auto discovery, and updating assets.
Installation and Setup
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/asset-management-system.git
cd asset-management-system
Backend Setup:

Navigate to the server directory:
bash
Copy code
cd server
Install dependencies:
bash
Copy code
npm install
Configure environment variables:
Create a .env file based on the .env.example provided.
Add necessary configurations such as database connection strings.
Start the backend server:
bash
Copy code
npm start
Frontend Setup:

Navigate to the client directory:
bash
Copy code
cd client
Install dependencies:
bash
Copy code
npm install
Start the frontend development server:
bash
Copy code
npm start
Usage
Accessing the Application: Open your browser and navigate to http://localhost:3000 to access the frontend interface.
Viewing Asset Details: Select an asset from the list to view detailed information, including network data and OS distribution.
Performing Network Scans: Use the available features to initiate network scans and view the results.
Contributing
We welcome contributions to enhance the functionality and usability of the system. Please follow these steps to contribute:

Fork the repository.
Create a new branch for your feature or bug fix:
bash
Copy code
git checkout -b feature/your-feature-name
Make your changes and commit them:
bash
Copy code
git commit -m "Description of your changes"
Push your branch to your forked repository:
bash
Copy code
git push origin feature/your-feature-name
Open a pull request to the main repository.
License
This project is licensed under the MIT License. See the LICENSE file for more details.# cybernack-platform
