const fs = require('fs');
const path = require('path');


const logLevelNameToValue = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
};

const logLevelValueToName = Object.entries(logLevelNameToValue)
    .reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {});

const packageLevels = {};

const defaultLogLevel = process.env.DEFAULT_LOG_LEVEL
    ? parseInt(process.env.DEFAULT_LOG_LEVEL)
    : logLevelNameToValue.INFO;

const logsDir = process.env.LOGS_DIR || path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);


function systemLog(message) {
    const logPath = path.join(logsDir, 'logger-service.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

function writeAppLog(serviceName, levelName, timestamp, message) {
    const logPath = path.join(logsDir, `${serviceName}.log`);
    const line = `[${timestamp}] [${levelName}] ${message}\n`;
    fs.appendFileSync(logPath, line);
}

function writeAllServicesLog(serviceName, levelName, message) {
    const logPath = path.join(logsDir, 'all-services.log');
    const timestamp = new Date().toISOString();
    const processId = process.pid;
    const threadId = 'main';   // Node.js is single-threaded by default
    const line = `[${timestamp}] [PID ${processId}] [TID ${threadId}] [${serviceName}] [${levelName}] ${message}\n`;
    fs.appendFileSync(logPath, line);
}

function getActiveLogLevel(serviceName) {
    return packageLevels[serviceName] ?? defaultLogLevel;
}


function handleLog(call, callback) {
    const { serviceName, message, level, timestamp } = call.request;
    const activeLevel = getActiveLogLevel(serviceName);

    if (logLevelValueToName[level] === undefined) {
        systemLog(`Rejected log from [${serviceName}] → invalid level: ${level}`);
        return callback(null, { success: false });
    }

    if (level >= activeLevel) {
        const levelName = logLevelValueToName[level];
        writeAppLog(serviceName, levelName, timestamp, message);
        writeAllServicesLog(serviceName, levelName, message);
    }

    callback(null, { success: true });
}

function handleChangeLogLevel(call, callback) {
    const { newLevel } = call.request;
    systemLog(`(RPC) Global fallback log level change requested → new level: ${newLevel}`);
    callback(null, { success: true, currentLevel: defaultLogLevel });
}

function handleChangePackageLogLevel(call, callback) {
    const { packageName, newLevel } = call.request;
    packageLevels[packageName] = newLevel;
    const levelName = logLevelValueToName[newLevel] ?? newLevel;
    systemLog(`(RPC) Log level for [${packageName}] changed to ${levelName}`);
    callback(null, { success: true, currentLevel: newLevel });
}

module.exports = {
    handleLog,
    handleChangeLogLevel,
    handleChangePackageLogLevel,
    systemLog
};
