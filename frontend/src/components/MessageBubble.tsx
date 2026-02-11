import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../api';
import { JiraBuddyAvatar } from './JiraBuddyAvatar';

interface MessageBubbleProps {
    message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex max-w-[85%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                {/* Avatar - Only for Bot */}
                {!isUser && (
                    <div className="flex-shrink-0 mt-1">
                        <JiraBuddyAvatar size="sm" />
                    </div>
                )}

                {/* Bubble */}
                <div className="flex flex-col">
                    <span className={`text-[10px] text-gray-400 mb-1 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
                        {isUser ? 'You' : 'Jira Buddy'}
                    </span>
                    <div className={`
              relative px-4 py-3 rounded-2xl text-[14px] leading-relaxed
              ${isUser
                            ? 'bg-gray-900 text-white rounded-tr-sm'
                            : 'bg-gray-100/80 text-gray-800 rounded-tl-sm'
                        }
            `}>
                        <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        return !inline ? (
                                            <div className={`bg-black/5 rounded-md p-2.5 my-2 overflow-x-auto border border-black/5`}>
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            </div>
                                        ) : (
                                            <code className={`bg-black/5 px-1 py-0.5 rounded font-mono text-xs`} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
