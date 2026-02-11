import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Search, PlusCircle, BarChart2 } from 'lucide-react';

interface QuickActionsProps {
    onAction: (text: string) => void;
}

const actions = [
    { icon: Search, label: 'Find Issues', query: 'Find all open issues in project TEST' },
    { icon: Bug, label: 'Report Bug', query: 'I want to report a bug in the login flow' },
    { icon: PlusCircle, label: 'New Story', query: 'Create a new user story for the dashboard' },
    { icon: BarChart2, label: 'My Status', query: 'What are my assigned tasks?' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
    return (
        <div className="flex flex-wrap gap-2 px-4 pb-2 justify-center md:justify-start">
            {actions.map((action, index) => (
                <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAction(action.query)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700 hover:border-blue-500/50 rounded-full text-xs font-medium text-gray-300 hover:text-blue-200 transition-colors backdrop-blur-sm"
                >
                    <action.icon size={14} className="text-blue-400" />
                    {action.label}
                </motion.button>
            ))}
        </div>
    );
};
