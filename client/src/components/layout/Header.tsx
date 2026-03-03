import { Menu, Bell, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';

interface Props {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const { user } = useAuthStore();
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
      <button onClick={onMenuClick} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <button onClick={toggleDark} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
