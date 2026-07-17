/**
 * Conversation Module Type Definitions
 * Unified types for WhatsApp and Email conversations
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum MessageContentType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
}

export enum MessageStatus {
  Pending = 'pending',
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read',
  Failed = 'failed',
}

export enum MessageSource {
  AI = 'AI',
  Executive = 'EXECUTIVE',
  Client = 'CLIENT',
  Agent = 'AGENT',
  User = 'user',
  Bot = 'bot',
}

export enum ButtonType {
  QuickReply = 'QUICK_REPLY',
  CopyCode = 'COPY_CODE',
  Url = 'URL',
  PhoneNumber = 'PHONE_NUMBER',
}

export enum ConversationType {
  WhatsApp = 'whatsapp',
  Email = 'email',
  SMS = 'sms',
}

// ============================================================================
// WHATSAPP TYPES
// ============================================================================

export interface Contact {
  id?: string;
  name: string;
  phone_number?: string | number;
  email?: string;
  created_at?: string;
  avatar?: string;
  full_name?: string;
}

export interface TemplateButton {
  type: string;
  text?: string;
  url?: string;
  phone_number?: string;
}

export interface TemplateComponent {
  type: 'header_values' | 'body_values' | 'footer_values';
  values: string[];
}

export interface MessageTemplate {
  header_text?: string;
  body_text?: string;
  footer_text?: string;
  media?: string;
  buttons?: TemplateButton[];
}

export interface BaseMessage {
  id: string;
  body?: string | null;
  type: MessageContentType | 'template' | string;
  status?: MessageStatus | string;
  source: MessageSource | string;
  created_at: string;
  media_path?: string;
  media_id?: string;
  filename?: string;
  isManuallyAdded?: boolean;
  emoji?: React.ReactNode | string;
  template?: MessageTemplate;
  template_components?: TemplateComponent[];
  meta_error?: Array<string | { message?: string }>;
  campaign_retry_count?: number;
  trail_id?: string;
}

export interface Message extends BaseMessage {
  contact?: Contact;
}

export interface LastMessage {
  id?: string;
  body?: string;
  type?: MessageContentType | 'template' | string;
  status?: MessageStatus | string;
  created_at?: string;
  filename?: string;
  template?: MessageTemplate;
  media_id?: string;
}

export interface Conversation {
  id: string;
  name?: string;
  phone_number?: string | number;
  email?: string;
  created_at?: string;
  is_executive_takeover: boolean;
  unread_count: number;
  current_agent?:
    | string
    | { id?: string; first_name?: string; last_name?: string; username?: string };
  executive_summary?: string | null;
  can_message_send: boolean;
  last_message?: LastMessage;
  contact: Contact;
  avatar?: string;
  meta_error?: Array<string | { message?: string }>;
  type?: string;
  collected_fields?: Record<string, unknown>;
  not_interested_count?: number;
  is_on_followup?: boolean;
  status?: { label?: string; value?: string } | string;
}

export interface IntegrationInfo {
  name?: string;
  phone_number?: string;
  email?: string;
  sender_name?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  data: T[];
  message?: string;
  next?: string | null;
  previous?: string | null;
  page?: number;
  page_size?: number;
  status?: boolean | number;
  integration_name_number?: IntegrationInfo;
  integration_email?: IntegrationInfo;
}

export interface MessagesResponse extends PaginatedResponse<BaseMessage> {}

export interface ConversationsResponse extends PaginatedResponse<Conversation> {}

// Socket message type
export interface SocketMessage {
  id?: string;
  name?: string;
  phone_number?: string | number;
  email?: string;
  created_at?: string;
  is_executive_takeover?: boolean;
  unread_count?: number;
  current_agent?: string;
  executive_summary?: string;
  can_message_send?: boolean;
  indicator?: boolean;
  type?: string;
  last_message?: LastMessage;
  meta_error?: Array<string | { message?: string }>;
  update_type?: 'ai_typing_indicator' | 'agent_update.update' | string;
}

export interface WebSocketNewMessage extends BaseMessage {
  update_type?: 'ai_typing_indicator';
  indicator?: boolean;
}

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface EmailAttachment {
  id: string;
  name: string;
  url?: string;
  size?: number;
  mime_type?: string;
  created_at?: string;
}

export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  created_at: string;
  attachments?: EmailAttachment[];
  is_read?: boolean;
}

export interface EmailConversation {
  id: string;
  email: string;
  subject: string;
  thread_id?: string;
  unread_count: number;
  created_at: string;
  emails?: Email[];
  is_executive_takeover?: boolean;
  current_agent?: string;
  last_message?: Email;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface ConversationContextType {
  isExecutiveTakeOverBoolean: boolean;
  setIsExecutiveTakeOverBoolean: (value: boolean) => void;
  agentName: string;
  setAgentName: (name: string) => void;
  aiSummary: string;
  setAiSummary: (summary: string) => void;
  contactDetails: Contact;
  setContactDetails: (contact: Contact) => void;
  isMessageSend: boolean;
  setIsMessageSend: (value: boolean) => void;
  indicator: boolean;
  setIndicator: (value: boolean) => void;
  showSummary: boolean;
  setShowSummary: (value: boolean) => void;
  totalConversationCount: number;
  setTotalConversationCount: (count: number) => void;
  showBotDetails: boolean;
  setShowBotDetails: (value: boolean) => void;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
  search?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ImagePreview {
  type: 'image' | 'video';
  path: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MessageFormData {
  body: string;
  media?: BaseMessage['media_path'];
  attachments?: EmailAttachment[];
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface ChatHeaderProps {
  conversationId: string;
  contact: Contact;
  isExecutiveTakeover: boolean;
  onBack: () => void;
  onToggleTakeover?: (value: boolean) => void;
  onShowDetails?: () => void;
}

export interface MessageBubbleProps {
  message: BaseMessage;
  isOwn: boolean;
  onDownload?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
  onLongPress?: (messageId: string) => void;
}

export interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onUploadMedia?: (file: File | Blob) => Promise<void>;
  isLoading?: boolean;
}

export interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onPress: (conversation: Conversation) => void;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SendMessageResponse {
  data: BaseMessage;
  message?: string;
}

export interface UploadMediaResponse {
  data: {
    media_path: string;
    media_id: string;
  };
  message?: string;
}

export interface ExecutiveTakeoverResponse {
  data: {
    is_executive_takeover: boolean;
  };
  message?: string;
}

export interface AISummaryResponse {
  data: {
    summary: string;
  };
  message?: string;
}
