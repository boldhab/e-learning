import React from 'react';
import { studentMessagesData } from '../../services/mock/studentMockData';
import { MessageSquare, Search, SendHorizonal } from 'lucide-react';

const Messaging = () => {
  const activeThread = studentMessagesData.threads[0];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Messaging</h1>
          <p className="text-slate-500 mt-1">Communicate with instructors, classmates, and support.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 border border-primary-100 text-primary-700 text-sm font-semibold">
          <MessageSquare size={16} />
          {studentMessagesData.unreadCount} unread
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-2">
            {studentMessagesData.threads.map((thread, index) => (
              <button
                key={thread.id}
                type="button"
                className={`w-full text-left rounded-xl p-3 border transition-colors ${index === 0 ? 'bg-primary-50 border-primary-100' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-slate-800">{thread.name}</p>
                  <span className="text-[11px] text-slate-500">{thread.time}</span>
                </div>
                <p className="text-xs text-slate-500">{thread.role}</p>
                <p className="text-xs text-slate-600 mt-1 truncate">{thread.lastMessage}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col min-h-[520px]">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="font-bold text-slate-800">{activeThread.name}</p>
            <p className="text-xs text-slate-500">{activeThread.role}</p>
          </div>

          <div className="flex-1 p-6 space-y-4 bg-slate-50/70">
            <div className="max-w-md bg-white border border-slate-100 rounded-2xl p-3 text-sm text-slate-700">
              Please review the rubric before final submission.
            </div>
            <div className="max-w-md ml-auto bg-primary-600 text-white rounded-2xl p-3 text-sm">
              Got it, I will update the final section tonight.
            </div>
            <div className="max-w-md bg-white border border-slate-100 rounded-2xl p-3 text-sm text-slate-700">
              Great. Ping me if you need examples.
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center gap-3">
            <input
              type="text"
              placeholder="Write a message..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button className="px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors inline-flex items-center gap-2 font-semibold text-sm">
              <SendHorizonal size={16} />
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Messaging;
