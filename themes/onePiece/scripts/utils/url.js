'use strict';

const { URL } = require('url');

const PROTOCOL_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function parseUrl(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    return new URL(value);
  } catch (error) {
    if (value.startsWith('//')) {
      try {
        return new URL(`https:${value}`);
      } catch (innerError) {
        return null;
      }
    }
  }

  return null;
}

function getHostname(value) {
  const parsed = parseUrl(value);
  return parsed && parsed.hostname ? parsed.hostname : value;
}

function hasProtocol(value) {
  return typeof value === 'string' && PROTOCOL_RE.test(value);
}

function isExternalUrl(value, siteUrl) {
  if (!hasProtocol(value)) {
    return false;
  }

  const parsed = parseUrl(value);
  if (!parsed) {
    return false;
  }

  return parsed.hostname !== getHostname(siteUrl);
}

module.exports = {
  getHostname,
  hasProtocol,
  isExternalUrl,
  parseUrl
};
