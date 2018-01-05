'use strict';

const bunyan = require('bunyan');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const { CronJob } = require('cron');
const tv4 = require('tv4');

const config = require('../config/index');
const Queue = require('./queue');
const schema = require('./service-schema');

const logger = bunyan.createLogger({
    name: config.get('log.name'),
    level: config.get('log.level'),
    serializers: bunyan.stdSerializers
});

const queue = new Queue({ config, logger });

const availabilityRegEx = /(.*) available/i;

const job = new CronJob(config.get('cron'), () => {

    logger.info('Checking LiteBit.eu for stock...');

    cloudscraper.get(config.get('url'), (err, res, body) => {
        if (err) {
            logger.error({ err }, 'An error occurred while fetching data from LiteBit.eu');
            return;
        }
        logger.info({ statusCode: res.statusCode }, 'Received LiteBit.eu response');

        const $ = cheerio.load(body);
        const available = $('#buy').children('p').first().text();
        if (!available) {
            logger.fatal('Could not traverse the HTML to find the stock!');
            return;
        }
        logger.info(available);
        const match = available.match(availabilityRegEx);
        if (match === null) {
            logger.fatal('Found the HTML tag containing the availability, but no recognizable text was found in it');
            return;
        }
        const amount = parseFloat(match[1]);
        if (!!amount) {
            logger.info('Coins back in stock!');
            queue.publish(JSON.stringify({
                recipient: {
                    type: 'channel',
                    name: 'cryptocurrency'
                },
                message: `Coins are back in stock! ${available}`
            }));
        } else {
            logger.info('No coins in stock yet :(');
        }
    });

}, null, false, config.get('timezone'));

queue.on('message', message => {
    try {
        message = JSON.parse(message);
    } catch (e) {
        logger.error({ message }, 'The received message is not valid JSON');
        return;
    }

    const valid = tv4.validate(message, schema);
    if (!valid) {
        logger.error({ err: tv4.error }, 'Received an invalid message');
        return;
    }

    if (message.name !== 'litebit.eu-stock-checker') {
        return;
    }

    switch (message.command) {
        case 'start':
            logger.info('Starting job...');
            job.start();
            break;
        case 'stop':
            logger.info('Stopping job...');
            job.stop();
            break;
        default:
            logger.warn({ message }, 'Received a message with an unknown command');
    }
});

queue.on('close', () => {
    job.stop();
});

queue.start();

module.exports = {
    queue,
    job
};
