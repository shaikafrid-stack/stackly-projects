import { Logo } from "./components/Logo.jsx";
import FeatureList from "./components/FeatureList.jsx";
import CreatePasswordCard from "./components/CreatePasswordCard.jsx";
import { PillShieldIcon } from "./components/icons.jsx";

export default function App() {
  const handleSubmit = (password) => {
    // TODO: call your API here, e.g. fetch("/api/auth/reset-password", ...)
    console.log("Password submitted", password.length, "chars");
  };

  return (
    // bg.jpg holds the teal glow + shield/padlock/circuit artwork from the design
    <main className="relative min-h-screen overflow-hidden bg-black bg-[url('/bg.jpg')] bg-cover bg-center text-white max-lg:bg-[position:75%_center]">
      {/* logo */}
      <div className="absolute left-5 top-[22px] z-10">
        <Logo />
      </div>

      {/* left panel */}
      <section className="relative z-10 flex min-h-screen flex-col items-center px-6 pb-28 pt-28 lg:absolute lg:left-[22px] lg:top-1/2 lg:min-h-0 lg:w-[378px] lg:-translate-y-[calc(50%+24px)] lg:items-stretch lg:p-0">
        <h1 className="text-center text-[28px] font-bold leading-[34px]">Welcome to EDABIP</h1>
        <p className="mt-[14px] max-w-[352px] self-center text-center text-[12.7px] leading-[15px] lg:mx-auto lg:self-auto">
          Create New Password to access your Enterprise Data Analytics &amp; Business Intelligence
          Platform and continue making data-driven decisions with confidence
        </p>

        <div className="mt-[42px] self-start lg:ml-[10px]">
          <FeatureList />
          <div className="mt-8 inline-flex h-[18px] items-center gap-[5px] rounded-[4px] bg-pill px-[6px] text-[10px] font-medium text-black">
            <PillShieldIcon />
            Trusted by leading Enterprises worldwide
          </div>
        </div>
      </section>

      {/* card — centred in the page like the design */}
      <div className="relative z-10 flex justify-center px-6 pb-16 lg:pointer-events-none lg:absolute lg:inset-0 lg:items-center lg:p-0">
        <div className="pointer-events-auto w-full max-w-[400px]">
          <CreatePasswordCard onSubmit={handleSubmit} />
        </div>
      </div>

      {/* footer */}
      <footer className="absolute bottom-[36px] left-0 z-10 w-full px-6 text-center text-[11px] leading-[19px] text-white/80 lg:left-[14px] lg:w-[378px] lg:px-0">
        <p>Trusted by Fortune 500 companies worldwide</p>
        <p>© 2026 EDABIP. Enterprise Data Analytics &amp; Business Intelligence Platform.</p>
      </footer>

      {/* floating logo badge */}
      <img
        src="/badge.png"
        alt="EDABIP"
        draggable="false"
        className="absolute bottom-[9.9%] right-[2.55%] z-10 h-[52px] w-[52px] rounded-full shadow-[0_0_22px_rgba(95,224,214,0.5)]"
      />
    </main>
  );
}
