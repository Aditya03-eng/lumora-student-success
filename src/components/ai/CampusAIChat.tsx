import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  User,
  ArrowRight,
  ExternalLink,
  CalendarCheck,
  UserPlus,
  AlertTriangle,
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { Student, ChatMessage, ChatAction, NavItem } from '../../types';
import {
  processCampusAIQuery,
  SUGGESTED_QUESTIONS,
  STUDENT_CONTEXT_QUICK_ACTIONS,
} from '../../services/campusAI';

interface CampusAIChatProps {
  initialStudentContext?: Student | null;
  onClearContext?: () => void;
  onSelectStudent?: (student: Student) => void;
  onNavigateTab?: (tab: NavItem) => void;
  onScheduleMock?: (student: Student) => void;
  onAssignMentor?: (student: Student) => void;
  isFloatingMode?: boolean;
  onCloseFloating?: () => void;
  onExpandToFullPage?: () => void;
  initialQuery?: string;
}

export const CampusAIChat: React.FC<CampusAIChatProps> = ({
  initialStudentContext,
  onClearContext,
  onSelectStudent,
  onNavigateTab,
  onScheduleMock,
  onAssignMentor,
  isFloatingMode = false,
  onCloseFloating,
  onExpandToFullPage,
  initialQuery,
}) => {
  const [activeStudentContext, setActiveStudentContext] = useState<Student | null>(
    initialStudentContext || null
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `### Welcome to Lumora AI\n\nI am your **Student Success Copilot**, connected directly to the institutional analytics dataset of 4,000 students and faculty mentors.\n\nAsk me anything regarding campus risk patterns, departmental benchmarks, coding performance, mock interview pipelines, or specific student diagnostic profiles.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync context when prop changes
  useEffect(() => {
    if (initialStudentContext) {
      setActiveStudentContext(initialStudentContext);
    }
  }, [initialStudentContext]);

  // Execute initial query if supplied
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
    }
  }, [initialQuery]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      // Simulate realistic analytical thinking delay (350ms - 600ms)
      const [aiResponse] = await Promise.all([
        processCampusAIQuery(query, activeStudentContext),
        new Promise((resolve) => setTimeout(resolve, 450)),
      ]);

      const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse.text,
        timestamp: aiTimestamp,
        actions: aiResponse.actions,
        tableData: aiResponse.tableData,
        relatedStudents: aiResponse.relatedStudents,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Campus AI processing error:', err);
      const errorMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'An error occurred while querying the campus dataset. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `### Conversation Cleared\n\nLumora AI is ready. You can ask university-wide questions or inspect specific student diagnostic telemetry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleActionClick = (action: ChatAction) => {
    switch (action.type) {
      case 'view_student':
        if (action.payload && onSelectStudent) {
          onSelectStudent(action.payload as Student);
        }
        break;
      case 'navigate_tab':
        if (action.payload && onNavigateTab) {
          onNavigateTab(action.payload as NavItem);
        }
        break;
      case 'schedule_mock':
        if (action.payload && onScheduleMock) {
          onScheduleMock(action.payload as Student);
        } else if (onNavigateTab) {
          onNavigateTab('mock_interviews');
        }
        break;
      case 'assign_mentor':
        if (action.payload && onAssignMentor) {
          onAssignMentor(action.payload as Student);
        } else if (onNavigateTab) {
          onNavigateTab('mentors');
        }
        break;
      case 'view_recommendations':
        if (onNavigateTab) {
          onNavigateTab('recommendations');
        }
        break;
      case 'query':
        if (typeof action.payload === 'string') {
          handleSendMessage(action.payload);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`flex flex-col bg-[#0A0F1A] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl text-[#F5F7FA] ${
        isFloatingMode ? 'h-full w-full' : 'h-[calc(100vh-140px)] w-full'
      }`}
    >
      {/* ================= HEADER ================= */}
      <div className="bg-[#111827] border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-sm">
            <img src="/lumora-logo.png" alt="Lumora AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#F5F7FA] tracking-tight">Lumora AI</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6EA8FE]/10 text-[#6EA8FE] border border-[#6EA8FE]/20 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6FCF97] animate-pulse" />
                Student Success Copilot
              </span>
            </div>
            <p className="text-[11px] text-[#8F9BAD]">
              Dataset-backed institutional intelligence • 4,000 verified students
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleClearConversation}
            title="Clear Conversation"
            className="p-1.5 rounded-lg bg-[#222936] hover:bg-[#2B3344] text-[#AAB2C0] hover:text-[#F1F3F5] border border-[#262E3D] transition-colors text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>

          {isFloatingMode && onExpandToFullPage && (
            <button
              onClick={onExpandToFullPage}
              title="Expand to Full Page"
              className="p-1.5 rounded-lg bg-[#222936] hover:bg-[#2B3344] text-[#AAB2C0] hover:text-[#6EA8FE] border border-[#262E3D] transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {isFloatingMode && onCloseFloating && (
            <button
              onClick={onCloseFloating}
              title="Close Assistant"
              className="p-1.5 rounded-lg bg-[#222936] hover:bg-[#2E1A1D] text-[#AAB2C0] hover:text-[#EB5757] border border-[#262E3D] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ================= ACTIVE CONTEXT BAR (IF STUDENT CONTEXT IS SET) ================= */}
      {activeStudentContext && (
        <div className="bg-[#182338] border-b border-[#253A5E] px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-[#6EA8FE] tracking-wider">
              Student Focus:
            </span>
            <span className="font-semibold text-[#F1F3F5]">{activeStudentContext.name}</span>
            <span className="text-[11px] text-[#AAB2C0]">
              ({activeStudentContext.department} • {activeStudentContext.student_id})
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                activeStudentContext.predicted_risk_level === 'High'
                  ? 'bg-[#2E1A1D] text-[#EB5757]'
                  : activeStudentContext.predicted_risk_level === 'Medium'
                  ? 'bg-[#2B2616] text-[#F2C94C]'
                  : 'bg-[#162722] text-[#6FCF97]'
              }`}
            >
              {activeStudentContext.predicted_risk_level} Risk
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onSelectStudent && (
              <button
                onClick={() => onSelectStudent(activeStudentContext)}
                className="text-[11px] text-[#6EA8FE] hover:underline flex items-center gap-1"
              >
                View Profile
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => {
                setActiveStudentContext(null);
                if (onClearContext) onClearContext();
              }}
              title="Clear Student Context"
              className="p-1 text-[#AAB2C0] hover:text-[#F1F3F5] rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= MESSAGES CONTAINER ================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } animate-in fade-in duration-200`}
          >
            <div className="flex items-start max-w-[92%] sm:max-w-[85%] space-x-2.5">
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-[#182338] border border-[#253A5E] flex items-center justify-center text-[#6EA8FE] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-[#6EA8FE]" />
                </div>
              )}

              <div className="flex flex-col">
                {/* Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1E293B] text-[#F1F3F5] border border-[#334155] rounded-tr-xs'
                      : 'bg-[#1B202B] text-[#F1F3F5] border border-[#262E3D] rounded-tl-xs shadow-md'
                  }`}
                >
                  {/* Markdown-style content renderer */}
                  <div className="space-y-2 whitespace-pre-line">
                    {formatMarkdownMessage(msg.text)}
                  </div>

                  {/* Render Table if available */}
                  {msg.tableData && (
                    <div className="mt-3.5 border border-[#262E3D] rounded-xl overflow-hidden bg-[#151923]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#1B202B] text-[#AAB2C0] uppercase text-[10px] tracking-wider border-b border-[#262E3D]">
                            <tr>
                              {msg.tableData.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#262E3D]/50 text-[#F1F3F5]">
                            {msg.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-[#222936]/40 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3 py-2 text-[11px]">
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Render Action Buttons if available */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#262E3D] flex flex-wrap gap-2">
                      {msg.actions.map((act) => (
                        <button
                          key={act.id}
                          onClick={() => handleActionClick(act)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                            act.primary
                              ? 'bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#0F1117] font-semibold'
                              : 'bg-[#222936] hover:bg-[#2B3344] text-[#6EA8FE] border border-[#262E3D]'
                          }`}
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 opacity-80" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div
                  className={`flex items-center text-[10px] text-[#7A8499] mt-1 space-x-1 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start ml-1'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#222936] border border-[#262E3D] flex items-center justify-center text-[#AAB2C0] shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#AAB2C0]" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-2.5 animate-in fade-in duration-150">
            <div className="w-7 h-7 rounded-lg bg-[#182338] border border-[#253A5E] flex items-center justify-center text-[#6EA8FE] shrink-0">
              <Bot className="w-4 h-4 text-[#6EA8FE]" />
            </div>
            <div className="bg-[#1B202B] border border-[#262E3D] rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-[#AAB2C0] flex items-center space-x-2 shadow-md">
              <div className="flex space-x-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6EA8FE] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6EA8FE] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6EA8FE] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px] text-[#AAB2C0]">
                Lumora AI is analyzing telemetry...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= QUICK QUESTIONS SECTION ================= */}
      <div className="bg-[#111827] border-t border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-[#8F9BAD] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#6EA8FE]" />
            {activeStudentContext ? 'Student Context Actions' : 'Suggested Analytical Prompts'}
          </span>
          <span className="text-[10px] text-[#657083]">Click to inquire</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {activeStudentContext
            ? STUDENT_CONTEXT_QUICK_ACTIONS.map((actionText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(actionText)}
                  disabled={isTyping}
                  className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] hover:text-[#6EA8FE] text-[#F5F7FA] text-xs font-medium border border-white/[0.06] whitespace-nowrap transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {actionText}
                </button>
              ))
            : SUGGESTED_QUESTIONS.map((questionText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(questionText)}
                  disabled={isTyping}
                  className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] hover:text-[#6EA8FE] text-[#F5F7FA] text-xs font-medium border border-white/[0.06] whitespace-nowrap transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {questionText}
                </button>
              ))}
        </div>
      </div>

      {/* ================= INPUT BOX ================= */}
      <div className="bg-[#0A0F1A] p-3 sm:p-4 border-t border-white/[0.06]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                activeStudentContext
                  ? `Ask about ${activeStudentContext.name}'s risk, success score, or remedial plan...`
                  : 'Ask about high-risk students, coding scores, worst department, mentors...'
              }
              disabled={isTyping}
              className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 sm:px-4 sm:py-2.5 bg-[#6EA8FE] hover:bg-[#8B9CFF] disabled:bg-[#151D2D] disabled:text-[#657083] text-[#070B14] font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * Format markdown headers, bold, bullet points, and code spans cleanly without external heavy dependencies.
 */
function formatMarkdownMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Header 3
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-sm font-bold text-[#F1F3F5] pb-1 border-b border-[#262E3D]">
          {line.replace('### ', '')}
        </h4>
      );
    }
    // Header 2 or 1
    if (line.startsWith('## ') || line.startsWith('# ')) {
      return (
        <h3 key={idx} className="text-base font-bold text-[#6EA8FE] pb-1">
          {line.replace(/^#+\s/, '')}
        </h3>
      );
    }
    // Bullet point
    if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
      return (
        <div key={idx} className="flex items-start space-x-1.5 pl-1 text-xs">
          <span className="text-[#6EA8FE] font-bold">•</span>
          <span>{renderFormattedInline(line.replace(/^[•*-]\s/, ''))}</span>
        </div>
      );
    }
    // Empty line
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }

    return (
      <p key={idx} className="text-xs sm:text-sm">
        {renderFormattedInline(line)}
      </p>
    );
  });
}

function renderFormattedInline(str: string): React.ReactNode {
  // Simple bold and code formatter
  const parts = str.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-[#F1F3F5] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="font-mono text-[11px] px-1 py-0.5 rounded bg-[#222936] text-[#6EA8FE] border border-[#262E3D]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="text-[#AAB2C0] italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
