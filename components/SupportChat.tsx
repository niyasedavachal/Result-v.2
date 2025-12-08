
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, CheckCheck, Globe } from 'lucide-react';
import { api } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  sender: 'bot' | 'user';
  text?: string;
  isRead?: boolean;
  component?: React.ReactNode;
}

interface Option {
  id: string;
  label: string;
  action: string;
  payload?: any;
}

// TRANSLATIONS DICTIONARY
const TEXTS = {
    en: {
        greeting: "Hi! 👋 I'm your School Assistant. How can I help you today?",
        opt_result: "📄 Check Result",
        opt_login: "🔐 Login Help",
        opt_link: "🔗 Find School Link",
        opt_other: "💬 Something else",
        typing: "typing...",
        online: "Online",
        unknown: "I'm not sure I understood that. 🤔\n\nWould you like to raise a Support Ticket?",
        ticket_yes: "✅ Yes, Raise Ticket",
        ticket_no: "No, Try Again",
        ticket_prompt: "Okay, please describe your issue in detail. 📝\n\nI will send this directly to the support team.",
        ticket_sent: "Ticket Sent Successfully! ✅\n\nOur team will check and update you.",
        result_no_school: "I don't know which school you are in yet. 🤷‍♂️\n\nPlease visit your school's official link first.",
        result_select_class: "Select your Class:",
        result_no_students: "No verified students found in this class.",
        result_select_name: "Tap your Name:",
        result_enter_dob: (name: string) => `Hi ${name}! 👋\n\nFor security, please type your **Date of Birth** (DD-MM-YYYY).`,
        result_invalid_dob: "⚠️ Invalid Format. Please use DD-MM-YYYY (e.g., 20-05-2008).",
        result_dob_error: "❌ Incorrect Date of Birth. Please try again.",
        login_help: "Who are you trying to login as?",
        login_student: "Students login using their **Register Number** and **DOB**. If you can't login, ask your teacher to verify your account.",
        login_teacher: "Teachers need a Class Password. If you forgot it, the School Admin can reset it for you.",
        find_link: "Please type the **Name of your School** below. I'll search our database.",
        ask_open: "Sure, go ahead and type your question. I'll do my best to answer! 🤖",
        found_schools: "I found matching schools:",
        redirecting: "Redirecting to school page... 🚀"
    },
    ml: {
        greeting: "നമസ്കാരം! 👋 ഞാൻ നിങ്ങളുടെ സ്കൂൾ അസിസ്റ്റൻ്റ് ആണ്. എന്താണ് അറിയേണ്ടത്?",
        opt_result: "📄 റിസൾട്ട് അറിയണം",
        opt_login: "🔐 ലോഗിൻ സഹായം",
        opt_link: "🔗 സ്കൂൾ ലിങ്ക്",
        opt_other: "💬 മറ്റുളളവ",
        typing: "ടൈപ്പ് ചെയ്യുന്നു...",
        online: "ഓൺലൈൻ",
        unknown: "ക്ഷമിക്കണം, എനിക്ക് മനസ്സിലായില്ല. 🤔\n\nസപ്പോർട്ട് ടീമിന് ഒരു ടിക്കറ്റ് നൽകണോ?",
        ticket_yes: "✅ അതെ, ടിക്കറ്റ് നൽകാം",
        ticket_no: "വേണ്ട, വീണ്ടും ശ്രമിക്കാം",
        ticket_prompt: "ശരി, നിങ്ങളുടെ പ്രശ്നം വിശദമായി എഴുതുക. 📝\n\nഞാൻ ഇത് സപ്പോർട്ട് ടീമിന് കൈമാറാം.",
        ticket_sent: "ടിക്കറ്റ് അയച്ചു! ✅\n\nഞങ്ങൾ പരിശോധിച്ച് മറുപടി നൽകാം.",
        result_no_school: "നിങ്ങൾ ഏത് സ്കൂളിലാണെന്ന് എനിക്കറിയില്ല. 🤷‍♂️\n\nദയവായി സ്കൂളിന്റെ ഔദ്യോഗിക ലിങ്ക് വഴി വരിക.",
        result_select_class: "നിങ്ങളുടെ ക്ലാസ് തിരഞ്ഞെടുക്കൂ:",
        result_no_students: "ഈ ക്ലാസ്സിൽ കുട്ടികളെ കാണുന്നില്ല.",
        result_select_name: "നിങ്ങളുടെ പേര് തിരഞ്ഞെടുക്കൂ:",
        result_enter_dob: (name: string) => `ഹലോ ${name}! 👋\n\nസുരക്ഷയ്ക്കായി, നിങ്ങളുടെ **ജനനതീയതി** (DD-MM-YYYY) നൽകുക.`,
        result_invalid_dob: "⚠️ തെറ്റായ ഫോർമാറ്റ്. DD-MM-YYYY രീതിയിൽ നൽകുക (ഉദാ: 20-05-2008).",
        result_dob_error: "❌ ജനനതീയതി തെറ്റാണ്. വീണ്ടും ശ്രമിക്കുക.",
        login_help: "ആർക്കാണ് ലോഗിൻ ചെയ്യേണ്ടത്?",
        login_student: "കുട്ടികൾക്ക് **രജിസ്റ്റർ നമ്പറും** **ജനനതീയതിയും** ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യാം. സാധിക്കുന്നില്ലെങ്കിൽ ടീച്ചറോട് ചോദിക്കുക.",
        login_teacher: "ടീച്ചർമാർക്ക് ക്ലാസ് പാസ്‌വേഡ് ആവശ്യമാണ്. മറന്നുപോയാൽ അഡ്മിനുമായി ബന്ധപ്പെടുക.",
        find_link: "നിങ്ങളുടെ **സ്കൂളിന്റെ പേര്** താഴെ ടൈപ്പ് ചെയ്യുക. ഞാൻ തിരഞ്ഞു നോക്കാം.",
        ask_open: "തീർച്ചയായും, നിങ്ങളുടെ ചോദ്യം ചോദിക്കൂ. 🤖",
        found_schools: "ഈ സ്കൂളുകൾ കണ്ടെത്തി:",
        redirecting: "സ്കൂൾ പേജിലേക്ക് പോകുന്നു... 🚀"
    }
};

