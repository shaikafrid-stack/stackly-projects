export const LogoMark = ({ className = "h-[34px] w-auto" }) => (
  <img src="/logo-mark.png" alt="" aria-hidden="true" className={className} draggable="false" />
);

export const Logo = () => (
  <div className="flex items-center gap-[6px]">
    <LogoMark />
    <span className="text-[15px] font-black leading-none text-white">EDABIP</span>
  </div>
);
