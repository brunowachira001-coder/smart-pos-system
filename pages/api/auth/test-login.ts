// Ultra-simple test login endpoint
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'Test endpoint working',
    data: {
      user: { id: 1, username: 'admin' },
      tokens: { accessToken: 'test-token' },
    },
  });
}
