FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# CMD ["npm", "run", "dev"]
RUN npm run build
CMD ["npm", "start"]