const SupportChat: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [headerStatus, setHeaderStatus] = useState('Online');
  const [options, setOptions] = useState<Option[]>([]);
  const [lang, setLang] = useState<'en' | 'ml'>('en'); // Language State
  
  // MODES
  const [ticketMode, setTicketMode] = useState(false);
  const [sendingTicket, setSendingTicket] = useState(false);
  
  // RESULT CHECKING STATE
  const [resultFlow, setResultFlow] = useState<{
      active: boolean;
      step: 'CLASS' | 'STUDENT' | 'DOB';
      schoolId: string;
      classId: string;
      regNo: string;
      studentName: string;
  }>({ active: false, step: 'CLASS', schoolId: '', classId: '', regNo: '', studentName: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping, isOpen, options]);

  // Initial Greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        resetChat();
    }
  }, [isOpen]);

  // Header Animation
  useEffect(() => {
      if (!isOpen) return;
      const interval = setInterval(() => {
          if (isBotTyping) return;
          const statusText = lang === 'en' 
            ? ['Online', 'Replies instantly'] 
            : ['ഓൺലൈൻ', 'സജീവമാണ്'];
          setHeaderStatus(statusText[Math.floor(Math.random() * statusText.length)]);
      }, 5000);
      return () => clearInterval(interval);
  }, [isOpen, isBotTyping, lang]);

  if (location.pathname === '/' || location.pathname === '/setup') return null;

  const t = TEXTS[lang]; // Helper for current language texts

  const addBotMessage = (text: string, nextOptions: Option[] = [], delay = 800) => {
      setIsBotTyping(true);
      setHeaderStatus(t.typing);
      setOptions([]); 

      const dynamicDelay = Math.max(delay, text.length * 20);

      setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text }]);
          setIsBotTyping(false);
          setHeaderStatus(t.online);
          setOptions(nextOptions);
      }, dynamicDelay);
  };

  const addBotComponent = (component: React.ReactNode, nextOptions: Option[] = []) => {
      setIsBotTyping(true);
      setHeaderStatus(t.typing);
      setOptions([]);

      setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', component }]);
          setIsBotTyping(false);
          setHeaderStatus(t.online);
          setOptions(nextOptions);
      }, 1500);
  };

  const addUserMessage = (text: string) => {
      const msgId = Date.now();
      setMessages(prev => [...prev, { id: msgId, sender: 'user', text, isRead: false }]);
      setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isRead: true } : m));
      }, 1000);
  };

  const toggleLanguage = () => {
      const newLang = lang === 'en' ? 'ml' : 'en';
      setLang(newLang);
      // Reset chat with new language immediately
      setTimeout(() => {
          setMessages([]);
          setResultFlow({ active: false, step: 'CLASS', schoolId: '', classId: '', regNo: '', studentName: '' });
          setTicketMode(false);
          
          // Manually triggering greeting for the new language
          const newT = TEXTS[newLang];
          setIsBotTyping(true);
          setTimeout(() => {
              setMessages([{ id: Date.now(), sender: 'bot', text: newT.greeting }]);
              setOptions([
                  { id: 'result', label: newT.opt_result, action: 'START_RESULT' },
                  { id: 'login', label: newT.opt_login, action: 'LOGIN_HELP' },
                  { id: 'link', label: newT.opt_link, action: 'FIND_LINK' },
                  { id: 'other', label: newT.opt_other, action: 'ASK_OPEN' }
              ]);
              setIsBotTyping(false);
          }, 600);
      }, 100);
  };

  const resetChat = () => {
      setResultFlow({ active: false, step: 'CLASS', schoolId: '', classId: '', regNo: '', studentName: '' });
      setTicketMode(false);
      addBotMessage(t.greeting, [
          { id: 'result', label: t.opt_result, action: 'START_RESULT' },
          { id: 'login', label: t.opt_login, action: 'LOGIN_HELP' },
          { id: 'link', label: t.opt_link, action: 'FIND_LINK' },
          { id: 'other', label: t.opt_other, action: 'ASK_OPEN' }
      ]);
  };

  // --- INTENT ANALYSIS ENGINE (BILINGUAL) ---
  const analyzeIntent = async (text: string) => {
      const lower = text.toLowerCase();

      // 1. GREETINGS
      if (['hi', 'hello', 'hey', 'ഹലോ', 'നമസ്കാരം'].some(w => lower.includes(w))) {
          addBotMessage(t.greeting, [
              { id: 'result', label: t.opt_result, action: 'START_RESULT' },
              { id: 'link', label: t.opt_link, action: 'FIND_LINK' }
          ]);
          return;
      }

      // 2. LINK / URL ISSUES
      if (lower.includes('link') || lower.includes('url') || lower.includes('ലിങ്ക്') || lower.includes('സൈറ്റ്')) {
          addBotMessage(t.find_link, [
              { id: 'search', label: lang === 'ml' ? "സ്കൂൾ തിരയുക" : "🔍 Search School", action: 'SEARCH_SCHOOL_MODE' }
          ]);
          return;
      }

      // 3. LOGIN / PASSWORD
      if (lower.includes('login') || lower.includes('password') || lower.includes('ലോഗിൻ') || lower.includes('പാസ്സ്‌വേർഡ്')) {
          addBotMessage(t.login_student, [
              { id: 'ticket', label: lang === 'ml' ? "പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക" : "Report Issue", action: 'ENTER_TICKET_MODE' },
              { id: 'back', label: lang === 'ml' ? "തിരികെ" : "Back", action: 'RESET' }
          ]);
          return;
      }

      // 4. MARKS / RESULT
      if (lower.includes('mark') || lower.includes('result') || lower.includes('റിസൾട്ട്') || lower.includes('ഫലം')) {
          handleOptionClick({ id: 'res', label: '', action: 'START_RESULT' });
          return;
      }

      // 5. SCHOOL SEARCH DIRECTLY
      if (lower.length > 3) {
          const potentialSchools = await api.findSchoolByEmailOrName(text);
          if (potentialSchools.length > 0) {
              addBotMessage(`${t.found_schools} "${text}":`);
              
              const schoolOptions = potentialSchools.slice(0, 3).map(s => ({
                  id: s.id,
                  label: s.name,
                  action: 'NAVIGATE_SCHOOL',
                  payload: s.id
              }));
              setOptions([...schoolOptions, { id: 'no', label: t.ticket_no, action: 'RESET' }]);
              return;
          }
      }

      // 6. FALLBACK
      addBotMessage(t.unknown, [
          { id: 'ticket', label: t.ticket_yes, action: 'ENTER_TICKET_MODE' },
          { id: 'retry', label: t.ticket_no, action: 'RESET' }
      ]);
  };

  const handleOptionClick = async (opt: Option) => {
      if (opt.label) addUserMessage(opt.label);
      setOptions([]);

      // --- NAVIGATIONS ---
      if (opt.action === 'NAVIGATE_SCHOOL') {
          navigate(`/school/${opt.payload}`);
          addBotMessage(t.redirecting);
          setTimeout(() => setIsOpen(false), 1500);
          return;
      }

      // --- RESULT FLOW ---
      if (opt.action === 'START_RESULT') {
          const sid = localStorage.getItem('school_id');
          if (!sid) {
              addBotMessage(t.result_no_school, [
                  { id: 'find', label: lang === 'ml' ? "സ്കൂൾ കണ്ടെത്തുക" : "Find School", action: 'FIND_LINK' }
              ]);
              return;
          }
          
          setIsBotTyping(true);
          const classes = await api.getClassesForPublic(sid);
          
          if (classes.length === 0) {
              addBotMessage("Sorry, no classes found.", [{ id: 'back', label: lang === 'ml' ? "മെനു" : "Main Menu", action: 'RESET' }]);
              return;
          }

          setResultFlow({ ...resultFlow, active: true, step: 'CLASS', schoolId: sid });
          addBotMessage(t.result_select_class, classes.map(c => ({
              id: c.id, label: c.name, action: 'SELECT_CLASS', payload: c.id
          })));
      }
      else if (opt.action === 'SELECT_CLASS') {
          setIsBotTyping(true);
          const students = await api.getStudentNamesForLogin(opt.payload);
          
          if (students.length === 0) {
              addBotMessage(t.result_no_students, [{ id: 'retry', label: lang === 'ml' ? "മറ്റൊരു ക്ലാസ്" : "Select Another Class", action: 'START_RESULT' }]);
              return;
          }

          setResultFlow({ ...resultFlow, step: 'STUDENT', classId: opt.payload });
          
          const studentOptions = students.slice(0, 8).map(s => ({
              id: s.id, label: s.name, action: 'SELECT_STUDENT', payload: { reg: s.reg_no, name: s.name }
          }));

          addBotMessage(t.result_select_name, studentOptions);
      }
      else if (opt.action === 'SELECT_STUDENT') {
          setResultFlow({ ...resultFlow, step: 'DOB', regNo: opt.payload.reg, studentName: opt.payload.name });
          addBotMessage(t.result_enter_dob(opt.payload.name), [], 500);
      }
      
      // --- HELPER FLOWS ---
      else if (opt.action === 'LOGIN_HELP') {
          addBotMessage(t.login_help, [
              { id: 'student', label: "Student", action: 'MSG_STUDENT_LOGIN' },
              { id: 'teacher', label: "Teacher", action: 'MSG_TEACHER_LOGIN' }
          ]);
      }
      else if (opt.action === 'MSG_STUDENT_LOGIN') {
          addBotMessage(t.login_student);
      }
      else if (opt.action === 'MSG_TEACHER_LOGIN') {
          addBotMessage(t.login_teacher);
      }
      else if (opt.action === 'FIND_LINK') {
          addBotMessage(t.find_link);
      }
      else if (opt.action === 'ASK_OPEN') {
          addBotMessage(t.ask_open);
      }
      
      // --- TICKET MODE ---
      else if (opt.action === 'ENTER_TICKET_MODE') {
          setTicketMode(true);
          addBotMessage(t.ticket_prompt);
      }
      else if (opt.action === 'RESET') {
          resetChat();
      }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userInput.trim()) return;
      const text = userInput.trim();
      setUserInput('');
      addUserMessage(text);

      // 1. RESULT FLOW (DOB CHECK)
      if (resultFlow.active && resultFlow.step === 'DOB') {
          // Parse DD-MM-YYYY using a slightly more flexible regex
          // Matches DD-MM-YYYY, DD/MM/YYYY
          const datePattern = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
          const match = text.match(datePattern);
          
          if (!match) {
              addBotMessage(t.result_invalid_dob);
              return;
          }
          
          // Pad with leading zeros if needed
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3];
          
          // Convert to YYYY-MM-DD for API
          const apiDate = `${year}-${month}-${day}`;

          setIsBotTyping(true);
          const res = await api.publicSearch(resultFlow.regNo, apiDate, resultFlow.schoolId);
          setIsBotTyping(false);

          if (res && res.student) {
              const isPass = res.marks.resultStatus === 'PASS' || res.marks.grade !== 'F';
              const ResultCard = (
                  <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 w-64">
                      <div className={`h-2 ${isPass ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="p-4">
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{res.student.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Reg: {res.student.regNo}</p>
                          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mb-3">
                              <div className="text-center">
                                  <p className="text-[10px] uppercase text-slate-400 font-bold">Total</p>
                                  <p className="text-xl font-black text-blue-600">{res.marks.total}</p>
                              </div>
                              <div className="text-center">
                                  <p className="text-[10px] uppercase text-slate-400 font-bold">Grade</p>
                                  <p className="text-xl font-black text-purple-600">{res.marks.grade}</p>
                              </div>
                          </div>
                          <div className={`text-center py-1.5 rounded text-xs font-bold text-white ${isPass ? 'bg-green-500' : 'bg-red-500'}`}>
                              {isPass ? (lang === 'ml' ? 'ജയിച്ചു 🎉' : 'PASSED 🎉') : (lang === 'ml' ? 'പരാജയപ്പെട്ടു' : 'FAILED')}
                          </div>
                      </div>
                  </div>
              );
              addBotComponent(ResultCard, [{ id: 'finish', label: lang === 'ml' ? "അവസാനിപ്പിക്കുക" : "Close Chat", action: 'RESET' }]);
          } else {
              addBotMessage(t.result_dob_error);
          }
          return;
      }

      // 2. TICKET MODE
      if (ticketMode) {
          setSendingTicket(true);
          setTimeout(async () => {
              const schoolId = localStorage.getItem('school_id') || 'Unknown';
              const res = await api.createSystemFeedback(text, 'SUPPORT', `Chat User (${lang})`);
              setSendingTicket(false);
              setTicketMode(false);
              
              if (res.success) {
                  addBotMessage(t.ticket_sent, [{ id: 'back', label: lang === 'ml' ? "മെനു" : "Main Menu", action: 'RESET' }]);
              } else {
                  addBotMessage("Error sending ticket.");
              }
          }, 1500);
          return;
      }

      // 3. NORMAL CHAT
      await analyzeIntent(text);
  };

  return (
    <>
        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 md:p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2 group animate-fade-in-up"
            >
                <div className="relative">
                    <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </div>
                <span className="hidden md:block font-bold pr-2">Help</span>
            </button>
        )}

        {isOpen && (
            <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-[360px] h-[550px] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 shadow-2xl rounded-t-2xl md:rounded-2xl border border-slate-200 dark:border-slate-800 animate-fade-in-up overflow-hidden font-sans">
                
                {/* Header */}
                <div className="bg-[#005c4b] dark:bg-slate-800 p-3 flex justify-between items-center text-white shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                                <Bot className="w-6 h-6 text-white"/>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#005c4b] rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm leading-tight">{lang === 'ml' ? 'സ്കൂൾ അസിസ്റ്റൻ്റ്' : 'School Assistant'}</h3>
                            <p className={`text-[10px] opacity-80 transition-all duration-300 ${headerStatus === t.typing ? 'text-green-300 font-bold' : ''}`}>
                                {headerStatus}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={toggleLanguage}
                            className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[10px] font-bold border border-white/20 transition-colors flex items-center gap-1"
                        >
                            <Globe className="w-3 h-3"/> {lang === 'en' ? 'ENG' : 'MAL'}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5] dark:bg-[#0b141a] custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.component ? (
                                msg.component
                            ) : (
                                <div className={`max-w-[85%] p-2 px-3 rounded-lg text-sm relative shadow-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'
                                }`}>
                                    <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                                    <div className="text-[9px] text-right mt-1 opacity-60 flex items-center justify-end gap-1 select-none">
                                        {new Date(msg.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        {msg.sender === 'user' && (
                                            <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-blue-500' : 'text-slate-400'}`}/>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isBotTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1.5 w-fit">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer Input/Options */}
                <div className="p-3 bg-[#f0f2f5] dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    
                    {/* DYNAMIC OPTIONS (Pills) */}
                    {!isBotTyping && options.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-2 max-h-24 overflow-y-auto custom-scrollbar">
                            {options.map(opt => (
                                <button 
                                    key={opt.id}
                                    onClick={() => handleOptionClick(opt)}
                                    className="text-xs font-medium px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* INPUT FIELD */}
                    <form onSubmit={handleInputSubmit} className="relative flex items-center gap-2">
                        <input 
                            className={`flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#005c4b] ${ticketMode ? 'border-orange-400 focus:ring-orange-400 bg-orange-50 dark:bg-orange-900/20' : ''}`}
                            placeholder={ticketMode ? (lang === 'ml' ? "വിശദാംശങ്ങൾ ഇവിടെ നൽകുക..." : "Type your issue here...") : (resultFlow.step === 'DOB' ? "DD-MM-YYYY" : (lang === 'ml' ? "സന്ദേശം അയക്കൂ..." : "Type a message..."))}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            type={resultFlow.step === 'DOB' ? 'text' : 'text'}
                        />
                        <button 
                            type="submit"
                            disabled={sendingTicket || !userInput.trim()}
                            className={`p-2.5 text-white rounded-full transition-colors shadow-md flex items-center justify-center ${ticketMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#005c4b] hover:bg-[#004f40] disabled:opacity-50'}`}
                        >
                            {sendingTicket ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5 ml-0.5"/>}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </>
  );
};

export default SupportChat;
