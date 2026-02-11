import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquarePlus,
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    History,
    Box
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    return (
        <motion.div
            initial={{ width: isOpen ? 260 : 80 }}
            animate={{ width: isOpen ? 260 : 80 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`
        relative h-screen bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 flex flex-col
        shadow-2xl z-20 hidden md:flex
      `}
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-8 bg-gray-800 text-gray-400 hover:text-white p-1 rounded-full border border-gray-700 shadow-md transition-colors"
            >
                {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Header */}
            <div className="p-4 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <Box className="w-6 h-6 text-white" />
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="font-bold text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent truncate"
                        >
                            JiraBot
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* New Chat Button */}
            <div className="px-3 mb-6">
                <button className={`
          flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group
          ${isOpen
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white justify-center'
                    }
        `}>
                    <MessageSquarePlus size={20} />
                    {isOpen && <span className="font-medium">New Chat</span>}
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-none">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    {isOpen ? 'Recent' : '...'}
                </div>

                {[1, 2, 3].map((i) => (
                    <button
                        key={i}
                        className="flex items-center gap-3 w-full p-3 text-gray-400 hover:text-gray-100 hover:bg-white/5 rounded-lg transition-colors group"
                    >
                        <History size={18} className="shrink-0 group-hover:text-blue-400 transition-colors" />
                        {isOpen && (
                            <span className="truncate text-sm">Project TES-{100 + i} status update</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 mt-auto border-t border-gray-800 bg-gray-900/50">
                <div className="space-y-1">
                    <button className="flex items-center gap-3 w-full p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <LayoutDashboard size={20} className="shrink-0" />
                        {isOpen && <span className="text-sm">Dashboard</span>}
                    </button>
                    <button className="flex items-center gap-3 w-full p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Settings size={20} className="shrink-0" />
                        {isOpen && <span className="text-sm">Settings</span>}
                    </button>
                </div>

                {isOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                            JD
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">John Doe</div>
                            <div className="text-xs text-gray-500 truncate">Admin</div>
                        </div>
                        <LogOut size={16} className="text-gray-500 hover:text-red-400 cursor-pointer transition-colors" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};
