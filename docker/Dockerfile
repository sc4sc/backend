FROM node:latest

WORKDIR /sc4sc
ADD ./backend ./backend
ADD ./klaytn ./klaytn
ADD *.sh Dockerfile ./

RUN chmod +x ./run_app_with_blockchain.sh
RUN cd ./backend && npm install && cd ..
RUN cd ./klaytn && ./setup.sh && chmod +x ./run.sh && cd ..

ADD ./https ./https
ADD ./key ./klaytn/rn/data/keystore/
ADD ./password ./klaytn/rn/data/keystore/

EXPOSE 8000
CMD ./run_app_with_blockchain.sh