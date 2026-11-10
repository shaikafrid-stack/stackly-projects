import { ChartIcon, HexOutlineIcon, ShieldFilledIcon, HexBadgeIcon } from "./icons.jsx";

const features = [
  { icon: ChartIcon, title: "Real-Time Analytics", text: "Monitor metrics and performance in real-time" },
  { icon: HexOutlineIcon, title: "AI-Powered Insights", text: "Discover patterns and predict outcome" },
  { icon: ShieldFilledIcon, title: "Enterprise Security", text: "Bank-grade security and data governance" },
  { icon: HexBadgeIcon, title: "Scalable Platform", text: "Build for performance and enterprise" },
];

export default function FeatureList() {
  return (
    <ul className="flex flex-col gap-7">
      {features.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-center gap-[13px]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[5px] bg-white text-brand shadow-icon">
            <Icon />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-[18px] text-white">{title}</p>
            <p className="mt-[3px] text-[10.25px] leading-[12px] text-white">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
