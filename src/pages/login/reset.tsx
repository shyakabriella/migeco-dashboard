import { Link } from "react-router-dom";

export default function ResetPassword() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050d1f] px-4 py-10 text-white sm:px-6">
      <div className="absolute inset-0">
        <div className="bg-beam animate-beam-drift absolute -left-14 top-0 h-full w-[35%]" />
        <div className="bg-beam animate-beam-drift-delayed absolute left-[39%] top-0 h-full w-[25%]" />
        <div className="bg-beam animate-beam-drift-reverse absolute right-[-8%] top-0 h-full w-[33%]" />
      </div>

      <section className="animate-panel-enter relative z-10 w-full max-w-[390px] border border-dashed border-[#3569ff8f] bg-[#161f33de] shadow-[0_0_40px_rgba(4,14,36,0.9)]">
        <div className="h-1 w-full bg-[#3c63f2]" />
        <div className="px-7 pb-7 pt-10">
          <div className="mx-auto flex h-11 w-11 animate-lock-pulse items-center justify-center rounded-lg bg-[#1f3f7d66] text-[#5a81ff]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7.6a4 4 0 0 1 8 0V10" />
            </svg>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[35px] font-semibold tracking-tight leading-none">
              MIGECO <span className="text-[#3d63f2]">DMS</span>
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[#96a4c2]">Internal System</p>
          </div>

          <div className="mt-9 text-center">
            <h1 className="text-[34px] font-semibold leading-none">Reset your password</h1>
            <p className="mt-3 text-sm leading-6 text-[#91a0be]">
              Enter the email address associated with your account and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>

          <form className="mt-8" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="email" className="mb-2 block text-sm text-[#d5deef]">
              Email Address
            </label>
            <div className="flex h-12 items-center rounded-md border border-[#2e3d5f] bg-[#0e1627] px-3 text-[#8b99b8] transition-colors focus-within:border-[#4d6ef4]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9A1.5 1.5 0 0 1 4.5 6Zm.56 1.5L12 12.03 18.94 7.5H5.06Zm14.44 9v-7.22l-7.09 4.63a.75.75 0 0 1-.82 0L4.5 9.28v7.22h15Z" />
              </svg>
              <input
                id="email"
                type="email"
                placeholder="name@migeco.com"
                className="h-full w-full bg-transparent px-3 text-sm text-[#dbe5ff] placeholder:text-[#7080a3] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-6 h-12 w-full rounded-md bg-[#3e64f3] text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
            >
              Send Reset Link
            </button>
          </form>

          <p className="mt-12 text-center text-sm text-[#7f8faf]">
            Remember your password?
            <Link to="/" className="ml-1 font-medium text-[#4f73ff] hover:text-[#7390ff]">
              Log in →
            </Link>
          </p>
        </div>

        <footer className="flex items-center justify-between border-t border-[#24324f] px-5 py-4 text-xs text-[#667898]">
          <p>© 2023 MIGECO Ltd.</p>
          <div className="space-x-4">
            <a href="#" className="hover:text-[#95a9d0]">
              Privacy
            </a>
            <a href="#" className="hover:text-[#95a9d0]">
              Terms
            </a>
          </div>
        </footer>
      </section>

      <button
        type="button"
        className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#3d4f74] bg-[#0e1930] text-[#7e91b7] transition-colors hover:text-[#a6b9de]"
        aria-label="Help"
      >
        ?
      </button>
    </main>
  );
}
