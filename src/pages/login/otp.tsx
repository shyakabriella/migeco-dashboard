import { useEffect, useRef, useState } from "react";

const OTP_LENGTH = 6;

export default function OTP() {
  const [otpSlots, setOtpSlots] = useState(Array(OTP_LENGTH).fill(""));
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const updateOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtpSlots((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpSlots[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pasted) return;

    setOtpSlots((prev) => {
      const next = [...prev];
      for (let i = 0; i < OTP_LENGTH; i += 1) {
        next[i] = pasted[i] ?? "";
      }
      return next;
    });

    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  const isComplete = otpSlots.every((slot) => slot.length === 1);
  const countdownLabel = `${Math.floor(resendCountdown / 60)}:${String(resendCountdown % 60).padStart(2, "0")}`;

  const handleResend = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(45);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef1f7] px-4 py-12 text-[#1e2433]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(183,201,231,0.3),transparent_44%),radial-gradient(circle_at_87%_90%,rgba(176,200,239,0.25),transparent_38%),linear-gradient(90deg,#e8edf6_0%,#f4f7fb_46%,#eef4ff_100%)]" />
      <div className="otp-beam animate-otp-beam absolute left-[20%] top-0 h-full w-[26%]" />
      <div className="otp-beam animate-otp-beam-slow absolute right-[18%] top-0 h-full w-[24%]" />

      <section className="animate-otp-panel relative z-10 w-full max-w-[420px] rounded-xl border border-[#d8dee9] bg-[#f6f7fa] shadow-[0_18px_44px_rgba(31,45,71,0.2)]">
        <div className="h-1 w-full rounded-t-xl bg-[#4068f5]" />

        <div className="relative px-8 pb-8 pt-9">
          <div className="pointer-events-none absolute right-4 top-5 h-24 w-24 rounded-full border border-[#eef1f6]" />
          <div className="pointer-events-none absolute right-11 top-12 h-16 w-16 rounded-full border border-[#eef1f6]" />

          <div className="mx-auto flex w-fit items-center gap-3">
            <div className="animate-logo-breathe flex h-10 w-10 items-center justify-center rounded-lg bg-[#dbe8ff] text-[#3f67f5]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V8a4 4 0 0 1 8 0v2" />
              </svg>
            </div>
            <p className="leading-tight">
              <span className="block text-[30px] font-bold tracking-tight text-[#191f2e]">
                MIGECO <span className="text-[#3e67f7]">DMS</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4f70d4]">
                DMS Secure
              </span>
            </p>
          </div>

          <div className="mt-8 text-center">
            <h1 className="text-[38px] font-semibold tracking-tight text-[#202738]">Two-Factor Authentication</h1>
            <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-[#707b90]">
              We&apos;ve sent a 6-digit security code to your email. Please enter it below to access the Document
              Management System.
            </p>
          </div>

          <form className="mt-8" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center justify-center gap-3">
              {otpSlots.map((slot, idx) => (
                <label
                  key={idx}
                  className={`flex h-14 w-12 items-center justify-center rounded-lg border-2 text-[30px] font-semibold transition-all focus-within:border-[#3565fb] focus-within:bg-[#f7fbff] focus-within:shadow-[0_0_0_2px_rgba(53,101,251,0.12)] ${
                    slot
                      ? "border-[#8fa4cc] bg-[#f2f5fa] text-[#293249]"
                      : "border-[#b9c3d8] bg-[#eceff4] text-[#6a7387]"
                  }`}
                >
                  <input
                    aria-label={`OTP digit ${idx + 1}`}
                    value={slot}
                    onChange={(event) => updateOtpDigit(idx, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(idx, event)}
                    onPaste={handlePaste}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    placeholder=""
                    ref={(node) => {
                      inputRefs.current[idx] = node;
                    }}
                    className="w-full bg-transparent text-center leading-none outline-none placeholder:text-[#8e96a8] focus:text-[#1d2537]"
                  />
                </label>
              ))}
            </div>

            <div className="mt-2 flex justify-center">
              <span className="h-2 w-2 rounded-full bg-[#4870fb]" />
            </div>

            <button
              type="submit"
              disabled={!isComplete}
              className="mt-6 h-12 w-full rounded-md bg-[#3f67f5] text-sm font-semibold text-white shadow-[0_8px_16px_rgba(63,103,245,0.35)] transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
            >
              Verify Identity <span className="ml-1">-&gt;</span>
            </button>
          </form>

          <div className="mt-8 border-t border-[#e7e9ef] pt-5 text-center">
            <p className="text-sm text-[#7c869a]">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCountdown > 0}
                className="font-medium text-[#3f67f5] transition hover:brightness-110 disabled:cursor-not-allowed disabled:text-[#8691a5] disabled:hover:brightness-100"
              >
                {resendCountdown > 0 ? `Resend in ${countdownLabel}` : "Resend code"}
              </button>
            </p>
            <a href="#" className="mt-4 inline-block text-sm font-medium text-[#4f5c76] hover:text-[#2f3f63]">
              &lt;- Back to Login
            </a>
          </div>
        </div>
      </section>

      <p className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 text-xs text-[#aab2c3]">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5 4.75 5.72v5.04c0 4.35 2.9 8.4 7.25 10 4.35-1.6 7.25-5.65 7.25-10V5.72L12 2.5Zm0 2 5.25 2.33v3.93c0 3.37-2.16 6.57-5.25 8.05-3.1-1.48-5.25-4.68-5.25-8.05V6.83L12 4.5Z" />
        </svg>
        Secured by MIGECO Enterprise Authentication
      </p>
    </main>
  );
}
