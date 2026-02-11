import React from 'react';
import { Bot } from 'lucide-react';

interface JiraBuddyAvatarProps {
    size?: 'sm' | 'md' | 'lg';
    isAnimated?: boolean; // Kept for compatibility but ignoring animation for minimalist
}

export const JiraBuddyAvatar: React.FC<JiraBuddyAvatarProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    const iconSizes = {
        sm: 14,
        md: 20,
        lg: 32
    };

    return (
        <div className={`${sizeClasses[size]} bg-gray-900 rounded-lg flex items-center justify-center`}>
            <Bot size={iconSizes[size]} className="text-white" />
        </div>
    );
};
