import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Check, ChevronRight } from 'lucide-react';

const Section = ({ icon: Icon, iconBg, iconColor, title, children }) => (
  <div className="card" style={{ overflow:'hidden', marginBottom:16 }}>
    <div style={{ padding:'16px 22px', borderBottom:'1.5px solid var(--border-soft)', display:'flex', alignItems:'center', gap:10, background:'var(--bg-subtle)' }}>
      <div style={{ width:34, height:34, borderRadius:10, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={16} color={iconColor}/>
      </div>
      <h3 style={{ fontSize:14, fontWeight:800, color:'var(--text-heading)' }}>{title}</h3>
    </div>
    <div style={{ padding:24 }}>{children}</div>
  </div>
);

const Toggle = ({ on }) => (
  <div style={{ width:44, height:24, borderRadius:99, background: on ? 'var(--primary)' : 'var(--border)', display:'flex', alignItems:'center', padding:'2px 3px', cursor:'pointer', flexShrink:0, transition:'background .2s' }}>
    <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', boxShadow:'var(--shadow-sm)', marginLeft: on ? 'auto' : 0, transition:'margin .2s' }}/>
  </div>
);

export default function Settings() {
  const { user } = useAuth();
  const FIELDS = [
    { label:'Full Name',   val: user?.name,  ph:'Your name' },
    { label:'Email',       val: user?.email, ph:'you@example.com' },
    { label:'Role',        val: user?.role,  ph:'Role' },
    { label:'Department',  val:'Engineering', ph:'Department' },
  ];
  const NOTIFS = [
    { label:'Email notifications',      sub:'Receive digest via email',    on:true  },
    { label:'Push notifications',        sub:'In-browser alerts',           on:true  },
    { label:'Weekly digest report',      sub:'Every Monday morning',        on:false },
    { label:'Security alerts',           sub:'Login & access warnings',     on:true  },
    { label:'New user registrations',    sub:'When new users sign up',      on:false },
  ];

  return (
    <div className="fade-up" style={{ maxWidth:660 }}>
      <Section icon={User} iconBg="var(--primary-soft)" iconColor="var(--primary)" title="Profile Information">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
          {FIELDS.map(f => (
            <div key={f.label}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:6, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{f.label}</label>
              <input defaultValue={f.val} placeholder={f.ph} style={{ width:'100%', padding:'10px 13px', fontSize:13 }}/>
            </div>
          ))}
        </div>
        <button style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:10, background:'var(--primary)', border:'none', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'var(--shadow-blue)' }}>
          <Check size={14}/> Save Changes
        </button>
      </Section>

      <Section icon={Bell} iconBg="var(--emerald-soft)" iconColor="var(--emerald)" title="Notification Preferences">
        {NOTIFS.map((n, i) => (
          <div key={n.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom: i < NOTIFS.length-1 ? '1px solid var(--border-soft)' : 'none' }}>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text-heading)' }}>{n.label}</p>
              <p style={{ fontSize:12, color:'var(--text-faint)', marginTop:1 }}>{n.sub}</p>
            </div>
            <Toggle on={n.on}/>
          </div>
        ))}
      </Section>

      <Section icon={Shield} iconBg="var(--rose-soft)" iconColor="var(--rose)" title="Security">
        <div style={{ background:'var(--bg-subtle)', borderRadius:12, padding:'14px 18px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid var(--border)' }}>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text-heading)' }}>Last Login</p>
            <p style={{ fontSize:12, color:'var(--text-faint)', marginTop:2 }}>Today at 9:41 AM · Chrome, Windows</p>
          </div>
          <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:99, background:'#dcfce7', color:'#15803d' }}>● Active</span>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {['Change Password', 'Enable Two-Factor Auth', 'View Login History'].map(action => (
            <button key={action}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, background:'#fff', border:'1.5px solid var(--border)', color:'var(--text-body)', fontSize:13, fontWeight:600, transition:'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              {action} <ChevronRight size={13}/>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
