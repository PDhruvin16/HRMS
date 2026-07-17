/**
 * Conversation Module Constants
 * Shared constants for WhatsApp and Email conversations
 */

// ============================================================================
// PAGINATION CONSTANTS
// ============================================================================

export const CONVERSATION_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  CONVERSATION_PAGE_SIZE: 20,
  MESSAGE_PAGE_SIZE: 10,
  EMAIL_PAGE_SIZE: 20,
} as const;

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

export const CONVERSATION_TIMINGS = {
  TYPING_INDICATOR_TIMEOUT: 3000, // 3 seconds
  SOCKET_RECONNECT_DELAY: 5000, // 5 seconds
  DEBOUNCE_TYPING: 500, // 500ms
  DEBOUNCE_SEARCH: 300, // 300ms
  MESSAGE_LOAD_TIMEOUT: 30000, // 30 seconds
  FILE_UPLOAD_TIMEOUT: 60000, // 60 seconds
} as const;

// ============================================================================
// FILE UPLOAD CONSTANTS
// ============================================================================

export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50 MB
  MAX_DOCUMENT_SIZE: 25 * 1024 * 1024, // 25 MB
  MAX_AUDIO_SIZE: 15 * 1024 * 1024, // 15 MB
} as const;

export const ALLOWED_MEDIA_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
} as const;

// ============================================================================
// MESSAGE CONSTANTS
// ============================================================================

export const MESSAGE_CONTENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  TEMPLATE: 'template',
  STICKER: 'sticker',
} as const;

export const MESSAGE_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

export const MESSAGE_SOURCES = {
  AI: 'AI',
  EXECUTIVE: 'EXECUTIVE',
  CLIENT: 'CLIENT',
  AGENT: 'AGENT',
  USER: 'user',
  BOT: 'bot',
} as const;

export const BUTTON_TYPES = {
  QUICK_REPLY: 'QUICK_REPLY',
  COPY_CODE: 'COPY_CODE',
  URL: 'URL',
  PHONE_NUMBER: 'PHONE_NUMBER',
} as const;

// ============================================================================
// SOCKET EVENTS
// ============================================================================

export const SOCKET_EVENTS = {
  // Conversation events
  NEW_CONVERSATION: 'new_conversation',
  CONVERSATION_UPDATED: 'conversation_updated',
  CONVERSATION_DELETED: 'conversation_deleted',

  // Message events
  NEW_MESSAGE: 'new_message',
  MESSAGE_STATUS_CHANGED: 'message_status_changed',
  MESSAGE_DELETED: 'message_deleted',

  // Typing events
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  TYPING_INDICATOR: 'typing_indicator',

  // Status events
  AGENT_UPDATE: 'agent_update.update',
  EXECUTIVE_TAKEOVER: 'execute_takeover',
  AGENT_STATUS: 'agent_status',

  // AI events
  AI_TYPING_INDICATOR: 'ai_typing_indicator',
  AI_RESPONSE: 'ai_response',

  // General events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  RECONNECT: 'reconnect',
} as const;

// ============================================================================
// CONVERSATION TYPE CONSTANTS
// ============================================================================

export const CONVERSATION_TYPES = {
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SMS: 'sms',
  TELEGRAM: 'telegram',
  MESSENGER: 'messenger',
} as const;

// ============================================================================
// UI STATE CONSTANTS
// ============================================================================

export const UI_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  UPLOADING: 'uploading',
  SENDING: 'sending',
  SAVING: 'saving',
} as const;

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

export const LAYOUT_CONSTANTS = {
  SIDEBAR_WIDTH: 320,
  CHAT_HEADER_HEIGHT: 64,
  MESSAGE_INPUT_HEIGHT: 56,
  MIN_MESSAGE_BUBBLE_WIDTH: 100,
  MAX_MESSAGE_BUBBLE_WIDTH: 300,
  AVATAR_SIZE: 40,
  SMALL_AVATAR_SIZE: 32,
  LARGE_AVATAR_SIZE: 56,
  BORDER_RADIUS: 8,
  MESSAGE_BORDER_RADIUS: 12,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  SEND_MESSAGE_FAILED: 'Failed to send message. Please try again.',
  FETCH_MESSAGES_FAILED: 'Failed to load messages. Please try again.',
  FETCH_CONVERSATIONS_FAILED: 'Failed to load conversations. Please try again.',
  CONNECTION_LOST: 'Connection lost. Reconnecting...',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully.',
  FILE_UPLOADED: 'File uploaded successfully.',
  CONVERSATION_MARKED_READ: 'Conversation marked as read.',
  EXECUTIVE_TAKEOVER_ENABLED: 'Executive takeover enabled.',
  EXECUTIVE_TAKEOVER_DISABLED: 'Executive takeover disabled.',
} as const;

// ============================================================================
// PLACEHOLDER TEXTS
// ============================================================================

export const PLACEHOLDERS = {
  MESSAGE_INPUT: 'Type a message...',
  SEARCH_CONVERSATION: 'Search conversations...',
  EMAIL_SUBJECT: 'Email subject...',
  EMAIL_BODY: 'Type your email...',
  NO_CONVERSATIONS: 'No conversations yet',
  NO_MESSAGES: 'No messages yet',
} as const;

// ============================================================================
// DATE FORMAT CONSTANTS
// ============================================================================

export const DATE_FORMATS = {
  MESSAGE_TIME: 'HH:mm', // 14:30
  MESSAGE_DATE: 'MMM dd, yyyy', // Jan 15, 2024
  FULL_DATETIME: 'MMM dd, yyyy HH:mm', // Jan 15, 2024 14:30
  RELATIVE_TIME: 'relative', // 5 minutes ago
  CONVERSATION_TIME: 'relative', // 5 minutes ago, Yesterday, etc.
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX_PATTERNS = {
  PHONE_NUMBER: /^\+?[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/i,
  MENTION: /@[\w]+/g,
  HASHTAG: /#[\w]+/g,
  VARIABLE: /\{\{(\w+)\}\}/g,
} as const;

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

export const ANIMATION_DURATIONS = {
  SHORT: 200, // ms
  MEDIUM: 300, // ms
  LONG: 500, // ms
  VERY_LONG: 800, // ms
} as const;

export const ANIMATION_CONFIGS = {
  MESSAGE_SLIDE: {
    duration: ANIMATION_DURATIONS.MEDIUM,
    useNativeDriver: true,
  },
  FADE_IN: {
    duration: ANIMATION_DURATIONS.SHORT,
    useNativeDriver: true,
  },
  SCALE_IN: {
    duration: ANIMATION_DURATIONS.MEDIUM,
    useNativeDriver: true,
  },
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  LAST_ACTIVE_CONVERSATION: 'lastActiveConversation',
  MESSAGE_DRAFT: 'messageDraft',
  CONVERSATION_FILTER: 'conversationFilter',
  USER_PREFERENCES: 'userPreferences',
  CACHE_CONVERSATIONS: 'cacheConversations',
  CACHE_MESSAGES: 'cacheMessages',
} as const;

// ============================================================================
// TEST DATA
// ============================================================================

export const TEST_DATA = {
  SAMPLE_CONTACT: {
    id: '1',
    name: 'John Doe',
    phone_number: '+1234567890',
    email: 'john@example.com',
  },
  SAMPLE_MESSAGE: {
    id: '1',
    body: 'Hello, this is a test message',
    type: 'text',
    status: 'delivered',
    source: 'AGENT',
    created_at: new Date().toISOString(),
  },
} as const;
