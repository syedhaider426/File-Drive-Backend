FROM node:12-alpine

# Create node_modules directory in a directory that does not require special permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
COPY package*.json ./

# Switch user to non-root node user
USER node

RUN npm install
# Copy app source code w/ appropriate permissions
COPY --chown=node:node . .

#Expose port and start application
EXPOSE 8080
CMD [ "node", "app.js" ]