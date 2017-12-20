'use strict';

const AMQP = require('amqpimping');

class Queue extends AMQP {

    constructor({ config, logger }) {
        super({
            host: config.get('amqp.host'),
            username: config.get('amqp.username'),
            password: config.get('amqp.password'),
            logger,
            retry: {
                maxTries: config.get('amqp.retry.maxTries'),
                interval: config.get('amqp.retry.interval'),
                backoff: config.get('amqp.retry.backoff')
            }
        });
        this.queue = config.get('amqp.queue');
    }

    start() {
        super.connect();
    }

    publish(queue, message) {
        if (!message) {
            message = queue;
            queue = this.queue;
        }
        super.publish(queue, message);
    }
}

module.exports = Queue;
