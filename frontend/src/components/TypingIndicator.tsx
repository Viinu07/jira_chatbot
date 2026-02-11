import { motion } from 'framer-motion';
import { JiraBuddyAvatar } from './JiraBuddyAvatar';

export const TypingIndicator = () => {
    return (
        <div className="flex justify-start mb-4">
            <div className="flex items-end gap-3">
                <div className="flex-shrink-0 mt-1">
                    <JiraBuddyAvatar size="sm" />
                </div>

                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 h-[40px]">
                    {[0, 1, 2].map((dot) => (
                        <motion.div
                            key={dot}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                            animate={{
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: dot * 0.2
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
