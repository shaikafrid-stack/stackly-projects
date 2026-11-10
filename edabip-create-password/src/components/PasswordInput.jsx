import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons.jsx";

/**
 * White 32px field with a dark-teal 1px border (matches the design).
 * `toggle` adds the show/hide eye button on the right.
 */
export default function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  toggle = false,
  inputRef,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex h-8 items-center rounded-[4px] border border-brand bg-white pl-[13px] pr-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
      <input
        ref={inputRef}
        id={id}
        type={toggle && visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete="new-password"
        className="h-full w-full bg-transparent text-[11px] font-medium text-brand placeholder:text-brand focus:outline-none"
      />
      {toggle && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="ml-2 shrink-0 text-brand"
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      )}
    </div>
  );
}
