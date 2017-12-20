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
    }
});

config.validate();

module.exports = config;
