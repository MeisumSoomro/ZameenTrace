const { getUserById } = require('../services/user.service');

function mapAuthUser(auth = {}) {
  return {
    id: auth.sub,
    email: auth.email,
    role: auth.role,
    fullName: auth.fullName,
  };
}

async function getProfileHandler(req, res, next) {
  try {
    // Try to fetch fresh profile from DB, fall back to JWT claims
    if (req.auth && req.auth.sub) {
      const user = await getUserById(req.auth.sub).catch(() => null);
      if (user) {
        return res.json({ user });
      }
    }
    res.json({ user: mapAuthUser(req.auth) });
  } catch (error) {
    next(error);
  }
}

function updateProfileHandler(req, res) {
  const currentUser = mapAuthUser(req.auth);
  const { fullName, preferredLanguage, organizationName } = req.body || {};

  res.json({
    user: {
      ...currentUser,
      fullName: fullName || currentUser.fullName,
      preferredLanguage: preferredLanguage || 'en',
      organizationName: organizationName || null,
    },
  });
}

function getUserPropertiesHandler(req, res) {
  res.json({
    user: mapAuthUser(req.auth),
    properties: [],
  });
}

function placeholderUserHandler(_req, res) {
  res.json({
    message: 'User service is available. Use /api/users/profile with a bearer token.',
  });
}

module.exports = {
  getProfileHandler,
  updateProfileHandler,
  getUserPropertiesHandler,
  placeholderUserHandler,
};
