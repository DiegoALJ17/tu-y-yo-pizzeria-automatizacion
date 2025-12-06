import fs from 'fs';
import path from 'path';

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  getLogFileName() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `test-execution-${date}.log`);
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    return logMessage;
  }

  writeToFile(message) {
    const logFile = this.getLogFileName();
    fs.appendFileSync(logFile, message + '\n', 'utf-8');
  }

  info(message, data = null) {
    const formattedMessage = this.formatMessage('INFO', message, data);
    console.log('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan
    this.writeToFile(formattedMessage);
  }

  success(message, data = null) {
    const formattedMessage = this.formatMessage('SUCCESS', message, data);
    console.log('\x1b[32m%s\x1b[0m', formattedMessage); // Green
    this.writeToFile(formattedMessage);
  }

  warning(message, data = null) {
    const formattedMessage = this.formatMessage('WARNING', message, data);
    console.log('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow
    this.writeToFile(formattedMessage);
  }

  error(message, data = null) {
    const formattedMessage = this.formatMessage('ERROR', message, data);
    console.error('\x1b[31m%s\x1b[0m', formattedMessage); // Red
    this.writeToFile(formattedMessage);
  }

  debug(message, data = null) {
    if (process.env.DEBUG === 'true') {
      const formattedMessage = this.formatMessage('DEBUG', message, data);
      console.log('\x1b[35m%s\x1b[0m', formattedMessage); // Magenta
      this.writeToFile(formattedMessage);
    }
  }

  testStart(testName) {
    const message = `========== TEST STARTED: ${testName} ==========`;
    console.log('\x1b[44m%s\x1b[0m', message); // Blue background
    this.writeToFile(message);
  }

  testEnd(testName, status) {
    const message = `========== TEST ENDED: ${testName} - Status: ${status} ==========`;
    const color = status === 'PASSED' ? '\x1b[42m' : '\x1b[41m'; // Green or Red background
    console.log(`${color}%s\x1b[0m`, message);
    this.writeToFile(message);
  }

  step(stepDescription) {
    const message = `>>> STEP: ${stepDescription}`;
    console.log('\x1b[36m%s\x1b[0m', message);
    this.writeToFile(message);
  }

  assertion(description, result) {
    const status = result ? 'PASSED' : 'FAILED';
    const color = result ? '\x1b[32m' : '\x1b[31m';
    const message = `ASSERTION [${status}]: ${description}`;
    console.log(`${color}%s\x1b[0m`, message);
    this.writeToFile(message);
  }

  clearLogs() {
    const files = fs.readdirSync(this.logDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(this.logDir, file));
    });
    console.log('All log files cleared');
  }

  getLogContent(date = null) {
    const fileName = date 
      ? `test-execution-${date}.log` 
      : this.getLogFileName();
    
    if (fs.existsSync(fileName)) {
      return fs.readFileSync(fileName, 'utf-8');
    }
    return null;
  }
}

// Exportar una instancia única del logger (Singleton)
export const logger = new Logger();