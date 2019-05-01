FROM node:latest

WORKDIR /backend

# Speeding up by caching node_modules
ADD ./package.json ./package.json
RUN cd ./ && npm install
COPY ./ ./

#ADD *.sh Dockerfile ./

#RUN chmod +x ./run_app_with_blockchain.sh

CMD [ "node", "/backend/server/app.js" ]
EXPOSE 8000
#CMD ./run_app_with_blockchain.sh