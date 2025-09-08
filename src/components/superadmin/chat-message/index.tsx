'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Message {
  content: string;
  timestamp: string;
  from: string;
  type: string;
}

interface Conversation {
  session_id: string;
  created_at: string;
  last_message: string;
  meta: {
    nickname?: string;
    email?: string;
  };
  unread?: number;
  status: string;
}

export default function ChatMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`/api/chat-messages?page=${page}`);
        const data = await response.json();
        if (data.success) {
          setConversations(data.conversations.data || []);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [page]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/chat-messages?sessionId=${selectedConversation}`);
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages.data || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F7B730]"></div>
      </div>
    );
  }
  console.log(conversations)
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chat Messages</h1>
        <div className="text-sm text-gray-500">
          {conversations.length} Active Conversations
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {conversations.map((conv) => (
              <div
                key={conv.session_id}
                onClick={() => setSelectedConversation(conv.session_id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 hover:shadow-md ${
                  selectedConversation === conv.session_id
                    ? 'bg-[#F7B730] text-white shadow-md scale-[0.98]'
                    : 'hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">
                    {conv.meta.nickname || conv.meta.email || 'Anonymous'}
                  </div>
                  {conv.unread && conv.unread > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold min-w-[20px] text-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="text-sm opacity-75 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${conv.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {format(new Date(conv.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedConversation ? 
                conversations.find(c => c.session_id === selectedConversation)?.meta.nickname || 
                conversations.find(c => c.session_id === selectedConversation)?.meta.email || 
                'Anonymous'
              : 'Messages'}
            </h2>
            {selectedConversation && (
              <div className="text-sm text-gray-500">
                {messages.length} messages
              </div>
            )}
          </div>
          {selectedConversation ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.from === 'operator' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-xl shadow-sm max-w-[70%] ${
                        msg.from === 'operator'
                          ? 'bg-[#F7B730] text-white'
                          : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm">
                          {msg.from === 'operator' ? 'Admin' : 'User'}
                        </div>
                        <div className="text-xs opacity-75">
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </div>
                      </div>
                      <div className="break-words">{msg.content}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4 bg-gray-50">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newMessage.trim() || sending) return;
                    
                    try {
                      setSending(true);
                      const response = await fetch('/api/chat-messages/send', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          sessionId: selectedConversation,
                          message: newMessage.trim()
                        }),
                      });

                      if (response.ok) {
                        setNewMessage('');
                        // Refresh messages
                        const refreshResponse = await fetch(`/api/chat-messages?sessionId=${selectedConversation}`);
                        const data = await refreshResponse.json();
                        if (data.success) {
                          setMessages(data.messages.data || []);
                        }
                      }
                    } catch (error) {
                      console.error('Error sending message:', error);
                    } finally {
                      setSending(false);
                    }
                  }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#F7B730] focus:border-transparent pr-12 transition-all duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className={`px-6 py-3 bg-[#F7B730] text-white rounded-xl font-medium transition-all duration-200
                      ${(!newMessage.trim() || sending) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-[#e5a835] hover:shadow-md active:scale-95'}`}
                  >
                    {sending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending</span>
                      </div>
                    ) : (
                      'Send'
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
