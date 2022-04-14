FROM node
WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm audit fix --force
RUN npm install
COPY . /app
EXPOSE 8081
CMD ["npm", "start"]