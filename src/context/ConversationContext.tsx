/**
 * Conversation Context
 * Provides shared state and functions for conversation module
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConversationContextType, Contact } from '../types/conversationTypes';

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

interface ConversationProviderProps {
  children: ReactNode;
}

/**
 * ConversationProvider component
 * Wraps the app to provide conversation context
 */
export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const [isExecutiveTakeOverBoolean, setIsExecutiveTakeOverBoolean] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [contactDetails, setContactDetails] = useState<Contact>({
    name: '',
    phone_number: '',
  });
  const [isMessageSend, setIsMessageSend] = useState(false);
  const [indicator, setIndicator] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [totalConversationCount, setTotalConversationCount] = useState(0);
  const [showBotDetails, setShowBotDetails] = useState(false);

  const value: ConversationContextType = {
    isExecutiveTakeOverBoolean,
    setIsExecutiveTakeOverBoolean,
    agentName,
    setAgentName,
    aiSummary,
    setAiSummary,
    contactDetails,
    setContactDetails,
    isMessageSend,
    setIsMessageSend,
    indicator,
    setIndicator,
    showSummary,
    setShowSummary,
    totalConversationCount,
    setTotalConversationCount,
    showBotDetails,
    setShowBotDetails,
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};

/**
 * Hook to use conversation context
 * Must be called within ConversationProvider
 */
export const useConversation = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
};

export default ConversationContext;
