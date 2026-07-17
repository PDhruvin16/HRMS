// @ts-nocheck
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Lead } from '../api/leadsApi';
import type { EmailCampaign, WhatsAppCampaign } from '../api/campaignsApi';
// Stub types locally to decouple context from deleted screen modules
export interface LeadStage {
  id: string;
  name: string;
  color?: string;
}

export interface WhatsAppButton {
  type: string;
  text: string;
  url?: string;
  phone_number?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: 'Approved' | 'Rejected' | string;
  language: string;
  category: string;
  headerType?: 'none' | 'text' | 'image' | 'video' | 'document';
  headerText?: string;
  body?: string;
  body_text?: string;
  media?: string;
  mediaUri?: string;
  footer?: string;
  footer_text?: string;
  header_text?: string;
  header_file_url?: string;
  buttons?: WhatsAppButton[];
  buttonCount: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  status: 'Synced' | string;
  subject: string;
  category: string;
  senderName?: string;
  replyTo?: string;
  body?: string;
  canBeSendFromWhatsapp?: boolean;
  createdAt: string;
  created_at: string;
}


// ─── Contact Type ─────────────────────────────────────────────────────────────
export interface AppContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  gradient: string[];
}

// ─── KnowledgeBase Type ───────────────────────────────────────────────────────
export interface AppKnowledgeBase {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  type: 'Files' | 'Text' | 'Website' | 'Q&A';
}

// ─── Context Type ─────────────────────────────────────────────────────────────
interface AppDataContextType {
  // Leads
  userLeads: Lead[];
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;

  // Lead Stages
  userLeadStages: LeadStage[];
  addLeadStage: (stage: LeadStage) => void;
  updateLeadStage: (stage: LeadStage) => void;

  // WhatsApp Campaigns
  userWhatsAppCampaigns: WhatsAppCampaign[];
  addWhatsAppCampaign: (campaign: WhatsAppCampaign) => void;
  updateWhatsAppCampaign: (campaign: WhatsAppCampaign) => void;

  // Email Campaigns
  userEmailCampaigns: EmailCampaign[];
  addEmailCampaign: (campaign: EmailCampaign) => void;
  updateEmailCampaign: (campaign: EmailCampaign) => void;

  // Contacts
  userContacts: AppContact[];
  addContact: (contact: AppContact) => void;
  updateContact: (contact: AppContact) => void;
  deleteContact: (id: string) => void;

  // Knowledge Base
  userKnowledgeBases: AppKnowledgeBase[];
  addKnowledgeBase: (kb: AppKnowledgeBase) => void;
  updateKnowledgeBase: (kb: AppKnowledgeBase) => void;

  // WhatsApp Templates
  userWhatsAppTemplates: WhatsAppTemplate[];
  addWhatsAppTemplate: (template: WhatsAppTemplate) => void;
  updateWhatsAppTemplate: (template: WhatsAppTemplate) => void;

  // Email Templates
  userEmailTemplates: EmailTemplate[];
  addEmailTemplate: (template: EmailTemplate) => void;
  updateEmailTemplate: (template: EmailTemplate) => void;
}

// ─── Context Creation ─────────────────────────────────────────────────────────
const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [userLeads, setUserLeads] = useState<Lead[]>([]);
  const [userLeadStages, setUserLeadStages] = useState<LeadStage[]>([]);
  const [userWhatsAppCampaigns, setUserWhatsAppCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [userEmailCampaigns, setUserEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [userContacts, setUserContacts] = useState<AppContact[]>([]);
  const [userKnowledgeBases, setUserKnowledgeBases] = useState<AppKnowledgeBase[]>([]);
  const [userWhatsAppTemplates, setUserWhatsAppTemplates] = useState<WhatsAppTemplate[]>([]);
  const [userEmailTemplates, setUserEmailTemplates] = useState<EmailTemplate[]>([]);

  // ─── Leads ────────────────────────────────────────────────────────────────
  const addLead = useCallback((lead: Lead) => {
    setUserLeads((prev) => [lead, ...prev]);
  }, []);

  const updateLead = useCallback((lead: Lead) => {
    setUserLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
  }, []);

  // ─── Lead Stages ──────────────────────────────────────────────────────────
  const addLeadStage = useCallback((stage: LeadStage) => {
    setUserLeadStages((prev) => [stage, ...prev]);
  }, []);

  const updateLeadStage = useCallback((stage: LeadStage) => {
    setUserLeadStages((prev) => prev.map((s) => (s.id === stage.id ? stage : s)));
  }, []);

  // ─── WhatsApp Campaigns ───────────────────────────────────────────────────
  const addWhatsAppCampaign = useCallback((campaign: WhatsAppCampaign) => {
    setUserWhatsAppCampaigns((prev) => [campaign, ...prev]);
  }, []);

  const updateWhatsAppCampaign = useCallback((campaign: WhatsAppCampaign) => {
    setUserWhatsAppCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? campaign : c)));
  }, []);

  // ─── Email Campaigns ──────────────────────────────────────────────────────
  const addEmailCampaign = useCallback((campaign: EmailCampaign) => {
    setUserEmailCampaigns((prev) => [campaign, ...prev]);
  }, []);

  const updateEmailCampaign = useCallback((campaign: EmailCampaign) => {
    setUserEmailCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? campaign : c)));
  }, []);

  // ─── Contacts ─────────────────────────────────────────────────────────────
  const addContact = useCallback((contact: AppContact) => {
    setUserContacts((prev) => [contact, ...prev]);
  }, []);

  const updateContact = useCallback((contact: AppContact) => {
    setUserContacts((prev) => prev.map((c) => (c.id === contact.id ? contact : c)));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setUserContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ─── Knowledge Base ───────────────────────────────────────────────────────
  const addKnowledgeBase = useCallback((kb: AppKnowledgeBase) => {
    setUserKnowledgeBases((prev) => [kb, ...prev]);
  }, []);

  const updateKnowledgeBase = useCallback((kb: AppKnowledgeBase) => {
    setUserKnowledgeBases((prev) => prev.map((k) => (k.id === kb.id ? kb : k)));
  }, []);

  // ─── WhatsApp Templates ───────────────────────────────────────────────────
  const addWhatsAppTemplate = useCallback((template: WhatsAppTemplate) => {
    setUserWhatsAppTemplates((prev) => [template, ...prev]);
  }, []);

  const updateWhatsAppTemplate = useCallback((template: WhatsAppTemplate) => {
    setUserWhatsAppTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
  }, []);

  // ─── Email Templates ──────────────────────────────────────────────────────
  const addEmailTemplate = useCallback((template: EmailTemplate) => {
    setUserEmailTemplates((prev) => [template, ...prev]);
  }, []);

  const updateEmailTemplate = useCallback((template: EmailTemplate) => {
    setUserEmailTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        userLeads,
        addLead,
        updateLead,
        userLeadStages,
        addLeadStage,
        updateLeadStage,
        userWhatsAppCampaigns,
        addWhatsAppCampaign,
        updateWhatsAppCampaign,
        userEmailCampaigns,
        addEmailCampaign,
        updateEmailCampaign,
        userContacts,
        addContact,
        updateContact,
        deleteContact,
        userKnowledgeBases,
        addKnowledgeBase,
        updateKnowledgeBase,
        userWhatsAppTemplates,
        addWhatsAppTemplate,
        updateWhatsAppTemplate,
        userEmailTemplates,
        addEmailTemplate,
        updateEmailTemplate,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};
