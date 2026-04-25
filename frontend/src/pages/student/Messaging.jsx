import { useState, useRef, useEffect } from 'react';
import { studentMessagesData } from '../../services/mock/studentMockData';
import { 
  MessageSquare, 
  Search, 
  SendHorizonal, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Image,
  File,
  Clock,
  X,
  ArrowLeft,
  Reply,
  Copy
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const Messaging = () => {
  const [selectedThread, setSelectedThread] = useState(studentMessagesData.threads[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [messages, setMessages] = useState(studentMessagesData.messages || [
    {
      id: 1,
      text: "Please review the rubric before final submission.",
      sender: "teacher",
      time: "10:30 AM",
      timestamp: "2024-12-17T10:30:00",
      read: true,
      delivered: true
    },
    {
      id: 2,
      text: "Got it, I will update the final section tonight.",
      sender: "student",
      time: "10:32 AM",
      timestamp: "2024-12-17T10:32:00",
      read: true,
      delivered: true
    },
    {
      id: 3,
      text: "Great. Ping me if you need examples.",
      sender: "teacher",
      time: "10:35 AM",
      timestamp: "2024-12-17T10:35:00",
      read: true,
      delivered: true
    },
    {
      id: 4,
      text: "Here's a sample project structure you can reference:",
      sender: "teacher",
      time: "10:36 AM",
      timestamp: "2024-12-17T10:36:00",
      read: true,
      delivered: true,
      attachment: {
        type: "file",
        name: "sample-project.zip",
        size: "2.4 MB"
      }
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: "student",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Simulate teacher response after 2 seconds
    setTimeout(() => {
      const responseMsg = {
        id: messages.length + 2,
        text: "Thanks for your message! I'll review it shortly.",
        sender: "teacher",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        read: false,
        delivered: true
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileMsg = {
        id: messages.length + 1,
        text: `Sent a file: ${file.name}`,
        sender: "student",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        read: false,
        delivered: true,
        attachment: {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
        }
      };
      setMessages([...messages, fileMsg]);
    }
  };

  const filteredThreads = studentMessagesData.threads.filter(thread =>
    thread.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = studentMessagesData.threads.reduce((total, thread) => total + (thread.unread || 0), 0);

  const getMessageStatusIcon = (message) => {
    if (message.read) return <CheckCheck size={14} className="text-emerald-500" />;
    if (message.delivered) return <Check size={14} className="text-slate-400" />;
    return <Clock size={14} className="text-slate-400" />;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Messages</h1>
          <p className="text-slate-500 mt-1">Connect with teachers and classmates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" leftIcon={<MessageSquare size={16} />}>
            New Message
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold">
            <MessageSquare size={16} />
            {unreadCount} unread
          </div>
        </div>
      </div>

      {/* Main Messaging Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* Conversations List */}
        <Card variant="white" padding="none" className="overflow-hidden h-full flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`
                  w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50
                  ${selectedThread?.id === thread.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-500' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {thread.avatar || thread.name.charAt(0)}
                    </div>
                    {thread.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-slate-800 truncate">{thread.name}</p>
                      <span className="text-xs text-slate-400 flex-shrink-0">{thread.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{thread.role}</p>
                    <p className="text-xs text-slate-600 mt-1 truncate">{thread.lastMessage}</p>
                  </div>
                  
                  {thread.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{thread.unread}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <Card variant="white" padding="none" className="lg:col-span-2 h-full flex flex-col">
          
          {/* Chat Header */}
          {selectedThread && (
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {selectedThread.avatar || selectedThread.name.charAt(0)}
                  </div>
                  {selectedThread.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selectedThread.name}</p>
                  <p className="text-xs text-slate-500">
                    {selectedThread.online ? 'Online' : 'Offline'} • {selectedThread.role}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Phone size={18} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Video size={18} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Info size={18} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical size={18} className="text-slate-600" />
                </button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message, index) => {
              const isTeacher = message.sender === 'teacher';
              const showAvatar = index === 0 || messages[index - 1]?.sender !== message.sender;
              
              return (
                <div key={message.id} className={`flex ${isTeacher ? 'justify-start' : 'justify-end'} group`}>
                  <div className={`flex gap-2 max-w-[70%] ${isTeacher ? 'flex-row' : 'flex-row-reverse'}`}>
                    {isTeacher && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {selectedThread?.name?.charAt(0) || 'T'}
                      </div>
                    )}
                    
                    <div>
                      <div className={`relative rounded-2xl p-3 ${
                        isTeacher 
                          ? 'bg-white border border-slate-100 text-slate-700' 
                          : 'bg-indigo-600 text-white'
                      }`}>
                        {/* Reply Indicator */}
                        {message.replyTo && (
                          <div className={`text-xs mb-1 pb-1 border-b ${isTeacher ? 'border-slate-200' : 'border-indigo-500'}`}>
                            <span className="opacity-75">Replying to: {message.replyTo}</span>
                          </div>
                        )}
                        
                        {/* Message Text */}
                        <p className="text-sm">{message.text}</p>
                        
                        {/* Attachment */}
                        {message.attachment && (
                          <div className={`mt-2 p-2 rounded-lg ${isTeacher ? 'bg-slate-50' : 'bg-indigo-500'}`}>
                            <div className="flex items-center gap-2">
                              {message.attachment.type === 'image' ? (
                                <Image size={16} />
                              ) : (
                                <File size={16} />
                              )}
                              <span className="text-xs">{message.attachment.name}</span>
                              <span className="text-xs opacity-75">({message.attachment.size})</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Message Actions (Hover) */}
                        <div className={`absolute top-1/2 transform -translate-y-1/2 hidden group-hover:flex gap-1 ${
                          isTeacher ? '-right-12' : '-left-12'
                        }`}>
                          <button className="p-1 bg-white rounded-full shadow-sm hover:bg-slate-50">
                            <Reply size={12} className="text-slate-500" />
                          </button>
                          <button className="p-1 bg-white rounded-full shadow-sm hover:bg-slate-50">
                            <Copy size={12} className="text-slate-500" />
                          </button>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 mt-1 text-xs ${isTeacher ? 'justify-start' : 'justify-end'}`}>
                        <span className="text-slate-400">{message.time}</span>
                        {!isTeacher && getMessageStatusIcon(message)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Area */}
          <div className="p-4 border-t border-slate-100">
            {replyingTo && (
              <div className="mb-3 p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-600">Replying to {replyingTo}</span>
                </div>
                <button onClick={() => setReplyingTo(null)}>
                  <X size={14} className="text-slate-400" />
                </button>
              </div>
            )}
            
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Smile size={20} className="text-slate-500" />
                </button>
                
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Paperclip size={20} className="text-slate-500" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-lg"
                  leftIcon={<SendHorizonal size={18} />}
                >
                  Send
                </Button>
              </div>
            </div>
            
            {/* Typing Indicator */}
            <div className="mt-2">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                <span className="ml-1">Teacher is typing...</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Messaging;