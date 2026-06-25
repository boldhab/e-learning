import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Upload, X, AlertCircle, Paperclip } from 'lucide-react';
import messageService from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';

export default function PrivateChat() {
  const { contactId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadContacts();
  }, [user]);

  useEffect(() => {
    if (contactId || selectedContact) {
      loadMessages(contactId || selectedContact.id);
    }
  }, [contactId, selectedContact]);

  const loadContacts = async () => {
    try {
      const data = await messageService.getContacts();
      setContacts(data.contacts || []);

      if (contactId) {
        const contact = data.contacts.find((c) => c.id == contactId);
        if (contact) {
          setSelectedContact(contact);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
    }
  };

  const loadMessages = async (cId) => {
    try {
      setLoading(true);
      const data = await messageService.getMessages(cId);
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (50MB max for files)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('File type not allowed. Please upload images, PDF, Word, or Excel documents.');
        return;
      }

      setAttachment(file);
      setError(null);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachmentPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(file.name);
      }
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!selectedContact) {
      setError('Please select a contact');
      return;
    }

    if (!messageText.trim() && !attachment) {
      setError('Please enter a message or attach a file');
      return;
    }

    try {
      setSending(true);
      setError(null);
      await messageService.sendMessage(
        selectedContact.id,
        messageText.trim(),
        attachment
      );
      setMessageText('');
      setAttachment(null);
      setAttachmentPreview(null);
      await loadMessages(selectedContact.id);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen gap-4 bg-gray-50">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No contacts available
            </div>
          ) : (
            <div className="space-y-1">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left px-4 py-3 border-l-4 transition-colors ${
                    selectedContact?.id === contact.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {contact.profile_image && (
                      <img
                        src={contact.profile_image}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{contact.role}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              {selectedContact.profile_image && (
                <img
                  src={selectedContact.profile_image}
                  alt={selectedContact.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{selectedContact.name}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedContact.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {message.content && (
                        <p className="text-sm mb-2">{message.content}</p>
                      )}

                      {message.attachment_url && (
                        <div className="mt-2">
                          {message.attachment_type === 'image' ||
                          message.attachment_type?.startsWith('image/') ? (
                            <img
                              src={message.attachment_url}
                              alt="attachment"
                              className="max-w-xs rounded"
                            />
                          ) : (
                            <a
                              href={message.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 hover:underline ${
                                message.sender_id === user?.id
                                  ? 'text-blue-100'
                                  : 'text-blue-600'
                              }`}
                            >
                              <Paperclip className="w-4 h-4" />
                              Download File
                            </a>
                          )}
                        </div>
                      )}

                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border-t border-red-200 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Attachment Preview */}
            {attachmentPreview && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                {typeof attachmentPreview === 'string' &&
                !attachmentPreview.startsWith('data:') ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                    <span className="text-gray-700">📎 {attachmentPreview}</span>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={attachmentPreview}
                      alt="Preview"
                      className="max-w-xs max-h-32 rounded"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 bg-white"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sending}
                />

                <label className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                    disabled={sending}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                </label>

                <button
                  type="submit"
                  disabled={sending || (!messageText.trim() && !attachment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
