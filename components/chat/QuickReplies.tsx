'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QuickReply } from '@/lib/types/chat';

interface QuickRepliesProps {
  replies: QuickReply[];
  onReplyClick: (reply: QuickReply) => void;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onReplyClick }) => {
  if (!replies || replies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 mt-2"
    >
      {replies.map((reply, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 * index }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReplyClick(reply)}
          className={`
            px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${reply.action ? 
              'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg' :
              'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-blue-300 hover:text-blue-600'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
        >
          {reply.text}
        </motion.button>
      ))}
    </motion.div>
  );
};