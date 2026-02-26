/*
  Dashboard React Module (pixel-perfect++)
  Version refinada — ainda mais fiel ao design original fornecido.
  Melhorias:
  - Tipografia mais suave (text-gray mais realista + hierarchy)
  - Espaçamentos, radii e sombras corrigidos para aproximar 100%
  - Sidebar mais precisa (cores, ícones placeholders, alinhamento)
  - Cards mais idênticos (shadow, hover, proporções)
  - Calendário ajustado para estilo exato
  - Estrutura geral alinhada ao layout 3 colunas

  IMPORTANTE:
  - O backend Gibbon PHP NÃO É ALTERADO.
  - Este módulo React apenas consome os endpoints — substitua os dados mockados
    por chamadas reais via Axios, React Query ou SWR.

  • Tailwind obrigatório
  • Use fonte Inter ou Manrope
  • Ative rounded-3xl, shadow-[custom], cores pastel no tailwind.config.js
*/

import React from 'react';
import { Bell, Mail, Settings, User } from 'lucide-react';

// Local reference image
const DESIGN_IMAGE = '/mnt/data/parent-dash-two.webp';

/* ---------------------------- Utility Components ---------------------------- */
const IconCircle = ({ children }) => (
  <div className="w-10 h-10 rounded-full bg-white shadow-sm grid place-items-center hover:shadow-md transition-all">
    {children}
  </div>
);

const MetricCard = ({ title, value }) => (
  <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-center h-[110px]">
    <div className="text-[13px] text-gray-500 font-medium">{title}</div>
    <div className="mt-2 text-[26px] font-semibold tracking-tight">{value}</div>
  </div>
);

/* ---------------------------- Sidebar ---------------------------- */
const Sidebar = () => {
  const items = [
    'Dashboard','Students','Teachers','Parents','Account','Class','Exam','Transport','Notice','Settings','Log out'
  ];
  return (
    <aside className="min-w-[230px] bg-[#F8F6F4] px-7 py-10 h-screen sticky top-0 border-r border-gray-200/40">
      <div className="mb-10 flex items-center gap-3 pl-2">
        <div className="w-10 h-10 bg-orange-300/40 rounded-xl grid place-items-center font-bold text-orange-700">A</div>
        <div className="text-xl font-semibold tracking-tight">ACERO</div>
      </div>
      <nav className="flex flex-col gap-4 select-none">
        {items.map((it) => (
          <div 
            key={it} 
            className={`flex items-center gap-3 text-gray-500 hover:text-gray-800 transition cursor-pointer px-2 py-2 rounded-xl ${it==='Parents' ? 'bg-white text-orange-500 shadow-md' : ''}`}
          >
            <div className="w-7 h-7 rounded-md bg-gray-200/40 grid place-items-center text-[11px] text-gray-400">•</div>
            <div className="text-[14px] font-medium">{it}</div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

/* ---------------------------- Topbar ---------------------------- */
const Topbar = () => (
  <header className="flex items-center justify-between py-4 px-2">
    <div className="flex items-center gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <input 
        className="w-[420px] bg-gray-100 rounded-full py-2.5 px-5 text-sm focus:outline-none shadow-inner" 
        placeholder="Search..." 
      />
    </div>
    <div className="flex items-center gap-5">
      <button className="text-sm text-gray-500 font-medium">EN</button>
      <IconCircle><Mail size={16} /></IconCircle>
      <IconCircle><Bell size={16} /></IconCircle>
      <div className="flex items-center gap-3 pr-2">
        <img src="https://i.pravatar.cc/45?img=12" className="w-11 h-11 rounded-full" alt="avatar" />
        <div className="text-sm leading-tight">
          <div className="font-semibold">Steven Jhon</div>
          <div className="text-xs text-gray-400">Admin</div>
        </div>
      </div>
    </div>
  </header>
);

/* ---------------------------- Parent + Kids Card ---------------------------- */
const ParentCard = ({ parent }) => (
  <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-7 w-full">
    <div className="flex gap-10">

      {/* LEFT: PARENT PHOTO */}
      <div className="w-[180px] flex flex-col items-center">
        <div className="relative">
          <div className="w-44 h-44 rounded-full bg-white shadow-inner grid place-items-center">
            <img src={parent.avatar} className="w-40 h-40 rounded-full object-cover" alt="parent" />
          </div>
        </div>
        <div className="mt-4 text-center leading-tight">
          <div className="font-semibold text-lg">{parent.name}</div>
          <div className="text-xs text-gray-500">{parent.email}</div>
          <div className="text-xs text-gray-500">{parent.phone}</div>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="px-4 py-1.5 rounded-full bg-gray-100 text-xs">Map</button>
          <button className="px-4 py-1.5 rounded-full bg-gray-100 text-xs">Call</button>
        </div>
      </div>

      {/* RIGHT: KIDS + COMMUNITY */}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-semibold">Parents</h3>
          <div className="text-gray-400 text-xl">···</div>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-5">
          {parent.kids.map(k => (
            <div key={k.name} className="bg-white rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.06)] p-5 text-center">
              <img src={k.avatar} className="w-16 h-16 rounded-full mx-auto" alt="kid" />
              <div className="mt-3 font-medium text-[15px]">{k.name}</div>
              <div className="text-xs text-gray-400">Class: {k.className}</div>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <div className="text-sm font-semibold text-gray-700 mb-3">Joined Community</div>
          <div className="flex gap-4">
            {parent.communities.map(c => (
              <div key={c.title} className="bg-white rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.06)] p-5 w-44">
                <div className="font-medium text-[15px]">{c.title}</div>
                <div className="text-xs text-gray-400">{c.subtitle}</div>
                <button className="mt-4 w-full py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-medium hover:bg-orange-200 transition">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ---------------------------- Calendar ---------------------------- */
const EventCalendar = () => (
  <div className="bg-[#565A80] rounded-3xl p-7 text-white w-full shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
    <div className="flex justify-between items-center">
      <div className="font-semibold text-lg">Event Calendar</div>
      <div className="opacity-50 text-xl">···</div>
    </div>

    <div className="mt-5 bg-white/10 rounded-full p-1 flex gap-2 text-sm">
      <button className="flex-1 py-2 rounded-full bg-[#F9D8C6] text-[#6B3C2F] font-semibold">Day to day</button>
      <button className="flex-1 py-2 rounded-full text-white/80">Events</button>
    </div>

    <div className="mt-5 text-sm font-medium">Feb 2023</div>

    <div className="mt-4 grid grid-cols-7 gap-2 text-[13px]">
      {Array.from({length:35}).map((_,i)=> (
        <div
          key={i}
          className={`py-3 rounded-xl grid place-items-center select-none ${i===23 ? 'bg-[#F9D8C6] text-black font-semibold' : 'bg-white/5'} `}
        >
          {i < 31 ? i+1 : ''}
        </div>
      ))}
    </div>
  </div>
);

/* ---------------------------- Expenses ---------------------------- */
const ExpenseRow = ({ item }) => (
  <div className="bg-white rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between">
    <div>
      <div className="font-medium text-[15px]">{item.title}</div>
      <div className="text-xs text-gray-400">{item.date}</div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-sm text-orange-500 font-medium">${item.amount}</div>
      <div className={`px-4 py-1.5 rounded-full text-xs font-semibold ${item.status==='Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{item.status}</div>
    </div>
  </div>
);

const ExpensesList = ({ items }) => (
  <div className="space-y-4">
    {items.map(it => <ExpenseRow key={it.title} item={it} />)}
  </div>
);

/* ---------------------------- Exam Table ---------------------------- */
const ExamTable = ({ rows }) => (
  


