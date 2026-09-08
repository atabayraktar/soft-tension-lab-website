import HoldingPage from '../components/HoldingPage';

// Always-available preview of the pre-launch screen. With NEXT_PUBLIC_HOLDING=1 the
// same component is served at `/` (see _app.jsx).
export default function Holding() {
  return <HoldingPage />;
}
Holding.bare = true;
