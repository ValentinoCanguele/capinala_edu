import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, Mail } from 'lucide-react'

const GlobalStyles = () => (
  <style>{`:root{--bg:#fbfbfc;--sidebar:#f6f2ee;--muted:#6b7280;--primary:#5b4fc7;--accent:#f6c9b8;--card:#ffffff;--soft:#eef2ff;--success:#dcfce7;--danger:#fff7ed;--text:#111827}html,body,#root{height:100%}body{background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial}</style>)}
)

const IconCircle = React.memo(({ children }) => (
  <div className="w-10 h-10 rounded-full shadow-sm grid place-items-center transition-all" style={{background:'var(--card)'}}>{children}</div>
))

const MetricCard = React.memo(({ title, value }) => (
  <div className="rounded-3xl p-5 flex flex-col justify-center h-[110px]" style={{background:'var(--card)',boxShadow:'0 12px 32px rgba(88,76,160,0.08)'}} role="group" aria-label={title}>
    <div className="text-[13px]" style={{color:'var(--muted)',fontWeight:600}}>{title}</div>
    <div className="mt-2 text-[26px] font-semibold tracking-tight">{value}</div>
  </div>
))

const Sidebar = React.memo(({ items = [] }) => {
  const defaultItems = useMemo(() => items.length ? items : ['Dashboard','Students','Teachers','Parents','Account','Class','Exam','Transport','Notice','Settings','Log out'], [items])
  return (
    <aside style={{background:'var(--sidebar)'}} className="min-w-[230px] px-7 py-10 h-screen sticky top-0 border-r border-gray-200/30" aria-label="Sidebar">
      <div className="mb-10 flex items-center gap-3 pl-2">
        <div className="w-10 h-10 rounded-xl grid place-items-center font-bold text-orange-700" style={{background:'var(--accent)'}}>A</div>
        <div className="text-xl font-semibold tracking-tight">ACERO</div>
      </div>
      <nav className="flex flex-col gap-4" role="navigation" aria-label="Main navigation">
        {defaultItems.map((it) => (
          <button key={it} className={`w-full text-left flex items-center gap-3 transition cursor-pointer px-2 py-2 rounded-xl ${it==='Parents' ? 'shadow-md' : ''}`} style={{color:it==='Parents' ? 'var(--primary)' : 'var(--muted)'}}>
            <span className="w-7 h-7 rounded-md grid place-items-center text-[11px]">•</span>
            <span className="text-[14px] font-medium">{it}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
})

const Topbar = React.memo(() => (
  <header className="flex items-center justify-between py-4 px-2" role="banner">
    <div className="flex items-center gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <input aria-label="Search" className="w-[420px] rounded-full py-2.5 px-5 text-sm focus:outline-none shadow-inner" placeholder="Search..." style={{background:'#f3f4f6'}} />
    </div>
    <div className="flex items-center gap-5">
      <button className="text-sm font-medium" aria-label="Language" style={{color:'var(--muted)'}}>EN</button>
      <IconCircle><Mail size={16} /></IconCircle>
      <IconCircle><Bell size={16} /></IconCircle>
      <div className="flex items-center gap-3 pr-2">
        <img src="https://i.pravatar.cc/45?img=12" className="w-11 h-11 rounded-full" alt="User avatar" />
        <div className="text-sm leading-tight">
          <div className="font-semibold">Steven Jhon</div>
          <div style={{color:'var(--muted)',fontSize:12}}>Admin</div>
        </div>
      </div>
    </div>
  </header>
))

const ParentCard = React.memo(({ parent }) => {
  const kids = parent?.kids || []
  const communities = parent?.communities || []
  return (
    <section className="rounded-3xl p-7 w-full" style={{background:'var(--card)',boxShadow:'0 12px 32px rgba(88,76,160,0.06)'}} aria-labelledby="parent-heading">
      <div className="flex gap-10">
        <div className="w-[180px] flex flex-col items-center">
          <div className="relative">
            <div className="w-44 h-44 rounded-full grid place-items-center" style={{background:'linear-gradient(180deg, rgba(91,79,199,0.08), rgba(246,201,184,0.06))'}}>
              <img src={parent?.avatar} className="w-40 h-40 rounded-full object-cover" alt={`${parent?.name} avatar`} />
            </div>
          </div>
          <div className="mt-4 text-center leading-tight">
            <div className="font-semibold text-lg">{parent?.name}</div>
            <div style={{color:'var(--muted)',fontSize:12}}>{parent?.email}</div>
            <div style={{color:'var(--muted)',fontSize:12}}>{parent?.phone}</div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-1.5 rounded-full text-xs" style={{background:'#f8fafc'}}>Map</button>
            <button className="px-4 py-1.5 rounded-full text-xs" style={{background:'#f8fafc'}}>Call</button>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 id="parent-heading" className="text-[18px] font-semibold">Parents</h3>
            <div style={{color:'var(--muted)'}}>···</div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-5">
            {kids.map(k => (
              <article key={k.name} className="rounded-2xl p-5 text-center" style={{background:'var(--card)',boxShadow:'0 6px 20px rgba(17,24,39,0.04)'}} aria-label={`Child ${k.name}`}>
                <img src={k.avatar} className="w-16 h-16 rounded-full mx-auto" alt={`${k.name} avatar`} />
                <div className="mt-3 font-medium text-[15px]">{k.name}</div>
                <div style={{color:'var(--muted)',fontSize:12}}>Class: {k.className}</div>
              </article>
            ))}
          </div>
          <div className="mt-7">
            <div style={{fontWeight:600,color:'var(--muted)',marginBottom:8}}>Joined Community</div>
            <div className="flex gap-4">
              {communities.map(c => (
                <div key={c.title} className="rounded-2xl p-5 w-44" style={{background:'var(--card)',boxShadow:'0 6px 20px rgba(17,24,39,0.04)'}}>
                  <div style={{fontWeight:600,fontSize:15}}>{c.title}</div>
                  <div style={{color:'var(--muted)',fontSize:12}}>{c.subtitle}</div>
                  <button className="mt-4 w-full py-1.5 rounded-full text-sm font-medium" style={{background:'var(--accent)',color:'#6B3C2F'}}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

const EventCalendar = React.memo(() => (
  <aside className="rounded-3xl p-7 w-full" style={{background:'var(--primary)',color:'#fff',boxShadow:'0 12px 32px rgba(88,76,160,0.06)'}} aria-label="Event calendar">
    <div className="flex justify-between items-center">
      <div style={{fontWeight:600,fontSize:18}}>Event Calendar</div>
      <div style={{opacity:0.6}}>···</div>
    </div>
    <div className="mt-5 rounded-full p-1 flex gap-2 text-sm" style={{background:'rgba(255,255,255,0.06)'}}>
      <button className="flex-1 py-2 rounded-full font-semibold" style={{background:'var(--accent)',color:'#6B3C2F'}}>Day to day</button>
      <button className="flex-1 py-2 rounded-full" style={{color:'rgba(255,255,255,0.85)'}}>Events</button>
    </div>
    <div className="mt-5" style={{fontWeight:600}}>Feb 2023</div>
    <div className="mt-4 grid grid-cols-7 gap-2 text-[13px]">
      {Array.from({length:35}).map((_,i)=> (
        <div key={i} className={`py-3 rounded-xl grid place-items-center select-none ${i===23 ? 'font-semibold' : ''}`} style={{background:i===23 ? 'var(--accent)': 'rgba(255,255,255,0.04)',color:i===23 ? '#000' : 'rgba(255,255,255,0.9)'}}>{i < 31 ? i+1 : ''}</div>
      ))}
    </div>
  </aside>
))

const ExpenseRow = React.memo(({ item }) => (
  <div className="rounded-2xl p-5 flex items-center justify-between" style={{background:'var(--card)',boxShadow:'0 8px 24px rgba(17,24,39,0.06)'}}>
    <div>
      <div style={{fontWeight:600,fontSize:15}}>{item.title}</div>
      <div style={{color:'var(--muted)',fontSize:12}}>{item.date}</div>
    </div>
    <div className="flex items-center gap-4">
      <div style={{fontSize:14,color:'var(--accent)'}}>${item.amount}</div>
      <div className={`px-4 py-1.5 rounded-full text-xs font-semibold`} style={{background:item.status==='Paid' ? 'var(--success)' : 'var(--danger)',color:item.status==='Paid' ? '#166534' : '#92400e'}}>{item.status}</div>
    </div>
  </div>
))

const ExpensesList = React.memo(({ items }) => (
  <div className="space-y-4">{items.map(it => <ExpenseRow key={it.title} item={it} />)}</div>
))

const DashboardLayout = React.memo(({ children, sidebarItems }) => (
  <div className="flex gap-6">
    <Sidebar items={sidebarItems} />
    <main className="flex-1 px-6 py-6" role="main">
      <Topbar />
      {children}
    </main>
    <aside className="w-[360px] p-6" aria-label="Right sidebar">
      <EventCalendar />
      <div className="mt-6">
        <div style={{fontWeight:600,marginBottom:12}}>All Expenses</div>
        <ExpensesList items={[{title:'Exam Fees',amount:150,status:'Paid',date:'22/02/2019'},{title:'Semister Fees',amount:350,status:'Due',date:'22/02/2019'},{title:'Project Fees',amount:400,status:'Paid',date:'22/02/2019'}]} />
      </div>
    </aside>
  </div>
))

function useParentData() {
  const [data, setData] = useState(null)
  useEffect(() => {
    let mounted = true
    const timeout = setTimeout(() => {
      if (!mounted) return
      setData({
        avatar: 'https://i.pravatar.cc/200?img=5',
        name: 'William Balck',
        email: 'williamblack@gmail.com',
        phone: '+88 9856418',
        kids: [
          { name: 'Jessia', avatar: 'https://i.pravatar.cc/80?img=2', className: '2nd' },
          { name: 'Jack', avatar: 'https://i.pravatar.cc/80?img=3', className: '6th' },
          { name: 'Jason', avatar: 'https://i.pravatar.cc/80?img=4', className: '11th' }
        ],
        communities: [
          { title: 'Parents', subtitle: 'Union' },
          { title: 'Transportation', subtitle: 'March' },
          { title: 'Marathon', subtitle: '2023' }
        ]
      })
    }, 120)
    return () => { mounted = false; clearTimeout(timeout) }
  }, [])
  return data
}

export default function Dashboard() {
  const parent = useParentData() || {}
  const metrics = useMemo(() => [
    { title: 'Due Fees', value: '$4503' },
    { title: 'Results', value: '24' },
    { title: 'Complaints', value: '12' },
    { title: 'Expenses', value: '$54000' }
  ], [])

  const sidebarItems = useMemo(() => ['Dashboard','Students','Teachers','Parents','Account','Class','Exam','Transport','Notice','Settings','Log out'], [])

  const renderMetrics = useCallback(() => metrics.map(m => <MetricCard key={m.title} {...m} />), [metrics])

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen font-sans">
        <DashboardLayout sidebarItems={sidebarItems}>
          <div className="grid grid-cols-4 gap-4">{renderMetrics()}</div>
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <ParentCard parent={parent} />
            </div>
            <div className="col-span-1" />
          </div>
        </DashboardLayout>
      </div>
    </>
  )
}
