import type { LoggerOptions } from "winston";
import { createLogger, format, transports } from "winston";

const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local";

const developmentFormat = format.combine(
  format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  format.colorize(),
  format.printf((info) => {
    const { timestamp, level, message, metrics, context, ...rest } = info;

    let output = `${timestamp} [${level}]: ${message}`;

    // Highlight metrics in a readable format
    if (metrics) {
      output += "\n  📊 Metrics:";
      Object.entries(metrics).forEach(([key, value]) => {
        output += `\n    ${key}: ${value}`;
      });
    }

    // Show context if available
    if (context) {
      output += "\n  📋 Context:";
      Object.entries(context).forEach(([key, value]) => {
        output += `\n    ${key}: ${value}`;
      });
    }

    // Show other fields
    const otherFields = Object.keys(rest).filter((k) => k !== "stack");
    if (otherFields.length > 0) {
      output += "\n  " + JSON.stringify(rest, null, 2);
    }

    return output;
  })
);

const productionFormat = format.combine(
  format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss:ms",
  }),
  format.json()
);

export const loggerConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",
  format: isDevelopment ? developmentFormat : productionFormat,
  transports: [new transports.Console()],
};

export const logger = createLogger(loggerConfig);
