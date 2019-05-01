FROM node:latest

WORKDIR /sc4sc

# Speeding up by caching node_modules
ADD ./package.json ./backend/package.json
RUN cd ./ && npm install
COPY ./ ./backend

#ADD *.sh Dockerfile ./

#RUN chmod +x ./run_app_with_blockchain.sh

CMD [ "node", "/sc4sc/backend/server/app.js" ]
EXPOSE 8000
#CMD ./run_app_with_blockchain.sh