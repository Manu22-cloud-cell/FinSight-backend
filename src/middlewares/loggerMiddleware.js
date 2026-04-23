const morgan = require("morgan");
const logger = require("../utils/logger");

const stream = {
    write: (message) => {
        const msg = message.trim();

        // basic status-based routing
        if (msg.includes(" 5")) {
            logger.error(msg);
        } else if (msg.includes(" 4")) {
            logger.warn(msg);
        } else {
            logger.info(msg);
        }
    },
};

module.exports = morgan("combined", { stream });