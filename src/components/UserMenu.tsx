import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Not signed in — hide the user menu so we just see 'Open Studio'
    if (!user) {
        return null;
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="user-menu-trigger flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl transition-all cursor-pointer"
                title={user.name}
            >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                    {(user.given_name || user.name)?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-neutral-800 max-w-[90px] truncate block leading-tight">
                        {user.given_name || user.name.split(' ')[0]}
                    </span>
                </div>
                <ChevronDown size={13} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                        className="user-menu-popover absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50 text-neutral-800 select-none"
                    >
                        {/* User Info Header */}
                        <div className="p-4 bg-gradient-to-br from-neutral-50 to-indigo-50/30 border-b border-neutral-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                                    {(user.given_name || user.name)?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-extrabold text-neutral-900 truncate">{user.name}</p>
                                    <p className="text-[10px] font-medium text-neutral-400 truncate">{user.email}</p>
                                </div>
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="p-1.5 space-y-0.5">
                            {/* Account page */}
                            <button
                                type="button"
                                onClick={() => { navigate('/account'); setIsOpen(false); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80 rounded-xl transition-all text-left cursor-pointer"
                            >
                                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600">
                                    <User size={13} />
                                </div>
                                <span>Account</span>
                            </button>

                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-neutral-100 p-1.5">
                            <button
                                type="button"
                                onClick={() => { logout(); setIsOpen(false); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-left cursor-pointer"
                            >
                                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                                    <LogOut size={13} />
                                </div>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
