import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCheck,
  ChevronLeft,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import messageService from '../../services/messageService';

const POLL_INTERVAL = 3000;

/* ─────────────────────────────────────────────────────────────── */
/*  Helpers                                                          */
/* ─────────────────────────────────────────────────────────────── */

/**
 * Returns a human-readable subtitle for a conversation item.
 */
function groupSubtitle(conv) {
  const parts = [];
  if (conv.subject_name) parts.push(conv.subject_name);
  if (conv.class_name)   parts.push(conv.class_name);

  if (conv.group_kind === 'super')          return 'All Students · Global';
  if (conv.group_kind === 'teacher_created') {
    return parts.length > 0 ? parts.join(' · ') : (conv.course_title || 'Course Discussion Group');
  }
  return parts.length > 0 ? parts.join(' · ') : 'Class Discussion Group';
}

/**
 * Returns the accent colour class set for a group badge.
 */
function groupColour(conv) {
  if (conv.group_kind === 'super')           return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
  if (conv.group_kind === 'teacher_created') return { bg: 'bg-amber-100',   text: 'text-amber-600'   };
  return { bg: 'bg-indigo-100', text: 'text-indigo-600' };
}

/* ─────────────────────────────────────────────────────────────── */
/*  Sub-components                                                   */
/* ─────────────────────────────────────────────────────────────── */

const EmptyPanel = ({ label }) => (
  <div className="text-center py-10 opacity-40">
    <MessageSquare className="mx-auto mb-2" size={32} />
    <p className="text-xs font-bold">{label}</p>
  </div>
);

