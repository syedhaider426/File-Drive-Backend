# File Drive Backend
File Drive's backend is written with NodeJS. It works with ExpressJS to handle middleware. The file storage that is utilized is MongoDB's GridFS, which is a file layer abstraction. PassportJS is used to handle authentication. In addition, SendGrid is a cloud provider that is used to send emails to users who sign up for an account. SendGrid also sends emails for any server errors that occur.

# Installation
1) Clone the repository or download the zip file from the 'Releases' menu
2) Config the secrets in config/dev.js (if working on a development environment). If one is working on a production environment, configure the values as system parameters (with names specified in config/prod.js).

# Config
 <ul>
  <li>db - Name of database</li>
  <li>port - Port to run NodeJS server on</li>
  <li>passportKey - Passport is a 3rd party middleware used to handle user authentication. PassportKey should be a unique sequence of characters/numbers (not easily guessable).</li>
  <li>email - Email that is used to send emails to users who sign up for an account</li>
  <li>sendgrid_api_key - API key given by SendGrid (https://sendgrid.com/docs/for-developers/) </li>
  <li>jwtPrivateKey - Unique sequence of characters/numbers to sign JWT</li>
  <li>connection - MongoDB connection string</li>
 </ul>

# Run Locally
```shell               
node server.js
```

# Built With
<ul>
 <li>NodeJS - Javascript runtime </li>
 <li>MongoDB - Database</li>
 <li>Passport - Third-party authentication middleware</li>
 <li>AWS LightSail - AWS Managed Server</li>
 <li>Docker - Container that runs the NodeJS server and MongoDB</li>
 <li>Nginx - Reverse proxy for DNS</li>
</ul>

# Authors
Syed Haider
