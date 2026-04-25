import dynamic from 'next/dynamic';

const DebtContent = dynamic(() => import('../components/DebtContent'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px' }}>Loading...</div>,
});

export default function DebtPage() {
  return <DebtContent />;
}
