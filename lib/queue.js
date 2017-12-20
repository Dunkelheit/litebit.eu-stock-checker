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
        this.queue = {
            message: config.get('amqp.queue.message'),
            service: config.get('amqp.queue.service'),
        };
    }

    start() {
        this.on('connect', () => {
            super.listen(this.queue.service);
        });
        super.connect();
    }

    publish(queue, message) {
        if (!message) {
            message = queue;
            queue = this.queue.message;
        }
        super.publish(queue, message);
    }
}

module.exports = Queue;
