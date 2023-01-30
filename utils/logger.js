const { createLogger , transports , format } = require('winston');
// combine its add timestamp to object (info) in printf function so if we use info object its return the first paramater in method combine function.

const customFormate = format.combine(format.timestamp() , format.printf((info) => {
    return `${info.timestamp} - ${info.message} - ${info.level.toUpperCase}`
}))


const logger = createLogger({

    // the default value is info so its print until info level and after this level not print , so if you want to print after level info you must change the default level value as line 9
    level : 'debug',
    transports : [
        new transports.Console(),
        new transports.File({ filename: 'app.log'})
    ]
});

module.exports = logger;





