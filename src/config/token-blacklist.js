const blacklistedTokens = new Map();

function pruneExpiredTokens() {
  const now = Date.now();

  for (const [jti, expiresAt] of blacklistedTokens.entries()) {
    if (expiresAt <= now) {
      blacklistedTokens.delete(jti);
    }
  }
}

function blacklistToken(jti, expiresAt) {
  if (!jti || !expiresAt) {
    return;
  }

  blacklistedTokens.set(jti, expiresAt * 1000);
  pruneExpiredTokens();
}

function isTokenBlacklisted(jti) {
  pruneExpiredTokens();
  return blacklistedTokens.has(jti);
}

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
};
