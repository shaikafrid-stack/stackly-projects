import { useRef, useState } from "react";
import PasswordInput from "./PasswordInput.jsx";
import { AlertIcon } from "./icons.jsx";

const MIN_LENGTH = 8;

export default function CreatePasswordCard({ onSubmit }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const confirmRef = useRef(null);

  const tooShort = (passwordTouched || submitted) && password.length < MIN_LENGTH;
  const mismatch = (confirm.length > 0 || submitted) && password !== confirm;
  const hasError = tooShort || mismatch;

  // As in the design, the confirm field turns into a red banner when the
  // passwords don't match. Clicking the banner (or focusing) brings the field back.
  const showBanner = mismatch && !confirmFocused;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (password.length >= MIN_LENGTH && password === confirm) {
      onSubmit?.(password);
      setDone(true);
    }
  };

  const showConfirm = () => {
    setConfirmFocused(true);
    requestAnimationFrame(() => confirmRef.current?.focus());
  };

  return (
    <div className="w-full max-w-[400px] rounded-xl bg-white px-[57px] pb-7 pt-[25px] text-black shadow-card max-sm:px-6">
      <h2 className="text-center text-[28px] font-bold leading-[34px]">Create New password</h2>
      <p className="-mx-[44px] mt-[13px] text-center text-[12.85px] leading-[26px] text-black max-sm:mx-0">
        Create New Password in to continue to your EDABIP dashboard and accelerate your analytics
        journey
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-[19px]">
        <PasswordInput
          id="password"
          value={password}
          placeholder="Enter Your Password"
          onChange={(v) => {
            setPassword(v);
            setDone(false);
          }}
          onBlur={() => setPasswordTouched(true)}
          toggle
        />
        {tooShort && (
          <p className="mt-[3px] h-[12px] text-[8px] leading-[12px] text-danger" role="alert">
            Password must be at least {MIN_LENGTH} characters
          </p>
        )}

        <div className={tooShort ? "mt-[19px]" : "mt-[18px]"}>
          {showBanner ? (
            <button
              type="button"
              onClick={showConfirm}
              role="alert"
              className="flex h-8 w-full items-center justify-between rounded-[4px] border border-danger-border bg-danger-bg px-[13px] text-left text-[11px] font-medium text-brand"
            >
              <span>Your passwords do not match</span>
              <AlertIcon className="h-[13px] w-[13px] text-danger-icon" />
            </button>
          ) : (
            <PasswordInput
              id="confirm"
              inputRef={confirmRef}
              value={confirm}
              placeholder="Confirm Your Password"
              onChange={(v) => {
                setConfirm(v);
                setDone(false);
              }}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={hasError}
          className={`${tooShort && showBanner ? "mt-3" : "mt-[19px]"} h-[37px] w-full rounded-[4px] bg-brand text-[12px] font-bold text-white shadow-[0_2px_3px_rgba(0,0,0,0.35)] transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-[#dcdcdc] disabled:shadow-[0_2px_2px_rgba(0,0,0,0.2)] disabled:hover:bg-[#dcdcdc]`}
        >
          Update
        </button>

        {done && (
          <p className="mt-2 text-center text-[11px] font-bold text-brand" role="status">
            Password updated successfully.
          </p>
        )}
      </form>

      <p className="mt-[14px] text-center text-[8.5px] leading-3 text-[#404040]">
        Need help ?{" "}
        <a href="#support" className="text-brand-link hover:underline">
          Contact Support
        </a>
      </p>
    </div>
  );
}
