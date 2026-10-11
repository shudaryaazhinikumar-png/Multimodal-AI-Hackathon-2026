import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, GraduationCap, ClipboardCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/tutor', label: 'Tutor', icon: MessageSquare },
  { to: '/learning', label: 'Learn', icon: GraduationCap },
  { to: '/assessment', label: 'Assess', icon: ClipboardCheck },
  { to: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-ivory-200 bg-ivory-50/90 px-2 py-2 backdrop-blur-md lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-1 rounded-clay px-3 py-1.5 text-xs font-medium transition-colors',
                isActive ? 'text-violet-700' : 'text-clay-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 rounded-clay bg-clay-50 shadow-clay-raised"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
