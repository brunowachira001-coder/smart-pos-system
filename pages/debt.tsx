import React, { useEffect, useState } from 'react';

export default function DebtManagement() {
  const [content, setContent] = useState('Loading...');

  useEffect(() => {
    try {
      setContent('Page loaded successfully');
    } catch (e: any) {
      setContent(`Error: ${e.message}`);
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Debt Management</h1>
      <p>{content}</p>
    </div>
  );
}
