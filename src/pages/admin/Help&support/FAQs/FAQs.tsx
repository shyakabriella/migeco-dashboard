import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  Share2, 
  ChevronRight, 
  ChevronDown, 
  MessageSquare, 
  Mail,
  FileText,
  Lock,
  WifiOff,
  HelpCircle
} from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';
import Header from './components/Header';

const FAQs = () => {
  return (
    <div className="flex h-screen bg-[#0a0c1a] text-white font-sans overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-[#0a0c1a] p-10">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">How can we help you today?</h2>
              <p className="text-[#8e97a4] max-w-2xl mx-auto text-lg leading-relaxed">
                Browse through our most frequently asked questions or use the search bar to find answers 
                about document management, version control, and system security.
              </p>
            </div>

            {/* Common Questions Cards */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#4f6bff] font-medium text-sm">
                <div className="h-0.5 w-6 bg-[#4f6bff]"></div>
                <span>Common Questions</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard 
                  icon={<RotateCcw size={20} className="text-[#ff5c8e]" />}
                  title="Reset Password"
                  description="Instructions for resetting your account credentials securely."
                  bgColor="bg-[#2d1b2a]"
                />
                <ActionCard 
                  icon={<Share2 size={20} className="text-[#40e0d0]" />}
                  title="External Sharing"
                  description="How to safely share CAD files with contractors."
                  bgColor="bg-[#1b2a2d]"
                />
                <ActionCard 
                  icon={<History size={20} className="text-[#ffa500]" />}
                  title="Version History"
                  description="Understanding revision numbers and audit logs."
                  bgColor="bg-[#2d251b]"
                />
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#4f6bff] font-medium text-sm">
                <div className="h-0.5 w-6 bg-[#4f6bff]"></div>
                <span>All Frequently Asked Questions</span>
              </div>
              
              <div className="space-y-3">
                <AccordionItem 
                  icon={<HelpCircle size={18} className="text-[#4f6bff]" />}
                  title="How do I recover a deleted file?"
                  isOpen={true}
                />
                <AccordionItem 
                  icon={<FileText size={18} className="text-[#4f6bff]" />}
                  title="Can I share CAD files with external partners?"
                />
                <AccordionItem 
                  icon={<Lock size={18} className="text-[#4f6bff]" />}
                  title="What is the maximum file upload size?"
                />
                <AccordionItem 
                  icon={<Share2 size={18} className="text-[#4f6bff]" />}
                  title="How do I change my access permissions for a project?"
                />
                <AccordionItem 
                  icon={<WifiOff size={18} className="text-[#4f6bff]" />}
                  title="Can I access documents offline?"
                />
              </div>
            </div>

            {/* Footer Support Section */}
            <div className="bg-[#12162a] border border-[#1e2235] p-8 rounded-xl flex items-center justify-between mt-12">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Still need help?</h3>
                <p className="text-[#8e97a4] text-sm">Our support team is available Mon-Fri, 9am - 6pm EST.</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#1e2235] bg-[#0a0c1a] text-sm font-medium hover:bg-[#1a203a] transition-all">
                  <MessageSquare size={18} />
                  Live Chat
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#4f6bff] text-white text-sm font-medium hover:bg-[#3d55e0] transition-all shadow-lg shadow-[#4f6bff]/20">
                  <Mail size={18} />
                  Contact Support
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, description, bgColor }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  bgColor: string 
}) => (
  <div className="group bg-[#12162a] border border-[#1e2235] p-6 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden">
    <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <div className="absolute top-6 right-6 text-[#8e97a4] opacity-0 group-hover:opacity-100 transition-opacity">
      <ChevronRight size={16} />
    </div>
    <h3 className="text-white font-bold mb-2">{title}</h3>
    <p className="text-[#8e97a4] text-xs leading-relaxed">{description}</p>
  </div>
);

const AccordionItem = ({ icon, title, isOpen = false }: { 
  icon: React.ReactNode, 
  title: string, 
  isOpen?: boolean 
}) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <div 
      className={`
        bg-[#12162a] border border-[#1e2235] rounded-xl overflow-hidden transition-all
        ${open ? 'border-blue-500/30' : 'hover:bg-[#1a203a]'}
      `}
    >
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#0a0c1a] rounded-lg">
            {icon}
          </div>
          <span className="text-sm font-medium text-[#c0c7d1]">{title}</span>
        </div>
        {open ? <ChevronDown size={18} className="text-[#8e97a4]" /> : <ChevronRight size={18} className="text-[#8e97a4]" />}
      </div>
      {open && (
        <div className="px-4 pb-4 pl-[60px] text-[#8e97a4] text-sm leading-relaxed border-t border-[#1e2235]/50 pt-4">
          Detailed information about this topic would go here. Users can find step-by-step guides, troubleshooting tips, and links to relevant documentation to resolve their queries efficiently.
        </div>
      )}
    </div>
  );
};

export default FAQs;
