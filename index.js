'use strict';

const stompit = require('stompit');
const MailComposer = require('nodemailer/lib/mail-composer');

module.exports.title = 'Message Queue Drop';
module.exports.init = (app, done) => {
    const logName = 'Plugin/MQ';

    const connectOptions = {
        'host': app.config.host || 'localhost',
        'port': app.config.port || 61613,
        'connectHeaders':{
            'host': '/',
            'login': app.config.username || '',
            'passcode': app.config.password || '',
            'heart-beat': '5000,5000'
        }
    };

    let nodemailerQueueCallback = (error, message) => {
        let data = message.body || {};

        data.disableFileAccess = true;
        data.disableUrlAccess = true;
        let mail = new MailComposer(data).compile();

        let envelope = mail.getEnvelope();
        envelope.id = this.queue.seqIndex.get();
        envelope.interface = 'mq';
        envelope.transtype = 'STOMP';
        envelope.time = Date.now();

        let sourceStream = mail.createReadStream();
        let transform = new LeWindows();

        sourceStream.pipe(transform);
        sourceStream.once('error', err => transform.emit('error', err));

        // TODO: Add maildrop to plugin handler in mta
        this.maildrop.add(envelope, transform, (err, response) => {
            if (err) {
                if (err.name === 'SMTPResponse') {
                    return res.json(200, {
                        message: err.message
                    });
                }
                res.json(500, {
                    error: err.message
                });
            } else {
                res.json(200, {
                    id: envelope.id,
                    from: envelope.from,
                    to: envelope.to,
                    response
                });
            }
            next();
        });

        message.ack(); // message has been processed
    };
    let emlQueueCallback = (error, message) => {

        message.ack();
    };

    let connect = () => {
        stompit.connect(connectOptions, (error, client) => {
            if (error) {
                app.logger.error(logName, 'connect error ' + error.message);
                return;
            }

            // nodemailer struct queue
            client.subscribe({
                destination: (app.config.nodemailerQueue || "/zonemta/nodemailer"),
                ack: 'client-individual'
            }, nodemailerQueueCallback);

            // eml struct queue
            client.subscribe({
                destination: (app.config.emlQueue || "/zonemta/eml"),
                ack: 'client-individual'
            }, emlQueueCallback);

            app.logger.info(logName, 'Connected to MQ server. Ready to get mails.');
        });
    };
    setImmediate(() => connect());

    done();
}