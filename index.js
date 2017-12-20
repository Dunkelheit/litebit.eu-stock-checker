'use strict';

const bunyan = require('bunyan');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const { CronJob } = require('cron');

const config = require('./config');

const logger = bunyan.createLogger( {name: 'litebit.eu-stock-checker', serializers: bunyan.stdSerializers });

function notify() {
    // Until there's Slack integration...
    console.log('\u0007'); // eslint-disable-line no-console
}

const job = new CronJob(config.get('cron'), () => {

    logger.info('Checking LiteBit.eu for stock...');

    cloudscraper.get(config.get('url'), (err, res, body) => {
        if (err) {
            logger.error({ err }, 'An error occurred while fetching data from LiteBit.eu');
        }
        logger.info({ statusCode: res.statusCode }, 'Received LiteBit.eu response');

        const $ = cheerio.load(body);
        const available = $('#buy').children('p').first().text();
        if (!available) {
            logger.fatal({ body }, 'Could not traverse the HTML to find the stock!');
        }
        logger.info(available);
        if (available !== '0 available') {
            logger.info('COINS ARE BACK IN STOCK! BUY BUY BUY!');
            notify();
        } else {
            logger.info('No coins in stock yet :(');
        }
    });


}, null, true, config.get('timezone'));

job.start();