const ConversationItem = ({ conv, isActive, onClick }) => {
  const { bg, text } = groupColour(conv);
  const subtitle      = groupSubtitle(conv);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${
        isActive ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${bg} ${text}`}>
        <Users size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-black text-sm truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
          {conv.contact_name}
        </h4>
        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{subtitle}</p>
        {/* Subject + class badge row */}
        {(conv.subject_name || conv.class_name) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {conv.subject_name && (
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                {conv.subject_name}
              </span>
            )}
            {conv.class_name && (
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                {conv.class_name}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({ msg, isMe, isGroup }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
    <div className="max-w-[85%] md:max-w-[70%] space-y-1">
      {isGroup && !isMe && (
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-2 mb-1">
          {msg.sender_name} <span className="text-slate-300">· {msg.sender_role}</span>
        </p>
      )}
      <div
        className={`p-4 md:px-6 md:py-4 rounded-[1.8rem] text-sm font-medium leading-relaxed ${
          isMe
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-white text-slate-700 shadow-sm rounded-tl-none border border-slate-50'
        }`}
      >
        {msg.content && <p className={msg.attachment_url ? 'mb-3' : ''}>{msg.content}</p>}
        {msg.attachment_url && (
          <a href={msg.attachment_url} target="_blank" rel="noreferrer">
            <img
              src={msg.attachment_url}
              alt="Message attachment"
              className="max-h-72 w-full rounded-2xl object-cover"
            />
          </a>
        )}
      </div>
      <div
        className={`flex items-center gap-2 text-[10px] font-bold text-slate-300 ${
          isMe ? 'justify-end pr-2' : 'pl-2'
        }`}
      >
        <span>
          {new Date(String(msg.created_at).replace(' ', 'T')).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {isMe && !isGroup &&
          (Number(msg.is_read) === 1 || msg.is_read === true ? (
            <CheckCheck size={12} className="text-indigo-400" />
          ) : (
            <Check size={12} />
          ))}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────── */
/*  Chat header                                                      */
/* ─────────────────────────────────────────────────────────────── */
const ChatHeader = ({ activeContact, onBack }) => {
  const { bg, text } = groupColour(activeContact);
  const subtitle      = groupSubtitle(activeContact);

  return (
    <div className="bg-white p-4 md:px-8 md:py-5 border-b border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${bg} ${text}`}>
          <Users size={22} />
        </div>
        <div>
          <h3 className="font-black text-slate-900 leading-tight">{activeContact.contact_name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            {subtitle}
          </p>
          {/* Metadata chips */}
          {(activeContact.subject_name || activeContact.class_name || activeContact.course_title) && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {activeContact.subject_name && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
                  <BookOpen size={9} />
                  {activeContact.subject_name}
                </span>
              )}
              {activeContact.class_name && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg">
                  <GraduationCap size={9} />
                  {activeContact.class_name}
                </span>
              )}
              {activeContact.course_title && !activeContact.subject_name && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">
                  {activeContact.course_title}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/*  Main page                                                        */
/* ─────────────────────────────────────────────────────────────── */
const Messaging = () => {
  const { user }                              = useAuth();
  const [conversations, setConversations]     = useState([]);
  const [activeContact, setActiveContact]     = useState(null);
  const [messages, setMessages]               = useState([]);
  const [newMessage, setNewMessage]           = useState('');
  const [search, setSearch]                   = useState('');
  const [attachment, setAttachment]           = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('');
  const [loading, setLoading]                 = useState(true);
  const [sending, setSending]                 = useState(false);
  const fileInputRef                          = useRef(null);
  const chatEndRef                            = useRef(null);

  const activeContactId = activeContact?.contact_id || activeContact?.id || null;

  /* ── Data loading ───────────────────────────────────────────── */

  const loadSidebarData = async () => {
    const convs      = await messageService.getConversations();
    const groupsOnly = convs.filter((item) => item.is_group);
    setConversations(groupsOnly);
  };

  const loadMessages = async (contactId) => {
    if (!contactId) { setMessages([]); return; }
    const data = await messageService.getMessages(contactId);
    setMessages(data);
  };

  useEffect(() => {
    const init = async () => {
      try { await loadSidebarData(); }
      catch (error) { console.error('Messaging init error:', error); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  /* Sidebar polling */
  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(async () => {
      if (!cancelled) {
        try { await loadSidebarData(); } catch { /* noop */ }
      }
    }, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  /* Auto-select first conversation */
  useEffect(() => {
    if (!activeContact && conversations.length > 0) setActiveContact(conversations[0]);
  }, [activeContact, conversations]);

  /* Message polling */
  useEffect(() => {
    if (!activeContactId) return undefined;
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await messageService.getMessages(activeContactId);
        if (!cancelled) setMessages(data);
      } catch { /* noop */ }
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeContactId]);

  /* Scroll to bottom */
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* Cleanup blob URL */
  useEffect(() => () => { if (attachmentPreview) URL.revokeObjectURL(attachmentPreview); }, [attachmentPreview]);

  /* ── Filtering ──────────────────────────────────────────────── */

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((item) =>
      `${item.contact_name || ''} ${item.subject_name || ''} ${item.class_name || ''} ${item.course_title || ''} ${item.group_kind || ''}`
        .toLowerCase()
        .includes(term)
    );
  }, [conversations, search]);

  /* ── Attachment helpers ─────────────────────────────────────── */

  const resetAttachment = () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachment(null);
    setAttachmentPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectAttachment = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.alert('Please choose an image file.');
      event.target.value = '';
      return;
    }
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachment(file);
    setAttachmentPreview(URL.createObjectURL(file));
  };

  const handleOpenConversation = async (contact) => {
    setActiveContact(contact);
    resetAttachment();
    try { await loadMessages(contact.contact_id || contact.id); }
    catch (error) { console.error('Conversation load error:', error); }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!activeContactId || sending || (!newMessage.trim() && !attachment)) return;
    try {
      setSending(true);
      await messageService.sendMessage(activeContactId, newMessage.trim(), attachment);
      setNewMessage('');
      resetAttachment();
      await Promise.all([loadMessages(activeContactId), loadSidebarData()]);
    } catch (error) {
      console.error('Send error:', error);
      window.alert(error?.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  /* ── Loading state ──────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold">Connecting to discussion groups…</p>
      </div>
    );
  }

  const pageLabel = user?.role === 'teacher' ? 'Class Discussion' : 'Discussion Groups';

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto h-[calc(100vh-140px)] animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl h-full flex overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-50 flex flex-col ${
            activeContact ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-6 border-b border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{pageLabel}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Your class &amp; subject groups
                </p>
              </div>
              <div className="px-3 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                Live
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, subject, class…"
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
              Discussion Groups
            </p>
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.contact_id}
                conv={conv}
                isActive={activeContactId === conv.contact_id}
                onClick={() => handleOpenConversation(conv)}
              />
            ))}
            {filteredConversations.length === 0 && (
              <EmptyPanel label="No discussion groups available" />
            )}
          </div>
        </div>

        {/* ── Chat area ───────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
          {activeContact ? (
            <>
              <ChatHeader activeContact={activeContact} onBack={() => setActiveContact(null)} />

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isMe={Number(msg.sender_id) === Number(user.id)}
                      isGroup
                    />
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <MessageSquare className="mx-auto mb-3" size={40} />
                      <p className="font-bold">Start the group discussion.</p>
                      {activeContact.subject_name && (
                        <p className="text-sm font-medium mt-1 text-slate-300">
                          Topic: {activeContact.subject_name}
                          {activeContact.class_name ? ` · ${activeContact.class_name}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 md:p-8 bg-white border-t border-slate-50">
                {attachmentPreview && (
                  <div className="mb-4 inline-flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                    <img src={attachmentPreview} alt="Selected attachment" className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="pt-1">
                      <p className="text-sm font-black text-slate-800">{attachment?.name}</p>
                      <p className="text-xs text-slate-400 font-bold mt-1">Photo will be sent to this group.</p>
                    </div>
                    <button type="button" onClick={resetAttachment} className="text-slate-400 hover:text-slate-700">
                      <X size={16} />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-50 rounded-3xl p-2 pr-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 shrink-0 bg-white text-slate-500 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    title="Attach photo"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleSelectAttachment} className="hidden" />
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask a question, share materials, or start a discussion…"
                    className="flex-1 bg-transparent border-none py-3 px-2 text-sm font-bold placeholder:text-slate-400 focus:ring-0"
                  />
                  <button
                    type="submit"
                    disabled={sending || (!newMessage.trim() && !attachment)}
                    className="w-12 h-12 shrink-0 bg-indigo-600 disabled:bg-slate-300 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-indigo-600 mb-4">
                <MessageSquare size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Discussion Center</h2>
              <p className="text-slate-400 font-medium max-w-md">
                Select a discussion group from the sidebar to join the conversation. Groups are organised
                by class and subject so you always know where to ask questions or share materials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
