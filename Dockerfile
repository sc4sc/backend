FROM node:8

WORKDIR /backend

# Speeding up by caching node_modules
ADD ./package.json ./package.json
RUN cd ./ && npm install
COPY ./ ./

CMD [ "node", "/backend/server/app.js" ]
EXPOSE 8000
