FROM ubuntu:20.04

RUN apt-get update && \
    apt-get install build-essential wget -y

RUN wget https://deb.nodesource.com/setup_12.x
RUN chmod +x setup_12.x
RUN bash setup_12.x
RUN apt-get install nodejs iputils-ping -y
RUN npm i -g sequelize-cli
RUN npm i -g yarn

RUN export NODE_OPTIONS=--max_old_space_size=4096

COPY . /ac_app
WORKDIR /ac_app

RUN apt-get remove -y build-essential && \
    apt-get autoremove -y && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /root/.cache

RUN ["chmod", "511", "/ac_app/start.sh"]

CMD ["/ac_app/start.sh"]

EXPOSE 8080
