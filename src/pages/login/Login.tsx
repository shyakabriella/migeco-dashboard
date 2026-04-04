import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen font-sans antialiased text-gray-900">
      {/* Left Side: Image & Branding */}
      <div className="relative hidden w-2/3 lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-950">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/geological-bg.jpg" 
            alt="Geological Formation" 
            className="object-cover w-full h-full opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-transparent" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/25">
            <img src="/logo-icon.png" alt="Logo" className="w-5 h-5 object-contain invert opacity-90" />
          </div>
          <span className="text-white font-bold text-[19px] tracking-tight">MIGECO Ltd.</span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mt-[-80px]">
          <h1 className="text-[64px] font-bold text-white mb-8 leading-[1.05] tracking-tight">
            Secure Geological <br />Data Management
          </h1>
          <p className="text-[20px] text-gray-300/80 leading-[1.6] font-light max-w-lg">
            Access the centralized Document Management System for streamlined survey reporting, field analysis, and secure project archives.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center text-[11px] text-gray-400 tracking-wide">
          <span>© 2024 MIGECO Ltd</span>
          <span className="mx-2.5 opacity-40">•</span>
          <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
          <span className="mx-2.5 opacity-40">•</span>
          <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white min-h-screen">
        <div className="w-full max-w-[400px] space-y-10">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-[52px] h-[52px] bg-[#ebf2ff] text-[#4f80ff] rounded-[14px] flex items-center justify-center shadow-[0_4px_12px_rgba(79,128,255,0.08)]">
              <Lock size={22} strokeWidth={2.5} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-[28px] font-bold tracking-tight text-[#1a1c2e]">Welcome Back</h2>
              <p className="text-[14px] text-slate-500/90 font-medium">Please sign in to access your DMS dashboard.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-600 tracking-tight ml-0.5">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  <User size={17} strokeWidth={2.2} />
                </div>
                <input
                  type="text"
                  placeholder="name@migeco.com"
                  className="block w-full pl-11 pr-3 py-[14px] bg-[#f8fafc] border border-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-600 tracking-tight ml-0.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  <Lock size={17} strokeWidth={2.2} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="block w-full pl-11 pr-11 py-[14px] bg-[#f8fafc] border border-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-[18px] h-[18px] rounded-[5px] border-slate-200 text-[#4f80ff] focus:ring-0 focus:ring-offset-0 transition-colors" 
                  />
                </div>
                <span className="text-[13.5px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
              <Link to="/resetpassword" className="text-[13.5px] font-semibold text-[#4f80ff] hover:text-[#3a69ff] transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#3b60e4] hover:bg-[#3252c4] text-white font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <div className="relative pt-6 pb-2">
            <div className="absolute inset-0 flex items-center pt-4">
              <div className="w-full border-t border-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
