# Pulling nodejs base image
FROM mhart/alpine-node:8

ADD package.json /tmp/package.json

RUN cd /tmp && \
    npm install --production && \
    rm -f ~/.npmrc

RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

WORKDIR /opt/app
ADD . /opt/app

# Run the command on container startup
CMD ["node", "."]