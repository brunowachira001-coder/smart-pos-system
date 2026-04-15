export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    return res.status(200).json({
      success: true,
      data: {
        user: { id: 1, username: 'admin', email: 'admin@test.com' },
        tokens: { accessToken: 'token123', refreshToken: 'refresh123' },
      },
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid credentials' });
}
