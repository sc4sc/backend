FROM node:latest

WORKDIR /sc4sc

# Speeding up by caching node_modules
ADD ./backend/package.json ./backend/package.json
RUN cd ./backend && npm install
COPY ./backend ./backend

ADD ./klaytn ./klaytn
ADD *.sh Dockerfile ./

RUN chmod +x ./run_app_with_blockchain.sh
RUN cd ./klaytn && ./setup.sh && chmod +x ./run.sh && cd ..

ADD ./key ./klaytn/rn/data/keystore/
ADD ./password ./klaytn/rn/data/keystore/

EXPOSE 8000
CMD ./run_app_with_blockchain.sh