'use strict';

const bunyan = require('bunyan');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const { CronJob } = require('cron');

const config = require('../config/index');
const Queue = require('./queue');

const logger = bunyan.createLogger({
    name: config.get('log.name'),
    level: config.get('log.level'),
    serializers: bunyan.stdSerializers
});

const queue = new Queue({ config, logger });

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
        if (available !== '0 available') {
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

queue.on('connect', () => {
    job.start();
});

queue.on('close', () => {
    job.stop();
});

queue.start();

module.exports = {
    queue,
    job
};