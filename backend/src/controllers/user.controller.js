function placeholderUserHandler(_req, res) {
  res.status(501).json({
    message: 'User endpoints are scaffolded but not implemented yet.',
  });
}

module.exports = { placeholderUserHandler };
