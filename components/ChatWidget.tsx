'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, User, Bot, Phone, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { analytics } from '@/lib/analytics'
import { createPortal } from 'react-dom'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

interface ChatWidgetProps {
  isVisible: boolean
}

export default function ChatWidget({ isVisible }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Simulate bot typing effect
  useEffect(() => {
    if (isOpen && !isTyping) {
      const timer = setTimeout(() => setIsTyping(true), 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (message.trim()) {
      analytics.chatInteraction('message_sent')
      // Redirect to WhatsApp with the message
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank')
      setMessage('')
      setIsOpen(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    analytics.chatInteraction('quick_reply')
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(reply)}`, '_blank')
    setIsOpen(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isVisible) return null

  const quickReplies = [
    "I need AC repair service 🧊",
    "My refrigerator isn't cooling ❄️", 
    "I need spare parts 🔧",
    "Emergency repair needed! 🚨"
  ]

  return (
    <>
      {/* Chat Widget Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen)
            analytics.chatInteraction(isOpen ? 'chat_closed' : 'chat_opened')
          }}
          className="group relative bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open chat support"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageCircle size={24} />
                {/* Notification dot */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Tooltip */}
          <motion.div
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-neutral-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            initial={{ x: 10, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
          >
            Chat Support
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-neutral-900"></div>
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Chat Popup Modal */}
      {mounted && createPortal(
        (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="fixed bottom-24 right-6 z-[60] w-80 md:w-96"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold">Cool Wind Support</h3>
                        <p className="text-primary-100 text-sm flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
                          Online now
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    {/* Bot greeting message */}
                    <motion.div
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-primary-600" />
                      </div>
                      <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-2 max-w-[240px]">
                        <p className="text-sm text-neutral-700">
                          Hi! I'm here to help with your AC & refrigerator needs. How can I assist you today?
                        </p>
                      </div>
                    </motion.div>

                    {/* Typing indicator */}
                    {isTyping && (
                      <motion.div
                        className="flex items-start gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Bot size={16} className="text-primary-600" />
                        </div>
                        <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-2">
                          <div className="flex gap-1">
                            <motion.div
                              className="w-2 h-2 bg-primary-400 rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-primary-400 rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-primary-400 rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Quick Replies */}
                  <div className="p-4 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 mb-3">Quick replies:</p>
                    <div className="space-y-2">
                      {quickReplies.map((reply, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="w-full text-left text-sm p-2 rounded-lg bg-neutral-50 hover:bg-primary-50 hover:text-primary-700 border border-neutral-200 hover:border-primary-200 transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ x: 4 }}
                        >
                          {reply}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-neutral-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      />
                      <motion.button
                        onClick={handleSendMessage}
                        className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!message.trim()}
                      >
                        <Send size={16} />
                      </motion.button>
                    </div>
                    
                    {/* Contact options */}
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`tel:${PHONE}`}
                        className="flex-1 text-xs text-center py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                        onClick={() => analytics.phoneCallClick('chat_widget')}
                      >
                        <Phone size={14} />
                        Call Now
                      </a>
                      <div className="flex-1 text-xs text-center py-2 text-neutral-500 flex items-center justify-center gap-1">
                        <Clock size={14} />
                        Mon-Sat 10AM-6PM
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ),
        document.body
      )}
    </>
  )
}
