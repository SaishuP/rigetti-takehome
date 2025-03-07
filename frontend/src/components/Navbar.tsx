import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-white font-bold text-lg">Fridge Monitor</div>
        <div className="flex space-x-4">
          {/*Settings View with fridges and filtering*/}
          <Link href="/" className={`text-white px-3 py-2 rounded ${router.pathname === '/' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            Settings
          </Link>
          {/* Analytics View */}
          <Link href="/analytics" className={`text-white px-3 py-2 rounded ${router.pathname === '/analytics' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            Analytics
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;