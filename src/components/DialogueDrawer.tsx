import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, Download, Copy, Check, DollarSign, LogIn } from 'lucide-react';
import { EmailVerificationBanner } from './AuthCard';

export const DialogueDrawer: React.FC = () => {
  const {
    firebaseUser,
    isEmailVerified,
    isAdminAuthorized,
    isTechAuthorized,
    signInWithGoogle,
    setActiveView,
    dialogueDrawerOpen,
    setDialogueDrawerOpen,
    dialogueMessages,
    sendDialogueMessage,
    downloadDialogueTranscript,
    copyDialogueTranscript,
    activeDialogueThreadId,
    setActiveDialogueThreadId,
    currentRole,
    currentUser,
    customers,
    techAppointments
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [directPriceInput, setDirectPriceInput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!dialogueDrawerOpen) return null;

  const canSwitchThread = isAdminAuthorized || isTechAuthorized;
  const threadOptionsMap = new Map<string, { id: string; label: string; name: string }>();
  if (isAdminAuthorized) {
    customers.forEach((c) => {
      const loc = c.address ? c.address.split(',')[1]?.trim() || 'Sacramento' : 'Sacramento';
      threadOptionsMap.set(c.id, { id: c.id, name: c.name, label: `${c.name} (${loc})` });
    });
    dialogueMessages.forEach((m) => {
      if (m.threadId && !threadOptionsMap.has(m.threadId)) {
        threadOptionsMap.set(m.threadId, {
          id: m.threadId,
          name: m.customerName || 'Customer',
          label: `${m.customerName || 'Customer'} (Sacramento)`
        });
      }
    });
  } else if (isTechAuthorized) {
    techAppointments.forEach((a) => {
      if (a.customerId && !threadOptionsMap.has(a.customerId)) {
        threadOptionsMap.set(a.customerId, {
          id: a.customerId,
          name: a.customerName,
          label: `${a.customerName} (${a.scheduledDate})`
        });
      }
    });
    dialogueMessages.forEach((m) => {
      if (m.threadId && !threadOptionsMap.has(m.threadId)) {
        threadOptionsMap.set(m.threadId, {
          id: m.threadId,
          name: m.customerName || 'Assigned Client',
          label: `${m.customerName || 'Assigned Client'}`
        });
      }
    });
    if (firebaseUser && threadOptionsMap.size === 0) {
      threadOptionsMap.set(firebaseUser.uid, {
        id: firebaseUser.uid,
        name: currentUser.name || firebaseUser.displayName || 'Customer Account',
        label: currentUser.name || firebaseUser.displayName || 'My Thread'
      });
    }
  }
  const threadOptions = Array.from(threadOptionsMap.values());

  const targetThreadId = canSwitchThread
    ? (activeDialogueThreadId && (threadOptions.length === 0 || threadOptionsMap.has(activeDialogueThreadId))
        ? activeDialogueThreadId
        : threadOptions[0]?.id || firebaseUser?.uid || '')
    : firebaseUser?.uid || '';
  const currentThreadMessages = dialogueMessages.filter((m) => m.threadId === targetThreadId);
  const matchedOption = threadOptionsMap.get(targetThreadId);
  const activeCustomer = customers.find((c) => c.id === targetThreadId) || {
    id: targetThreadId,
    name:
      matchedOption?.name ||
      currentThreadMessages[0]?.customerName ||
      currentUser.name ||
      firebaseUser?.displayName ||
      'Customer Account',
    email: currentUser.email || firebaseUser?.email || '',
    phone: currentUser.phone || '',
    address: currentUser.address || 'Sacramento, CA'
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !isEmailVerified || !messageInput.trim()) return;

    const senderRole =
      currentRole === 'admin' && isAdminAuthorized
        ? 'admin'
        : currentRole === 'technician' && isTechAuthorized
        ? 'technician'
        : 'client';
    const senderName =
      senderRole === 'admin'
        ? 'Dispatch / Admin'
        : senderRole === 'technician'
        ? `${currentUser.name || firebaseUser.displayName || 'Field Tech'} (Field Technician)`
        : `${currentUser.name || firebaseUser.displayName || 'Customer'} (Homeowner)`;

    const priceNum = directPriceInput ? Number(directPriceInput) : undefined;

    await sendDialogueMessage(
      targetThreadId,
      activeCustomer.name,
      senderRole,
      senderName,
      messageInput.trim(),
      priceNum
    );

    setMessageInput('');
    setDirectPriceInput('');
  };

  const handleCopy = async () => {
    if (!targetThreadId) return;
    const success = await copyDialogueTranscript(targetThreadId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white text-[#222222] h-full shadow-2xl flex flex-col border-l border-[#E8EEF1] animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#F8F9F7] border-b border-[#E8EEF1] text-[#222222] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#E8EEF1] text-[#263F50] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-[#222222]">Dispatch &amp; Client Dialogue</h3>
                <span className="text-[10px] bg-[#E8EEF1] text-[#263F50] px-2 py-0.5 rounded-full font-bold">
                  Persistent
                </span>
              </div>
              <div className="text-[11px] text-[#555555]">
                {firebaseUser ? `Thread: ${activeCustomer.name}` : 'Sign in required'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setDialogueDrawerOpen(false)}
            className="p-2 rounded-full hover:bg-[#E8EEF1] text-[#555555] hover:text-[#222222] transition-colors cursor-pointer"
            aria-label="Close dialogue drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!firebaseUser ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-[#F8F9F7]">
            <MessageSquare className="w-10 h-10 text-[#9FB2BE]" />
            <div className="space-y-1 max-w-xs">
              <h4 className="font-bold text-sm text-[#222222]">Sign In for Dispatch Dialogue</h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                Sign in with your verified customer or dispatch account to view saved transcripts and message our Sacramento team.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => {
                  void signInWithGoogle('customer');
                }}
                className="btn-rounded w-full py-2.5 bg-[#263F50] hover:bg-[#1A2E3D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDialogueDrawerOpen(false);
                  setActiveView('customer_portal');
                }}
                className="btn-rounded w-full py-2.5 bg-white hover:bg-[#E8EEF1] text-[#263F50] border border-[#D5E0E6] text-xs font-semibold cursor-pointer"
              >
                Sign In with Email / Password
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Action Bar: Thread selection & Export Actions */}
            <div className="p-3 bg-white border-b border-[#E8EEF1] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[#555555] font-semibold">Thread:</span>
                {canSwitchThread && threadOptions.length > 0 ? (
                  <select
                    value={targetThreadId}
                    onChange={(e) => setActiveDialogueThreadId(e.target.value)}
                    className="bg-[#F8F9F7] border border-[#E8EEF1] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#222222] focus:outline-none"
                  >
                    {threadOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="bg-[#F8F9F7] border border-[#E8EEF1] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#222222]">
                    {activeCustomer.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="btn-rounded px-2.5 py-1 bg-[#F8F9F7] hover:bg-[#E8EEF1] text-[#222222] font-semibold border border-[#E8EEF1] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy entire conversation"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#263F50]" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => downloadDialogueTranscript(targetThreadId)}
                  className="btn-rounded px-2.5 py-1 bg-[#263F50] hover:bg-[#1A2E3D] text-white font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  title="Download text transcript"
                >
                  <Download className="w-3 h-3" />
                  <span>Export .txt</span>
                </button>
              </div>
            </div>

            {!isEmailVerified && (
              <div className="px-3 pt-2">
                <EmailVerificationBanner compact />
              </div>
            )}

            {/* Messages List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9F7]">
              {currentThreadMessages.length === 0 ? (
                <div className="text-center py-12 text-[#777777] space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-[#AAAAAA]" />
                  <p className="text-xs font-medium">No previous dialogue recorded for this customer.</p>
                  <p className="text-[11px] text-[#888888]">Start a message below to log questions or price updates.</p>
                </div>
              ) : (
                currentThreadMessages.map((msg) => {
                  const isMe =
                    (currentRole === 'customer' && msg.senderRole === 'client') ||
                    (currentRole === 'technician' && msg.senderRole === 'technician') ||
                    (currentRole === 'admin' && msg.senderRole === 'admin');

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#777777] mb-1 px-1">
                        <span className="font-semibold text-[#222222]">{msg.senderName}</span>
                        <span>·</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                          msg.senderRole === 'admin'
                            ? 'bg-[#263F50] text-white rounded-tr-xs'
                            : msg.senderRole === 'technician'
                            ? 'bg-[#E8EEF1] text-[#222222] rounded-tl-xs border border-[#D5E0E6]'
                            : 'bg-white text-[#222222] border border-[#E8EEF1] rounded-tl-xs'
                        }`}
                      >
                        <p>{msg.message}</p>

                        {msg.directPrice !== undefined && (
                          <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between gap-3 text-[11px] font-bold">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Direct Price Locked:</span>
                            </span>
                            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-lg">
                              ${msg.directPrice}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-[#E8EEF1] space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[11px] text-[#777777]">
                <span>
                  Replying as:{' '}
                  <strong className="text-[#263F50] capitalize">
                    {currentRole === 'admin' && isAdminAuthorized
                      ? 'Owner / Dispatch'
                      : currentRole === 'technician' && isTechAuthorized
                      ? 'Field Tech'
                      : 'Customer'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={!isEmailVerified}
                  placeholder={isEmailVerified ? 'Type message, inquiry, or update...' : 'Verify email to send messages...'}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl border border-[#E8EEF1] text-xs bg-[#F8F9F7] text-[#222222] focus:ring-2 focus:ring-[#263F50] focus:outline-none disabled:opacity-60"
                  required
                />

                {currentRole === 'admin' && isAdminAuthorized && (
                  <div className="w-24 relative">
                    <span className="absolute left-2.5 top-2.5 text-xs text-[#777777] font-bold">$</span>
                    <input
                      type="number"
                      value={directPriceInput}
                      onChange={(e) => setDirectPriceInput(e.target.value)}
                      placeholder="Price"
                      className="w-full pl-6 pr-2 py-2.5 rounded-2xl border border-[#E8EEF1] text-xs font-bold text-[#263F50] bg-[#F8F9F7] focus:outline-none"
                      title="Direct locked price quote"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isEmailVerified}
                  className="btn-rounded p-2.5 bg-[#263F50] hover:bg-[#1A2E3D] text-white shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  aria-label="Send dialogue message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
