# zonemta-mq-drop

**Work in progress**

Message Queue drop plugin for [ZoneMTA](https://github.com/zone-eu/zone-mta). Install this to drop messages to ZoneMTA via a queue service like ActiveMQ or RabbitMQ.

## Setup

Add this as a dependency for your ZoneMTA app

```
npm install zonemta-mq-drop --save
```

Add a configuration entry in the "plugins" section of your ZoneMTA app

```json
...
  "plugins": {
    "modules/zonemta-mq-drop": {
      "enabled": "main"
    }
  }
...
```

## License

European Union Public License 1.1 ([details](http://ec.europa.eu/idabc/eupl.html))