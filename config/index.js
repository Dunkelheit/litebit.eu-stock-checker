'use strict';

const convict = require('convict');

const config = convict({
    url: {
        format: 'url',
        env: 'LITEBIT_URL',
        default: 'https://www.litebit.eu/en/buy/bitcoin'
    },
    cron: {
        format: String,
        env: 'LITEBIT_CRON',
        default: '*/15 * * * * *'
    },
    timezone: {
        format: String,
        env: 'LITEBIT_TIMEZONE',
        default: 'Europe/Amsterdam'
    },
    log: {
        name: {
            format: 'String',
            default: 'litebit.eu-stock-checker',
            env: 'LITEBIT_LOG_NAME'
        },
        level: {
            format: 'String',
            default: 'debug',
            env: 'LITEBIT_LOG_LEVEL'
        }
    },
    amqp: {
        host: {
            doc: 'The host of the RabbitMQ service.',
            format: String,
            default: null,
            env: 'AMQP_HOST'
        },
        username: {
            doc: 'A RabbitMQ username.',
            format: String,
            default: null,
            env: 'AMQP_USERNAME'
        },
        password: {
            doc: 'Password for the RabbitMQ user.',
            format: String,
            default: null,
            env: 'AMQP_PASSWORD'
        },
        queue: {
            doc: 'Queue that Samantha will be listening to',
            format: String,
            default: null,
            env: 'AMQP_QUEUE'
        },
        retry: {
            maxTries: {
                doc: 'Maximum amount of times we will try to (re)connect to AMQP.',
                format: 'int',
                default: 10,
                env: 'AMQP_RETRY_MAX_TRIES'
            },
            interval: {
                doc: 'Initial wait time between attempts in milliseconds.',
                format: 'int',
                default: 1000,
                env: 'AMQP_RETRY_INTERVAL'
            },
            backoff: {
                doc: 'Increase interval by this factor between attempts.',
                format: 'int',
                default: 2,
                env: 'AMQP_RETRY_BACKOFF'
            }
        }
    }
});

config.validate();

module.exports = config;
