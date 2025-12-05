// PI Base Url
export const PI_BASE_URL = process.env.VITE_PI_BASE_URL || "";
export const PI_BASE_PATH = process.env.VITE_PI_BASE_PATH || "";
export const PI_URL = encodeURI(`${PI_BASE_URL}${PI_BASE_PATH}`);
