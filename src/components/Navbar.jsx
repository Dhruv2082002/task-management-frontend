import { useAuth } from '../context/AuthContext';
import { LogOut, CheckSquare } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <div className="flex items-center">
                        <CheckSquare className="h-8 w-8 text-indigo-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900">TaskManager</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700 hidden sm:block">
                            Welcome, <span className="font-medium">{user?.name}</span>
                        </span>
                        <button
                            onClick={logout}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
