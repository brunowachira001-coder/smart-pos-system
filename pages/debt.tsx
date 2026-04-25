import React, { useEffect, useState } from 'react';

export default function DebtManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Debt Management</h1>
      <p>This is a test page to see if it loads.</p>
    </div>
  );
}
