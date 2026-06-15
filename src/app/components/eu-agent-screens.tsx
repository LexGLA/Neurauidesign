import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { useApp } from './app-context';
import { toFa } from './data';
import { ImageWithFallback } from './figma/ImageWithFallback';

// ========================
// SHARED STYLES & COMPONENTS
// ========================
const euCardStyle: React.CSSProperties = {
  background: 'var(--aw-eu-card)',
  borderRadius: 14,
  border: '1px solid rgba(126,95,170,0.15)',
};

function AgentHeader({ title, icon, color, onBack, badge, rightAction }: {
  title: string; icon: string; color: string; onBack: () => void;
  badge?: React.ReactNode; rightAction?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0" style={{ background: 'var(--aw-bg-header)', borderBottom: '1px solid var(--aw-border)' }}>
      <button className="w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-secondary)] cursor-pointer flex items-center justify-center hover:text-[var(--aw-eu-primary)] hover:border-[var(--aw-eu-primary)] transition-all"
        onClick={onBack}>
        <i className="fa-solid fa-arrow-right text-sm" />
      </button>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <i className={`${icon} text-[16px]`} style={{ color }} />
      </div>
      <h2 className="text-[16px] text-[var(--aw-text-primary)] m-0 flex-1" style={{ fontWeight: 800 }}>{title}</h2>
      {badge}
      {rightAction}
    </div>
  );
}

function AgentTabBar({ tabs, active, onChange }: { tabs: { id: string; icon: string; label: string; badge?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <nav className="flex-shrink-0 flex border-t border-[var(--aw-border)] px-1 py-1"
      style={{ background: 'var(--aw-bg-header)', backdropFilter: 'blur(20px)', paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
      {tabs.map(t => (
        <button key={t.id}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-0.5 border-none bg-transparent cursor-pointer transition-all rounded-[10px] text-[9px] relative ${
            active === t.id ? 'text-[var(--aw-eu-primary)]' : 'text-[var(--aw-text-muted)]'
          }`}
          style={{ fontWeight: active === t.id ? 700 : 500 }}
          onClick={() => onChange(t.id)}>
          <i className={`${t.icon} text-[17px]`} />
          <span>{t.label}</span>
          {active === t.id && <div className="absolute bottom-0 w-5 h-[2.5px] rounded-full" style={{ background: 'var(--aw-eu-primary)' }} />}
          {t.badge != null && t.badge > 0 && (
            <span className="absolute top-0 right-1/4 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px]" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>{toFa(t.badge)}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return <span className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center" style={{ background: `${color}18`, color, fontWeight: 600 }}>{label}</span>;
}

function SectionTitle({ icon, title, extra }: { icon: string; title: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <div className="text-[12px] text-[var(--aw-text-muted)] flex items-center gap-1" style={{ fontWeight: 700 }}>
        <i className={icon} /> {title}
      </div>
      {extra}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-12 text-[var(--aw-text-muted)]">
      <i className={`${icon} text-[48px] opacity-20 block mb-4`} />
      <p className="text-[12px]">{text}</p>
    </div>
  );
}

// Mini chat preview for chat tabs
function MiniChatPreview({ messages, agentName, agentIcon, agentColor, onOpenFull }: {
  messages: { from: 'user' | 'agent'; text: string }[];
  agentName: string; agentIcon: string; agentColor: string; onOpenFull: () => void;
}) {
  const [inputText, setInputText] = useState('');
  const { showToast } = useApp();
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-3 aw-scroll space-y-2">
        {messages.map((m, i) => (
          <motion.div key={i} className={`flex ${m.from === 'user' ? 'justify-start' : 'justify-end'}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-[12px] ${
              m.from === 'user'
                ? 'bg-[var(--aw-eu-primary)] text-white rounded-br-md'
                : 'rounded-bl-md'
            }`} style={m.from === 'agent' ? { background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' } : {}}>
              {m.from === 'agent' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[8px]" style={{ background: agentColor }}>
                    <i className={agentIcon} />
                  </div>
                  <span className="text-[10px] text-[var(--aw-text-muted)]" style={{ fontWeight: 600 }}>{agentName}</span>
                </div>
              )}
              <span style={{ lineHeight: '1.7' }}>{m.text}</span>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--aw-border)]">
        <div className="flex-1 flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <input className="flex-1 bg-transparent border-none py-2.5 text-[12px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
            placeholder="پیام خود را بنویسید..." value={inputText} onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && inputText.trim()) { showToast('پیام ارسال شد'); setInputText(''); } }} />
        </div>
        <button className="w-10 h-10 rounded-xl border-none text-white cursor-pointer flex items-center justify-center text-[14px]"
          style={{ background: agentColor }}
          onClick={() => { if (inputText.trim()) { showToast('پیام ارسال شد'); setInputText(''); } else { onOpenFull(); } }}>
          <i className={inputText.trim() ? 'fa-solid fa-paper-plane' : 'fa-solid fa-expand'} />
        </button>
      </div>
    </div>
  );
}

// =====================================================================
//  1.  DINE SCREEN (سفارش غذا)
// =====================================================================
const DINE_TABS = [
  { id: 'restaurants', icon: 'fa-solid fa-store', label: 'رستوران‌ها' },
  { id: 'orders', icon: 'fa-solid fa-shopping-bag', label: 'سفارشات من' },
  { id: 'chat', icon: 'fa-solid fa-comments', label: 'گفتگو' },
  { id: 'offers', icon: 'fa-solid fa-star', label: 'پیشنهادها' },
  { id: 'account', icon: 'fa-solid fa-user', label: 'حساب من' },
];

const MENU_CATEGORIES = [
  { id: 'all', label: 'همه', icon: 'fa-solid fa-border-all' },
  { id: 'iranian', label: 'ایرانی', icon: 'fa-solid fa-fire' },
  { id: 'fastfood', label: 'فست‌فود', icon: 'fa-solid fa-burger' },
  { id: 'salad', label: 'سالاد', icon: 'fa-solid fa-leaf' },
  { id: 'drink', label: 'نوشیدنی', icon: 'fa-solid fa-mug-hot' },
];

interface MenuItem { id: number; name: string; desc: string; price: string; priceNum: number; category: string; image: string; rating: number; time: string; discount?: number; popular?: boolean }

const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: 'چلوکباب سلطانی', desc: 'یک سیخ کوبیده + یک سیخ برگ با برنج زعفرانی', price: '۲۸۵,۰۰۰', priceNum: 285000, category: 'iranian', image: 'https://images.unsplash.com/photo-1634324092536-74480096b939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzaWFuJTIwZm9vZCUyMGtlYmFiJTIwcmljZXxlbnwxfHx8fDE3NzE4NTg3MjV8MA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.8, time: '۳۰ دقیقه', popular: true },
  { id: 2, name: 'پیتزا مخلوط', desc: 'پیتزا با گوشت چرخ‌کرده و سبزیجات', price: '۱۸۵,۰۰۰', priceNum: 185000, category: 'fastfood', image: 'https://images.unsplash.com/photo-1609795829951-325b91a41471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRlbGl2ZXJ5JTIwZm9vZHxlbnwxfHx8fDE3NzE4NTE4ODJ8MA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.5, time: '۲۵ دقیقه', discount: 15 },
  { id: 3, name: 'جوجه کباب ویژه', desc: 'جوجه کباب با برنج زعفرانی و گوجه', price: '۲۲۰,۰۰۰', priceNum: 220000, category: 'iranian', image: 'https://images.unsplash.com/photo-1564636242997-77953084df48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMHBsYXRlJTIwbWVhbHxlbnwxfHx8fDE3NzE3ODUwNzB8MA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.7, time: '۳۵ دقیقه', popular: true },
  { id: 4, name: 'همبرگر مخصوص', desc: 'همبرگر دست‌ساز ۲۰۰ گرمی با پنیر و سس', price: '۱۴۵,۰۰۰', priceNum: 145000, category: 'fastfood', image: 'https://images.unsplash.com/photo-1614597546944-a54636047376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW1idXJnZXIlMjBmYXN0JTIwZm9vZHxlbnwxfHx8fDE3NzE4MjYxNTl8MA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.3, time: '۲۰ دقیقه', discount: 20 },
  { id: 5, name: 'سالاد سزار', desc: 'سالاد تازه با سینه مرغ و سس سزار', price: '۹۵,۰۰۰', priceNum: 95000, category: 'salad', image: 'https://images.unsplash.com/photo-1605034298551-baacf17591d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNhbGFkJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcxODU4NzM1fDA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.4, time: '۱۰ دقیقه' },
  { id: 6, name: 'زرشک‌پلو با مرغ', desc: 'برنج با زرشک و زعفران و ران مرغ', price: '۱۹۵,۰۰۰', priceNum: 195000, category: 'iranian', image: 'https://images.unsplash.com/photo-1654886966939-e7a8643469b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwcmljZSUyMHNhZmZyb24lMjBwbGF0ZXxlbnwxfHx8fDE3NzE4NTk5NzV8MA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.6, time: '۳۵ دقیقه' },
  { id: 7, name: 'قرمه‌سبزی', desc: 'خورشت قرمه‌سبزی با برنج ایرانی', price: '۱۷۰,۰۰۰', priceNum: 170000, category: 'iranian', image: 'https://images.unsplash.com/photo-1640542509430-f529fdfce835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzaWFuJTIwc3RldyUyMGdob3JtZWglMjBmb29kfGVufDF8fHx8MTc3MTg1OTk3Nnww&ixlib=rb-4.1.0&q=80&w=400', rating: 4.9, time: '۴۰ دقیقه', popular: true },
  { id: 8, name: 'فلافل رپ', desc: 'فلافل تازه با سبزیجات در نان لواش', price: '۸۵,۰۰۰', priceNum: 85000, category: 'fastfood', image: 'https://images.unsplash.com/photo-1697126248475-a537cc5cce28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWxhZmVsJTIwd3JhcCUyMG1pZGRsZSUyMGVhc3Rlcm58ZW58MXx8fHwxNzcxODA5MzczfDA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.2, time: '۱۵ دقیقه' },
];

interface CartItem { menuItem: MenuItem; qty: number }

// Dine orders
interface DineOrder { id: number; num: string; items: string; status: 'preparing' | 'delivering' | 'delivered' | 'cancelled'; restaurant: string; date: string; total: string; eta?: string; progress?: number }

const DINE_ORDERS: DineOrder[] = [
  { id: 1, num: '۱۰۲۶', items: 'چلوکباب سلطانی × ۲', status: 'preparing', restaurant: 'رستوران شاندیز', date: 'امروز ۱۲:۳۰', total: '۵۷۰,۰۰۰', eta: '۲۰ دقیقه', progress: 60 },
  { id: 2, num: '۱۰۲۵', items: 'پیتزا مخلوط + نوشابه', status: 'delivering', restaurant: 'فست‌فود نیکا', date: 'امروز ۱۱:۰۰', total: '۲۱۵,۰۰۰', eta: '۱۰ دقیقه', progress: 85 },
  { id: 3, num: '۱۰۲۴', items: 'همبرگر مخصوص × ۳', status: 'delivered', restaurant: 'فست‌فود نیکا', date: 'دیروز', total: '۴۳۵,۰۰۰' },
  { id: 4, num: '۱۰۲۳', items: 'چلوکباب سلطانی + قرمه‌سبزی', status: 'delivered', restaurant: 'رستوران شاندیز', date: '۲ روز پیش', total: '۴۵۵,۰۰۰' },
  { id: 5, num: '۱۰۲۲', items: 'سالاد سزار + آب‌میوه', status: 'cancelled', restaurant: 'سالاد بار سبز', date: '۳ روز پیش', total: '۱۳۵,۰۰۰' },
  { id: 6,  num: '۱۰۲۱', items: 'جوجه‌کباب + برنج زعفرانی', status: 'delivered', restaurant: 'رستوران شاندیز', date: '۴ روز پیش', total: '۳۸۵,۰۰۰' },
  { id: 7,  num: '۱۰۲۰', items: 'پیتزا پپرونی × ۲', status: 'delivered', restaurant: 'پیتزا ایتالیا', date: '۵ روز پیش', total: '۴۹۰,۰۰۰' },
  { id: 8,  num: '۱۰۱۹', items: 'ساندویچ مرغ + سیب‌زمینی', status: 'delivered', restaurant: 'فست‌فود نیکا', date: '۶ روز پیش', total: '۱۸۵,۰۰۰' },
  { id: 9,  num: '۱۰۱۸', items: 'دیزی سنگی', status: 'delivered', restaurant: 'سفره خانه سنتی', date: '۷ روز پیش', total: '۲۲۰,۰۰۰' },
  { id: 10, num: '۱۰۱۷', items: 'سالاد یونانی + سوپ', status: 'cancelled', restaurant: 'سالاد بار سبز', date: '۸ روز پیش', total: '۱۶۵,۰۰۰' },
  { id: 11, num: '۱۰۱۶', items: 'برگر دوبل + نوشابه', status: 'delivered', restaurant: 'فست‌فود نیکا', date: '۹ روز پیش', total: '۲۹۵,۰۰۰' },
  { id: 12, num: '۱۰۱۵', items: 'قرمه سبزی + سالاد شیرازی', status: 'delivered', restaurant: 'رستوران دربار', date: '۱۰ روز پیش', total: '۲۸۵,۰۰۰' },
  { id: 13, num: '۱۰۱۴', items: 'پاستا آلفردو', status: 'delivered', restaurant: 'پیتزا ایتالیا', date: '۱۲ روز پیش', total: '۳۲۰,۰۰۰' },
  { id: 14, num: '۱۰۱۳', items: 'کباب کوبیده × ۴', status: 'delivered', restaurant: 'رستوران شاندیز', date: '۱۴ روز پیش', total: '۶۸۰,۰۰۰' },
  { id: 15, num: '۱۰۱۲', items: 'مرغ بریان کامل', status: 'delivered', restaurant: 'بریانی شعبه مرکزی', date: '۱۶ روز پیش', total: '۴۲۰,۰۰۰' },
  { id: 16, num: '۱۰۱۱', items: 'سوشی مخصوص × ۲', status: 'delivered', restaurant: 'سوشی توکیو', date: '۱۸ روز پیش', total: '۸۹۰,۰۰۰' },
  { id: 17, num: '۱۰۱۰', items: 'فلافل رپ + نوشابه', status: 'cancelled', restaurant: 'فلافل خوشمزه', date: '۲۰ روز پیش', total: '۹۵,۰۰۰' },
  { id: 18, num: '۱۰۰۹', items: 'باقالی پلو با ماهیچه', status: 'delivered', restaurant: 'رستوران دربار', date: '۲۲ روز پیش', total: '۵۲۰,۰۰۰' },
  { id: 19, num: '۱۰۰۸', items: 'پیتزا قارچ و گوشت', status: 'delivered', restaurant: 'پیتزا ایتالیا', date: '۲۵ روز پیش', total: '۳۸۰,۰۰۰' },
  { id: 20, num: '۱۰۰۷', items: 'استیک گوشت + سالاد', status: 'delivered', restaurant: 'استیک‌هاوس کلاسیک', date: '۲۸ روز پیش', total: '۹۸۰,۰۰۰' },
  { id: 21, num: '۱۰۰۶', items: 'چلوماهی قزل‌آلا', status: 'delivered', restaurant: 'رستوران دربار', date: '۳۲ روز پیش', total: '۴۸۰,۰۰۰' },
  { id: 22, num: '۱۰۰۵', items: 'برگر چیز × ۲', status: 'delivered', restaurant: 'فست‌فود نیکا', date: '۳۵ روز پیش', total: '۳۲۰,۰۰۰' },
  { id: 23, num: '۱۰۰۴', items: 'لازانیا گوشت', status: 'delivered', restaurant: 'پیتزا ایتالیا', date: '۴۰ روز پیش', total: '۲۹۰,۰۰۰' },
  { id: 24, num: '۱۰۰۳', items: 'خوراک ماهی + سبزیجات', status: 'delivered', restaurant: 'رستوران دریایی', date: '۴۵ روز پیش', total: '۵۶۰,۰۰۰' },
  { id: 25, num: '۱۰۰۲', items: 'سالاد سزار با مرغ', status: 'cancelled', restaurant: 'سالاد بار سبز', date: '۵۰ روز پیش', total: '۱۴۵,۰۰۰' },
  { id: 26, num: '۱۰۰۱', items: 'بیریانی هندی', status: 'delivered', restaurant: 'هند فود', date: '۵۵ روز پیش', total: '۳۶۵,۰۰۰' },
  { id: 27, num: '۱۰۰۰', items: 'کباب لقمه + ماست', status: 'delivered', restaurant: 'رستوران شاندیز', date: '۶۰ روز پیش', total: '۲۷۵,۰۰۰' },
  { id: 28, num: '۹۹۹',  items: 'پاستا کاربونارا', status: 'delivered', restaurant: 'پیتزا ایتالیا', date: '۷۰ روز پیش', total: '۳۱۰,۰۰۰' },
  { id: 29, num: '۹۹۸',  items: 'جوجه چینی + برنج', status: 'delivered', restaurant: 'رستوران چینی پکن', date: '۸۰ روز پیش', total: '۲۸۰,۰۰۰' },
  { id: 30, num: '۹۹۷',  items: 'تاکو مکزیکی × ۳', status: 'delivered', restaurant: 'مکزیکی فیستا', date: '۹۰ روز پیش', total: '۳۹۵,۰۰۰' },
  { id: 31, num: '۹۹۶',  items: 'استیک سالمون', status: 'delivered', restaurant: 'رستوران دریایی', date: '۱۰۰ روز پیش', total: '۷۲۰,۰۰۰' },
  { id: 32, num: '۹۹۵',  items: 'کباب ترش گیلانی', status: 'delivered', restaurant: 'رستوران دربار', date: '۱۲۰ روز پیش', total: '۴۹۰,۰۰۰' },
  { id: 33, num: '۹۹۴',  items: 'پیتزا چهار فصل', status: 'delivered', restaurant: 'پیتزا ایتالیا', date: '۱۴۰ روز پیش', total: '۴۲۰,۰۰۰' },
  { id: 34, num: '۹۹۳',  items: 'فاهیتا با مرغ', status: 'delivered', restaurant: 'مکزیکی فیستا', date: '۱۶۰ روز پیش', total: '۳۸۵,۰۰۰' },
  { id: 35, num: '۹۹۲',  items: 'سوشی سالمون × ۳', status: 'delivered', restaurant: 'سوشی توکیو', date: '۱۸۰ روز پیش', total: '۹۲۰,۰۰۰' },
  { id: 36, num: '۹۹۱',  items: 'خوراک گوشت گوسفندی', status: 'delivered', restaurant: 'رستوران دربار', date: '۲۰۰ روز پیش', total: '۶۸۰,۰۰۰' },
  { id: 37, num: '۹۹۰',  items: 'برگر گیاهی', status: 'cancelled', restaurant: 'فست‌فود نیکا', date: '۲۲۰ روز پیش', total: '۱۹۵,۰۰۰' },
  { id: 38, num: '۹۸۹',  items: 'پیتزا مارگاریتا', status: 'delivered', restaurant: 'پیتزا ایتالیا', date: '۲۵۰ روز پیش', total: '۲۸۰,۰۰۰' },
  { id: 39, num: '۹۸۸',  items: 'سوپ جو + نان', status: 'delivered', restaurant: 'سفره خانه سنتی', date: '۲۸۰ روز پیش', total: '۱۱۰,۰۰۰' },
  { id: 40, num: '۹۸۷',  items: 'ابگوشت سنتی', status: 'delivered', restaurant: 'سفره خانه سنتی', date: '۳۲۰ روز پیش', total: '۱۹۰,۰۰۰' },
];

const dineOrderStatusMap: Record<string, { color: string; label: string; icon: string }> = {
  preparing: { color: '#F59E0B', label: 'در حال آماده‌سازی', icon: 'fa-solid fa-fire-burner' },
  delivering: { color: '#3B82F6', label: 'در حال ارسال', icon: 'fa-solid fa-motorcycle' },
  delivered: { color: '#10B981', label: 'تحویل شده', icon: 'fa-solid fa-circle-check' },
  cancelled: { color: '#EF4444', label: 'لغو شده', icon: 'fa-solid fa-ban' },
};

interface Restaurant { id: number; name: string; type: string; rating: number; distance: string; deliveryTime: string; isOpen: boolean; minOrder: string; icon: string; color: string }

const RESTAURANTS: Restaurant[] = [
  { id: 1, name: 'رستوران شاندیز', type: 'ایرانی سنتی', rating: 4.8, distance: '۱.۲ km', deliveryTime: '۳۰-۴۵ دقیقه', isOpen: true, minOrder: '۱۵۰,۰۰۰', icon: 'fa-solid fa-utensils', color: '#F59E0B' },
  { id: 2, name: 'فست‌فود نیکا', type: 'فست‌فود', rating: 4.5, distance: '۰.۸ km', deliveryTime: '۲۰-۳۰ دقیقه', isOpen: true, minOrder: '۱۰۰,۰۰۰', icon: 'fa-solid fa-burger', color: '#EF4444' },
  { id: 3, name: 'رستوران سنتی دربار', type: 'سنتی لوکس', rating: 4.9, distance: '۳.۵ km', deliveryTime: '۴۰-۶۰ دقیقه', isOpen: true, minOrder: '۲۰۰,۰۰۰', icon: 'fa-solid fa-crown', color: '#8B5CF6' },
  { id: 4, name: 'پیتزا هات', type: 'ایتالیایی', rating: 4.2, distance: '۲.۱ km', deliveryTime: '۲۵-۴۰ دقیقه', isOpen: false, minOrder: '۱۲۰,۰۰۰', icon: 'fa-solid fa-pizza-slice', color: '#3B82F6' },
  { id: 5, name: 'سالاد بار سبز', type: 'سلامت و رژیمی', rating: 4.6, distance: '۱.۵ km', deliveryTime: '۱۵-۲۵ دقیقه', isOpen: true, minOrder: '۸۰,۰۰۰', icon: 'fa-solid fa-seedling', color: '#10B981' },
];

interface Offer { id: number; title: string; desc: string; discount: number; restaurant: string; validUntil: string; code: string; color: string; icon: string }

const OFFERS: Offer[] = [
  { id: 1, title: 'تخفیف اولین سفارش', desc: 'با ثبت اولین سفارش از هر رستوران', discount: 30, restaurant: 'همه رستوران‌ها', validUntil: 'تا پایان ماه', code: 'FIRST30', color: '#10B981', icon: 'fa-solid fa-gift' },
  { id: 2, title: 'پیشنهاد ویژه ناهار', desc: 'غذاهای منتخب ایرانی با تخفیف', discount: 20, restaurant: 'رستوران شاندیز', validUntil: 'روزهای کاری ۱۱-۱۴', code: 'LUNCH20', color: '#F97316', icon: 'fa-solid fa-sun' },
  { id: 3, title: 'جشنواره فست‌فود', desc: 'تخفیف روی همه فست‌فودها', discount: 15, restaurant: 'فست‌فود نیکا', validUntil: 'تا ۵ روز دیگر', code: 'FAST15', color: '#8B5CF6', icon: 'fa-solid fa-fire' },
  { id: 4, title: 'پیشنهاد AI برای شما', desc: 'قرمه‌سبزی — بر اساس سفارشات قبلی شما', discount: 10, restaurant: 'رستوران سنتی دربار', validUntil: 'فقط امروز', code: 'AI10', color: '#EC4899', icon: 'fa-solid fa-wand-magic-sparkles' },
];

const DINE_CHAT_MSGS = [
  { from: 'agent' as const, text: 'سلام! به ایجنت Dine خوش آمدید. چطور می‌تونم کمکتون کنم؟' },
  { from: 'user' as const, text: 'سلام، می‌خوام یه غذای ایرانی سفارش بدم.' },
  { from: 'agent' as const, text: 'عالیه! چلوکباب سلطانی و قرمه‌سبزی امروز پرطرفدارن. می‌خواین منو رو ببینین یا مستقیم سفارش بدین؟' },
  { from: 'user' as const, text: 'قرمه‌سبزی خوبه، یه پرس لطفاً.' },
  { from: 'agent' as const, text: 'یک پرس قرمه‌سبزی از رستوران شاندیز ثبت شد. زمان تقریبی: ۴۰ دقیقه. هزینه: ۱۷۰,۰۰۰ تومان. تأیید می‌کنین؟' },
];

function DineMenuTab({ cart, setCart }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>> }) {
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = MENU_ITEMS.filter(m => (cat === 'all' || m.category === cat) && (!search || m.name.includes(search) || m.desc.includes(search)));

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { menuItem: item, qty: 1 }];
    });
  }, [setCart]);

  const getQty = (id: number) => cart.find(c => c.menuItem.id === id)?.qty || 0;

  const removeFromCart = useCallback((itemId: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === itemId);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter(c => c.menuItem.id !== itemId);
      return prev.map(c => c.menuItem.id === itemId ? { ...c, qty: c.qty - 1 } : c);
    });
  }, [setCart]);

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
          <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
            placeholder="جستجوی غذا..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer" onClick={() => setSearch('')}><i className="fa-solid fa-times text-sm" /></button>}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {MENU_CATEGORIES.map(c => (
          <button key={c.id}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] whitespace-nowrap cursor-pointer transition-all ${
              cat === c.id ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
            }`}
            style={cat === c.id ? { background: 'var(--aw-eu-primary)', fontWeight: 600 } : { fontWeight: 500 }}
            onClick={() => setCat(c.id)}>
            <i className={c.icon} />{c.label}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="px-4 grid gap-2.5">
        {filtered.map((item, i) => {
          const qty = getQty(item.id);
          return (
            <motion.div key={item.id} className="flex gap-3 p-2.5" style={euCardStyle}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="w-[76px] h-[76px] rounded-xl overflow-hidden flex-shrink-0 relative">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {item.discount && (
                  <span className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 rounded-md text-white" style={{ background: '#EF4444', fontWeight: 700 }}>
                    {toFa(item.discount)}%
                  </span>
                )}
                {item.popular && !item.discount && (
                  <span className="absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded-md text-white" style={{ background: '#F59E0B', fontWeight: 700 }}>
                    <i className="fa-solid fa-fire text-[6px]" /> محبوب
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{item.name}</div>
                  <div className="text-[10px] text-[var(--aw-text-secondary)] truncate mt-0.5">{item.desc}</div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <span className="text-[13px] text-[var(--aw-eu-primary)]" style={{ fontWeight: 700 }}>{item.price}</span>
                    <span className="text-[8px] text-[var(--aw-text-muted)] mr-0.5">تومان</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-[9px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-star text-[#F59E0B] text-[7px]" /> {item.rating}</span>
                    <span className="text-[9px] text-[var(--aw-text-muted)] mr-1"><i className="fa-regular fa-clock text-[7px]" /> {item.time}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-1">
                  {qty === 0 ? (
                    <button className="text-[10px] px-3 py-1.5 rounded-lg border-none text-white cursor-pointer flex items-center gap-1"
                      style={{ background: 'var(--aw-eu-primary)', fontWeight: 600 }}
                      onClick={() => addToCart(item)}>
                      <i className="fa-solid fa-plus text-[8px]" /> افزودن
                    </button>
                  ) : (
                    <div className="flex items-center gap-0">
                      <button className="w-7 h-7 rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[11px]"
                        style={{ background: 'var(--aw-danger)' }} onClick={() => removeFromCart(item.id)}>
                        <i className={`fa-solid ${qty === 1 ? 'fa-trash' : 'fa-minus'} text-[9px]`} />
                      </button>
                      <span className="w-7 text-center text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{toFa(qty)}</span>
                      <button className="w-7 h-7 rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[11px]"
                        style={{ background: 'var(--aw-eu-primary)' }} onClick={() => addToCart(item)}>
                        <i className="fa-solid fa-plus text-[9px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <EmptyState icon="fa-solid fa-utensils" text="غذایی یافت نشد" />}
      </div>
    </div>
  );
}

function DineOrdersTab({ cart, setCart }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>> }) {
  const { showToast } = useApp();
  const [filter, setFilter] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const filtered = filter === 'all' ? DINE_ORDERS : DINE_ORDERS.filter(o => o.status === filter);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.menuItem.priceNum * c.qty, 0);

  const STATUS_FILTERS = [
    { id: 'all', label: 'همه', icon: 'fa-solid fa-border-all', color: 'var(--aw-eu-primary)' },
    { id: 'preparing', label: 'آماده‌سازی', icon: 'fa-solid fa-fire-burner', color: '#F59E0B' },
    { id: 'delivering', label: 'ارسال', icon: 'fa-solid fa-motorcycle', color: '#3B82F6' },
    { id: 'delivered', label: 'تحویل شده', icon: 'fa-solid fa-circle-check', color: '#10B981' },
    { id: 'cancelled', label: 'لغو شده', icon: 'fa-solid fa-ban', color: '#EF4444' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Cart banner */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div className="mx-4 mt-3 mb-1 flex-shrink-0"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--aw-eu-primary), #14b8a6)' }}
              onClick={() => setShowCart(!showCart)}>
              <div className="flex items-center gap-2 text-white">
                <i className="fa-solid fa-shopping-cart" />
                <span className="text-[12px]" style={{ fontWeight: 600 }}>{toFa(cartCount)} آیتم در سبد خرید</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-[12px]" style={{ fontWeight: 700 }}>{cartTotal.toLocaleString('fa-IR')} ت</span>
                <i className={`fa-solid fa-chevron-${showCart ? 'up' : 'down'} text-[10px]`} />
              </div>
            </div>
            <AnimatePresence>
              {showCart && (
                <motion.div className="mt-1 p-3 rounded-xl" style={euCardStyle}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  {cart.map(c => (
                    <div key={c.menuItem.id} className="flex items-center gap-2.5 py-1.5">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={c.menuItem.image} alt={c.menuItem.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{c.menuItem.name} × {toFa(c.qty)}</div>
                      </div>
                      <span className="text-[11px] text-[var(--aw-eu-primary)]" style={{ fontWeight: 700 }}>{c.menuItem.price}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2 pt-2 border-t border-[rgba(126,95,170,0.1)]">
                    <button className="flex-1 py-2 rounded-lg border-none text-white text-[12px] cursor-pointer flex items-center justify-center gap-1"
                      style={{ background: 'linear-gradient(135deg, var(--aw-eu-primary), #14b8a6)', fontWeight: 700 }}
                      onClick={() => { showToast('سفارش شما با موفقیت ثبت شد!'); setCart([]); setShowCart(false); }}>
                      <i className="fa-solid fa-check-circle text-[10px]" /> ثبت سفارش
                    </button>
                    <button className="py-2 px-3 rounded-lg border border-[var(--aw-danger)] bg-transparent text-[var(--aw-danger)] text-[10px] cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={() => { setCart([]); showToast('سبد خرید خالی شد'); setShowCart(false); }}>
                      <i className="fa-solid fa-trash text-[9px]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status filters */}
      <div className="flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto flex-shrink-0">
        {STATUS_FILTERS.map(f => {
          const count = f.id === 'all' ? DINE_ORDERS.length : DINE_ORDERS.filter(o => o.status === f.id).length;
          return (
            <button key={f.id}
              className={`flex items-center gap-1 py-1.5 px-3 rounded-full border text-[10px] cursor-pointer transition-all whitespace-nowrap ${
                filter === f.id ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
              }`}
              style={filter === f.id ? { background: f.color, fontWeight: 600 } : { fontWeight: 500 }}
              onClick={() => setFilter(f.id)}>
              <i className={`${f.icon} text-[8px]`} />
              {f.label}
              {count > 0 && <span className="text-[8px] opacity-70">({toFa(count)})</span>}
            </button>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-1.5 px-4 pb-2 flex-shrink-0">
        {[
          { label: 'آماده‌سازی', count: DINE_ORDERS.filter(o => o.status === 'preparing').length, color: '#F59E0B', icon: 'fa-solid fa-fire-burner' },
          { label: 'ارسال', count: DINE_ORDERS.filter(o => o.status === 'delivering').length, color: '#3B82F6', icon: 'fa-solid fa-motorcycle' },
          { label: 'تحویل', count: DINE_ORDERS.filter(o => o.status === 'delivered').length, color: '#10B981', icon: 'fa-solid fa-circle-check' },
          { label: 'لغو', count: DINE_ORDERS.filter(o => o.status === 'cancelled').length, color: '#EF4444', icon: 'fa-solid fa-ban' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center gap-1 p-2 rounded-xl" style={euCardStyle}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.color + '18' }}>
              <i className={`${s.icon} text-[11px]`} style={{ color: s.color }} />
            </div>
            <span className="text-[14px] text-[var(--aw-text-primary)]" style={{ fontWeight: 800 }}>{toFa(s.count)}</span>
            <span className="text-[8px] text-[var(--aw-text-muted)]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4">
        {filtered.map((ord, i) => {
          const st = dineOrderStatusMap[ord.status];
          return (
            <motion.div key={ord.id} className="p-3 mb-2" style={euCardStyle}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[var(--aw-eu-primary)]" style={{ fontWeight: 700 }}>#{ord.num}</span>
                    <StatusPill label={st.label} color={st.color} />
                  </div>
                  <div className="text-[13px] text-[var(--aw-text-primary)] mt-1" style={{ fontWeight: 600 }}>{ord.items}</div>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${st.color}15` }}>
                  <i className={`${st.icon} text-[14px]`} style={{ color: st.color }} />
                </div>
              </div>
              {ord.progress != null && (
                <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'rgba(126,95,170,0.1)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: st.color }}
                    initial={{ width: 0 }} animate={{ width: `${ord.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                </div>
              )}
              <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
                <span><i className="fa-solid fa-store text-[8px] ml-1" />{ord.restaurant}</span>
                <span><i className="fa-regular fa-clock text-[8px] ml-1" />{ord.date}</span>
                {ord.eta && <span className="text-[var(--aw-eu-primary)]" style={{ fontWeight: 600 }}><i className="fa-solid fa-truck text-[8px] ml-1" />{ord.eta}</span>}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(126,95,170,0.1)]">
                <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{ord.total} <span className="text-[9px] text-[var(--aw-text-muted)]">تومان</span></span>
                {(ord.status === 'preparing' || ord.status === 'delivering') && (
                  <button className="text-[10px] px-3 py-1.5 rounded-lg border border-[var(--aw-eu-primary)] bg-transparent text-[var(--aw-eu-primary)] cursor-pointer" style={{ fontWeight: 600 }}>
                    <i className="fa-solid fa-eye text-[8px] ml-1" />پیگیری
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <EmptyState icon="fa-solid fa-shopping-bag" text="سفارشی یافت نشد" />}
      </div>
    </div>
  );
}

// Restaurant menu items per restaurant
const RESTAURANT_MENUS: Record<number, MenuItem[]> = {
  1: MENU_ITEMS.filter(m => m.category === 'iranian'),
  2: MENU_ITEMS.filter(m => m.category === 'fastfood'),
  3: MENU_ITEMS.filter(m => m.category === 'iranian'),
  4: MENU_ITEMS.filter(m => m.category === 'fastfood'),
  5: MENU_ITEMS.filter(m => m.category === 'salad'),
};

// Restaurant reviews
const RESTAURANT_REVIEWS: { user: string; rating: number; text: string; date: string }[] = [
  { user: 'محمد ر.', rating: 5, text: 'غذای عالی و ارسال سریع. کباب سلطانی فوق‌العاده بود.', date: '۳ روز پیش' },
  { user: 'سارا ک.', rating: 4, text: 'کیفیت خوبه ولی زمان ارسال کمی طولانی بود.', date: '۱ هفته پیش' },
  { user: 'علی م.', rating: 5, text: 'بهترین رستوران ایرانی. قرمه‌سبزی خانگی واقعی!', date: '۲ هفته پیش' },
  { user: 'نازنین ح.', rating: 4, text: 'پرسنل مودب و بسته‌بندی تمیز.', date: '۳ هفته پیش' },
];

function RestaurantDetailView({ restaurant, onBack, cart, setCart }: { restaurant: Restaurant; onBack: () => void; cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>> }) {
  const { openChat, showToast } = useApp();
  const [detailTab, setDetailTab] = useState<'menu' | 'info' | 'rating' | 'chat'>('menu');
  const menuItems = RESTAURANT_MENUS[restaurant.id] || MENU_ITEMS.slice(0, 3);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { menuItem: item, qty: 1 }];
    });
  }, [setCart]);

  const removeFromCart = useCallback((itemId: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === itemId);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter(c => c.menuItem.id !== itemId);
      return prev.map(c => c.menuItem.id === itemId ? { ...c, qty: c.qty - 1 } : c);
    });
  }, [setCart]);

  const getQty = (id: number) => cart.find(c => c.menuItem.id === id)?.qty || 0;

  const DETAIL_TABS = [
    { id: 'menu', icon: 'fa-solid fa-utensils', label: 'منو' },
    { id: 'info', icon: 'fa-solid fa-circle-info', label: 'اطلاعات' },
    { id: 'rating', icon: 'fa-solid fa-star', label: 'امتیاز' },
    { id: 'chat', icon: 'fa-solid fa-comments', label: 'گفتگو' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Restaurant header banner */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <button className="w-8 h-8 rounded-lg border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-secondary)] cursor-pointer flex items-center justify-center hover:text-[var(--aw-eu-primary)] transition-all"
            onClick={onBack}>
            <i className="fa-solid fa-arrow-right text-[12px]" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: restaurant.color }}>
            <i className={`${restaurant.icon} text-[16px]`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[var(--aw-text-primary)]" style={{ fontWeight: 800 }}>{restaurant.name}</span>
              {restaurant.isOpen ? <StatusPill label="باز" color="#10B981" /> : <StatusPill label="بسته" color="#EF4444" />}
            </div>
            <div className="text-[10px] text-[var(--aw-text-muted)]">{restaurant.type}</div>
          </div>
          <div className="flex items-center gap-0.5 text-[14px] text-[#F59E0B]" style={{ fontWeight: 800 }}>
            <i className="fa-solid fa-star text-[10px]" /> {restaurant.rating}
          </div>
        </div>

        {/* Detail tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--aw-bg-hover)' }}>
          {DETAIL_TABS.map(t => (
            <button key={t.id}
              className="flex-1 py-2 rounded-lg border-none cursor-pointer text-[11px] flex items-center justify-center gap-1 transition-all"
              style={{
                background: detailTab === t.id ? 'var(--aw-eu-primary)' : 'transparent',
                color: detailTab === t.id ? '#fff' : 'var(--aw-text-secondary)',
                fontWeight: detailTab === t.id ? 700 : 500,
              }}
              onClick={() => setDetailTab(t.id as any)}>
              <i className={`${t.icon} text-[10px]`} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {detailTab === 'menu' && (
          <motion.div key="r-menu" className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-1"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {menuItems.map((item, i) => {
              const qty = getQty(item.id);
              return (
                <motion.div key={item.id} className="flex gap-3 p-2.5 mb-1.5" style={euCardStyle}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="w-[76px] h-[76px] rounded-xl overflow-hidden flex-shrink-0 relative">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {item.discount && (
                      <span className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 rounded-md text-white" style={{ background: '#EF4444', fontWeight: 700 }}>
                        {toFa(item.discount)}%
                      </span>
                    )}
                    {item.popular && !item.discount && (
                      <span className="absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded-md text-white" style={{ background: '#F59E0B', fontWeight: 700 }}>
                        <i className="fa-solid fa-fire text-[6px]" /> محبوب
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{item.name}</div>
                      <div className="text-[10px] text-[var(--aw-text-secondary)] truncate mt-0.5">{item.desc}</div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <span className="text-[13px] text-[var(--aw-eu-primary)]" style={{ fontWeight: 700 }}>{item.price}</span>
                        <span className="text-[8px] text-[var(--aw-text-muted)] mr-0.5">تومان</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[9px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-star text-[#F59E0B] text-[7px]" /> {item.rating}</span>
                        <span className="text-[9px] text-[var(--aw-text-muted)] mr-1"><i className="fa-regular fa-clock text-[7px]" /> {item.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-1">
                      {qty === 0 ? (
                        <button className="text-[10px] px-3 py-1.5 rounded-lg border-none text-white cursor-pointer flex items-center gap-1"
                          style={{ background: 'var(--aw-eu-primary)', fontWeight: 600 }}
                          onClick={() => addToCart(item)}>
                          <i className="fa-solid fa-plus text-[8px]" /> افزودن
                        </button>
                      ) : (
                        <div className="flex items-center gap-0">
                          <button className="w-7 h-7 rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[11px]"
                            style={{ background: 'var(--aw-danger)' }} onClick={() => removeFromCart(item.id)}>
                            <i className={`fa-solid ${qty === 1 ? 'fa-trash' : 'fa-minus'} text-[9px]`} />
                          </button>
                          <span className="w-7 text-center text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{toFa(qty)}</span>
                          <button className="w-7 h-7 rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[11px]"
                            style={{ background: 'var(--aw-eu-primary)' }} onClick={() => addToCart(item)}>
                            <i className="fa-solid fa-plus text-[9px]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {menuItems.length === 0 && <EmptyState icon="fa-solid fa-utensils" text="منویی موجود نیست" />}
          </motion.div>
        )}

        {detailTab === 'info' && (
          <motion.div key="r-info" className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-2"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <div className="p-4 rounded-2xl mb-3" style={euCardStyle}>
              <SectionTitle icon="fa-solid fa-circle-info" title="درباره رستوران" />
              <p className="text-[12px] text-[var(--aw-text-secondary)] mt-2" style={{ lineHeight: '2' }}>
                {restaurant.name} یکی از معتبرترین رستوران‌های {restaurant.type} در منطقه است که با تجربه‌ای طولانی در ارائه غذاهای اصیل و باکیفیت، مشتریان زیادی را به خود جلب کرده است.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { icon: 'fa-solid fa-location-arrow', label: 'فاصله', value: restaurant.distance, color: '#3B82F6' },
                { icon: 'fa-solid fa-clock', label: 'زمان ارسال', value: restaurant.deliveryTime, color: '#F59E0B' },
                { icon: 'fa-solid fa-coins', label: 'حداقل سفارش', value: restaurant.minOrder + ' ت', color: '#10B981' },
                { icon: 'fa-solid fa-star', label: 'امتیاز', value: String(restaurant.rating), color: '#8B5CF6' },
              ].map(info => (
                <div key={info.label} className="p-3 rounded-xl flex items-center gap-2.5" style={euCardStyle}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: info.color + '18' }}>
                    <i className={`${info.icon} text-[13px]`} style={{ color: info.color }} />
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--aw-text-muted)]">{info.label}</div>
                    <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl" style={euCardStyle}>
              <SectionTitle icon="fa-solid fa-clock" title="ساعات کاری" />
              <div className="space-y-1.5 mt-2">
                {['شنبه تا چهارشنبه: ۱۱:۰۰ - ۲۳:۰۰', 'پنج‌شنبه: ۱۱:۰۰ - ۲۴:۰۰', 'جمعه: ۱۲:۰۰ - ۲۴:۰۰'].map(h => (
                  <div key={h} className="text-[11px] text-[var(--aw-text-secondary)] flex items-center gap-1.5">
                    <i className="fa-regular fa-clock text-[9px] text-[var(--aw-text-muted)]" /> {h}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {detailTab === 'rating' && (
          <motion.div key="r-rating" className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-2"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {/* Rating summary */}
            <div className="p-4 rounded-2xl mb-3 flex items-center gap-4" style={euCardStyle}>
              <div className="text-center">
                <div className="text-[32px] text-[#F59E0B]" style={{ fontWeight: 900 }}>{restaurant.rating}</div>
                <div className="flex items-center gap-0.5 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <i key={s} className={`fa-solid fa-star text-[11px] ${s <= Math.round(restaurant.rating) ? 'text-[#F59E0B]' : 'text-[var(--aw-text-muted)] opacity-30'}`} />
                  ))}
                </div>
                <div className="text-[10px] text-[var(--aw-text-muted)] mt-1">از ۱۲۸ نظر</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map(star => {
                  const pct = star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 2 : 1;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--aw-text-muted)] w-3">{toFa(star)}</span>
                      <i className="fa-solid fa-star text-[8px] text-[#F59E0B]" />
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--aw-bg-hover)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#F59E0B' }} />
                      </div>
                      <span className="text-[9px] text-[var(--aw-text-muted)] w-6 text-left">{toFa(pct)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            <SectionTitle icon="fa-solid fa-comment-dots" title="نظرات کاربران" />
            {RESTAURANT_REVIEWS.map((rv, i) => (
              <motion.div key={i} className="p-3 mb-2" style={euCardStyle}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px]" style={{ background: restaurant.color, fontWeight: 700 }}>
                      {rv.user.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{rv.user}</div>
                      <div className="text-[9px] text-[var(--aw-text-muted)]">{rv.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <i key={s} className={`fa-solid fa-star text-[9px] ${s <= rv.rating ? 'text-[#F59E0B]' : 'text-[var(--aw-text-muted)] opacity-30'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[var(--aw-text-secondary)] m-0" style={{ lineHeight: '1.8' }}>{rv.text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {detailTab === 'chat' && (
          <motion.div key="r-chat" className="flex-1 flex flex-col min-h-0"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MiniChatPreview
              messages={[
                { from: 'agent', text: `سلام! به ${restaurant.name} خوش آمدید. چطور می‌تونم کمکتون کنم؟` },
                { from: 'user', text: 'سلام، می‌خوام سفارش بدم.' },
                { from: 'agent', text: 'البته! منوی ما آماده است. می‌تونید از تب منو غذای مورد نظرتون رو انتخاب کنید یا به من بگید چه نوع غذایی میل دارید.' },
              ]}
              agentName={restaurant.name}
              agentIcon={restaurant.icon}
              agentColor={restaurant.color}
              onOpenFull={() => openChat('restaurant', 'eu')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DineRestaurantsTab({ onSelectRestaurant }: { onSelectRestaurant: (r: Restaurant) => void }) {
  const [filter, setFilter] = useState<'all' | 'nearest' | 'popular' | 'discount'>('all');
  const [search, setSearch] = useState('');

  let filtered = RESTAURANTS.filter(r => !search || r.name.includes(search) || r.type.includes(search));
  if (filter === 'nearest') filtered = [...filtered].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  if (filter === 'popular') filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (filter === 'discount') filtered = filtered.filter(r => r.isOpen);

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
          <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
            placeholder="جستجوی رستوران..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer" onClick={() => setSearch('')}><i className="fa-solid fa-times text-sm" /></button>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'همه', icon: 'fa-solid fa-border-all' },
          { id: 'nearest', label: 'نزدیک‌ترین', icon: 'fa-solid fa-location-arrow' },
          { id: 'popular', label: 'محبوب‌ترین', icon: 'fa-solid fa-fire' },
          { id: 'discount', label: 'فعال', icon: 'fa-solid fa-check-circle' },
        ].map(f => (
          <button key={f.id}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-[11px] whitespace-nowrap cursor-pointer transition-all ${
              filter === f.id ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
            }`}
            style={filter === f.id ? { background: 'var(--aw-eu-primary)', fontWeight: 600 } : { fontWeight: 500 }}
            onClick={() => setFilter(f.id as any)}>
            <i className={`${f.icon} text-[9px]`} /> {f.label}
          </button>
        ))}
      </div>

      {/* Restaurant list */}
      <div className="px-4">
        {filtered.map((r, i) => (
          <motion.div key={r.id} className="p-3 mb-2 cursor-pointer active:scale-[0.98] transition-transform" style={{ ...euCardStyle, opacity: r.isOpen ? 1 : 0.55 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: r.isOpen ? 1 : 0.55, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => onSelectRestaurant(r)}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[18px]" style={{ background: r.color }}>
                <i className={r.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{r.name}</span>
                  {r.isOpen ? <StatusPill label="باز" color="#10B981" /> : <StatusPill label="بسته" color="#EF4444" />}
                </div>
                <div className="text-[10px] text-[var(--aw-text-secondary)] mt-0.5">{r.type}</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-0.5 text-[13px] text-[#F59E0B]" style={{ fontWeight: 700 }}>
                  <i className="fa-solid fa-star text-[9px]" /> {r.rating}
                </div>
                <i className="fa-solid fa-chevron-left text-[10px] text-[var(--aw-text-muted)]" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[var(--aw-text-muted)] mt-2 pr-14">
              <span><i className="fa-solid fa-location-arrow text-[8px] ml-1" />{r.distance}</span>
              <span><i className="fa-solid fa-clock text-[8px] ml-1" />{r.deliveryTime}</span>
              <span><i className="fa-solid fa-coins text-[8px] ml-1" />حداقل: {r.minOrder}</span>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <EmptyState icon="fa-solid fa-store" text="رستورانی یافت نشد" />}
      </div>
    </div>
  );
}

interface ChatListItem { id: string; name: string; icon: string; color: string; lastMsg: string; time: string; unread: number; online: boolean }
interface AgentCardItem { id: string; name: string; desc: string; icon: string; color: string; gradient: string }
interface AgentTopicItem { id: string; title: string; date: string; msgs: number; active?: boolean }
interface ChatMsgItem { from: 'user' | 'agent'; text: string }

function AgentChatTabUI({
  chatList,
  interactionMessages,
  agentCards,
  agentTopics,
  topicMessages,
  suggestionsByAgent = {},
  defaultSuggestions = ['پیشنهاد بده', 'مقایسه قیمت', 'پرفروش‌ترین'],
  uniqueKey = 'chat',
}: {
  chatList: ChatListItem[];
  interactionMessages: Record<string, ChatMsgItem[]>;
  agentCards: AgentCardItem[];
  agentTopics: Record<string, AgentTopicItem[]>;
  topicMessages: Record<string, ChatMsgItem[]>;
  suggestionsByAgent?: Record<string, string[]>;
  defaultSuggestions?: string[];
  uniqueKey?: string;
}) {
  const { showToast } = useApp();
  const [chatSub, setChatSub] = useState<'interactions' | 'agent'>('interactions');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [showTopics, setShowTopics] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [liveMsgs, setLiveMsgs] = useState<ChatMsgItem[]>([]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const txt = chatInput.trim();
    setLiveMsgs(prev => [...prev, { from: 'user', text: txt }]);
    setChatInput('');
    setTimeout(() => {
      setLiveMsgs(prev => [...prev, { from: 'agent', text: `متوجه شدم. در مورد «${txt}» بررسی می‌کنم و نتیجه رو اعلام می‌کنم.` }]);
    }, 800);
  };

  if (activeChat) {
    const chatInfo = chatList.find(c => c.id === activeChat);
    const agentInfo = agentCards.find(a => a.id === activeChat);
    const isAgent = !!agentInfo;
    const info = chatInfo
      ? { name: chatInfo.name, icon: chatInfo.icon, color: chatInfo.color, online: chatInfo.online, gradient: undefined as string | undefined }
      : agentInfo
        ? { name: agentInfo.name, icon: agentInfo.icon, color: agentInfo.color, online: true, gradient: agentInfo.gradient }
        : null;

    let msgs: ChatMsgItem[] = [];
    if (isAgent) { if (activeTopic) msgs = topicMessages[activeTopic] || []; }
    else { msgs = interactionMessages[activeChat] || []; }
    const allMsgs = [...msgs, ...liveMsgs];
    const topics = isAgent ? (agentTopics[activeChat] || []) : [];
    const suggestions = isAgent ? (suggestionsByAgent[activeChat] || defaultSuggestions) : defaultSuggestions;

    return (
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="flex items-center gap-2.5 px-4 pt-3 pb-2 flex-shrink-0 border-b border-[var(--aw-border)]">
          <button className="w-8 h-8 rounded-lg border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-secondary)] cursor-pointer flex items-center justify-center"
            onClick={() => { setActiveChat(null); setActiveTopic(null); setLiveMsgs([]); setShowTopics(false); }}>
            <i className="fa-solid fa-arrow-right text-[11px]" />
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 relative" style={{ background: info?.gradient || info?.color }}>
            <i className={`${info?.icon} text-[13px]`} />
            {info?.online && <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-[var(--aw-bg-header)]" style={{ background: '#10B981' }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{info?.name}</div>
            <div className="text-[10px] text-[#10B981]">
              {isAgent ? (activeTopic ? (topics.find(t => t.id === activeTopic)?.title || 'گفتگوی جدید') : 'گفتگوی جدید') : (info?.online ? 'آنلاین' : 'آفلاین')}
            </div>
          </div>
          {isAgent && (
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 rounded-lg border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)] relative"
                onClick={() => setShowTopics(!showTopics)}>
                <i className="fa-solid fa-folder-open text-[12px]" />
                {topics.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px]" style={{ background: info?.color, fontWeight: 700 }}>{toFa(topics.length)}</span>}
              </button>
              <button className="w-8 h-8 rounded-lg border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)]"
                onClick={() => { setActiveTopic(null); setLiveMsgs([]); setShowTopics(false); showToast('گفتگوی جدید'); }}>
                <i className="fa-solid fa-plus text-[12px]" />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showTopics && isAgent && (
            <motion.div className="absolute top-[56px] left-4 right-4 z-30 rounded-xl overflow-hidden"
              style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--aw-border)]">
                <span className="text-[13px] text-[var(--aw-text-primary)] flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                  <i className="fa-solid fa-folder-open text-[12px]" style={{ color: info?.color }} /> پرونده‌ها
                </span>
                <button className="text-[11px] px-2.5 py-1 rounded-lg border-none cursor-pointer text-white flex items-center gap-1" style={{ background: info?.color, fontWeight: 600 }}
                  onClick={() => { setActiveTopic(null); setLiveMsgs([]); setShowTopics(false); showToast('گفتگوی جدید ایجاد شد'); }}>
                  <i className="fa-solid fa-plus text-[9px]" /> جدید
                </button>
              </div>
              {topics.map(topic => (
                <button key={topic.id} className="w-full flex items-center gap-3 px-3 py-2.5 border-none bg-transparent cursor-pointer text-right"
                  style={activeTopic === topic.id ? { background: `${info?.color}15` } : {}}
                  onClick={() => { setActiveTopic(topic.id); setLiveMsgs([]); setShowTopics(false); }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: activeTopic === topic.id ? `${info?.color}22` : 'var(--aw-bg-app)' }}>
                    <i className={`fa-solid ${activeTopic === topic.id ? 'fa-comment-dots' : 'fa-file-lines'} text-[12px]`} style={{ color: activeTopic === topic.id ? info?.color : 'var(--aw-text-muted)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: activeTopic === topic.id ? 700 : 500 }}>{topic.title}</div>
                    <div className="text-[10px] text-[var(--aw-text-muted)]">{topic.date} · {toFa(topic.msgs)} پیام</div>
                  </div>
                  {activeTopic === topic.id && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: info?.color }} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto aw-scroll px-4 pt-3 pb-2">
          {allMsgs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${info?.color}18` }}>
                <i className={`${info?.icon} text-[24px]`} style={{ color: info?.color }} />
              </div>
              <div className="text-[14px] text-[var(--aw-text-primary)] mb-1" style={{ fontWeight: 700 }}>گفتگوی جدید</div>
              <div className="text-[12px] text-[var(--aw-text-muted)] text-center" style={{ lineHeight: '2' }}>پیام خود را بنویسید تا {info?.name} به شما کمک کند.</div>
              {isAgent && (
                <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                  {suggestions.map(s => (
                    <button key={s} className="text-[10px] px-3 py-1.5 rounded-full border bg-transparent cursor-pointer" style={{ borderColor: `${info?.color}40`, color: info?.color, fontWeight: 600 }} onClick={() => setChatInput(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            allMsgs.map((msg, i) => (
              <motion.div key={i} className={`flex mb-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                {msg.from === 'agent' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 ml-1.5 mt-1" style={{ background: info?.gradient || info?.color, fontSize: 10 }}>
                    <i className={`${info?.icon}`} />
                  </div>
                )}
                <div className="max-w-[80%] px-3 py-2 rounded-2xl text-[12px]" style={{ background: msg.from === 'user' ? 'var(--aw-eu-primary)' : 'var(--aw-bg-hover)', color: msg.from === 'user' ? '#fff' : 'var(--aw-text-primary)', borderBottomLeftRadius: msg.from === 'user' ? 16 : 4, borderBottomRightRadius: msg.from === 'user' ? 4 : 16, lineHeight: '1.9', whiteSpace: 'pre-line' }}>{msg.text}</div>
              </motion.div>
            ))
          )}
        </div>

        <div className="flex-shrink-0 px-4 pb-3 pt-1">
          <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
            <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]" placeholder="پیام خود را بنویسید..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSend(); }} />
            <button className="w-8 h-8 rounded-lg border-none text-white cursor-pointer flex items-center justify-center" style={{ background: chatInput.trim() ? (info?.color || 'var(--aw-eu-primary)') : 'var(--aw-text-muted)', opacity: chatInput.trim() ? 1 : 0.4 }} onClick={handleSend}>
              <i className="fa-solid fa-paper-plane text-[11px]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex gap-0 mx-4 mt-3 mb-1 flex-shrink-0 rounded-xl overflow-hidden border border-[var(--aw-border)]">
        <button className={`flex-1 py-2.5 border-none cursor-pointer text-[12px] flex items-center justify-center gap-1.5 ${chatSub === 'interactions' ? 'text-white' : 'bg-transparent text-[var(--aw-text-secondary)]'}`}
          style={chatSub === 'interactions' ? { background: 'var(--aw-eu-primary)', fontWeight: 700 } : { fontWeight: 500 }} onClick={() => setChatSub('interactions')}>
          <i className="fa-solid fa-comments text-[11px]" /> تعاملات
          {chatList.reduce((s, c) => s + c.unread, 0) > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: chatSub === 'interactions' ? 'rgba(255,255,255,0.25)' : 'var(--aw-danger)', color: '#fff', fontWeight: 700 }}>{toFa(chatList.reduce((s, c) => s + c.unread, 0))}</span>
          )}
        </button>
        <button className={`flex-1 py-2.5 border-none cursor-pointer text-[12px] flex items-center justify-center gap-1.5 ${chatSub === 'agent' ? 'text-white' : 'bg-transparent text-[var(--aw-text-secondary)]'}`}
          style={chatSub === 'agent' ? { background: 'var(--aw-eu-primary)', fontWeight: 700 } : { fontWeight: 500 }} onClick={() => setChatSub('agent')}>
          <i className="fa-solid fa-robot text-[11px]" /> عامل هوشمند
        </button>
      </div>

      <AnimatePresence mode="wait">
        {chatSub === 'interactions' && (
          <motion.div key={`${uniqueKey}-interactions`} className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-2"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}>
            {chatList.map((chat, i) => (
              <motion.div key={chat.id} className="p-3 mb-1.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform" style={euCardStyle}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => { setActiveChat(chat.id); setLiveMsgs([]); }}>
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: chat.color }}>
                    <i className={`${chat.icon} text-[15px]`} />
                  </div>
                  {chat.online && <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--aw-eu-card)]" style={{ background: '#10B981' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: 700 }}>{chat.name}</span>
                    <span className="text-[9px] text-[var(--aw-text-muted)] whitespace-nowrap flex-shrink-0">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-[11px] text-[var(--aw-text-muted)] truncate" style={{ lineHeight: '1.5' }}>{chat.lastMsg}</span>
                    {chat.unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: 'var(--aw-eu-primary)', fontWeight: 700 }}>{toFa(chat.unread)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {chatSub === 'agent' && (
          <motion.div key={`${uniqueKey}-agent`} className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-2"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {agentCards.map((agent, i) => (
                <motion.div key={agent.id} className="p-3 rounded-2xl cursor-pointer relative overflow-hidden active:scale-[0.97] transition-transform"
                  style={{ ...euCardStyle, minHeight: 120 }} initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                  onClick={() => { setActiveChat(agent.id); setActiveTopic(null); setLiveMsgs([]); }}>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.12]" style={{ background: agent.color, filter: 'blur(18px)' }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2 relative" style={{ background: agent.gradient }}>
                    <i className={`${agent.icon} text-[15px]`} />
                  </div>
                  <div className="text-[12px] text-[var(--aw-text-primary)] mb-0.5 relative" style={{ fontWeight: 700 }}>{agent.name}</div>
                  <div className="text-[9px] text-[var(--aw-text-muted)] relative" style={{ lineHeight: '1.5' }}>{agent.desc}</div>
                  <div className="flex items-center gap-1 mt-1.5 relative">
                    <span className="text-[8px] px-2 py-0.5 rounded-full text-white" style={{ background: agent.color, fontWeight: 600 }}>
                      <i className="fa-solid fa-plus text-[6px] ml-0.5" />چت جدید
                    </span>
                    {(agentTopics[agent.id]?.length || 0) > 0 && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${agent.color}18`, color: agent.color, fontWeight: 600 }}>{toFa(agentTopics[agent.id]?.length || 0)} پرونده</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <SectionTitle icon="fa-solid fa-clock-rotate-left" title="چت‌های اخیر" />
            {agentCards.flatMap(agent => (agentTopics[agent.id] || []).map(topic => ({ ...topic, agent })))
              .sort((a, b) => (a.active ? -1 : 1) - (b.active ? -1 : 1))
              .map((item, i) => (
                <motion.div key={item.id} className="p-3 mb-1.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform" style={euCardStyle}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => { setActiveChat(item.agent.id); setActiveTopic(item.id); setLiveMsgs([]); }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: item.agent.gradient }}>
                      <i className={`${item.agent.icon} text-[15px]`} />
                    </div>
                    {item.active && <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--aw-eu-card)]" style={{ background: '#10B981' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: 700 }}>{item.title}</span>
                      <span className="text-[9px] text-[var(--aw-text-muted)] whitespace-nowrap flex-shrink-0">{item.date}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-[11px] text-[var(--aw-text-muted)] truncate" style={{ lineHeight: '1.5' }}>{item.agent.name} · {toFa(item.msgs)} پیام</span>
                      {item.active && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: item.agent.color, fontWeight: 700 }}>
                          <i className="fa-solid fa-comment-dots text-[8px]" />
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DineChatTab() {
  const CHAT_LIST: ChatListItem[] = [
    { id: 'shandiz', name: 'رستوران شاندیز', icon: 'fa-solid fa-utensils', color: '#F59E0B', lastMsg: 'سفارش شما در حال آماده‌سازی است.', time: '۱۰ دقیقه پیش', unread: 1, online: true },
    { id: 'nika', name: 'فست‌فود نیکا', icon: 'fa-solid fa-burger', color: '#EF4444', lastMsg: 'سفارش شما تحویل داده شد. نظرتون رو ثبت کنید.', time: '۱ ساعت پیش', unread: 0, online: true },
    { id: 'support', name: 'پشتیبانی سفارش غذا', icon: 'fa-solid fa-headset', color: '#3B82F6', lastMsg: 'سفارش ۱۰۲۶ حدود ۲۰ دقیقه دیگه می‌رسه.', time: '۳۰ دقیقه پیش', unread: 2, online: true },
    { id: 'darbar', name: 'رستوران سنتی دربار', icon: 'fa-solid fa-crown', color: '#8B5CF6', lastMsg: 'ممنون از سفارش شما! منتظرتون هستیم.', time: 'دیروز', unread: 0, online: false },
  ];

  const INTERACTION_MESSAGES: Record<string, { from: 'user' | 'agent'; text: string }[]> = {
    shandiz: [
      { from: 'agent', text: 'سلام! سفارش شماره ۱۰۲۶ ثبت شد.' },
      { from: 'user', text: 'ممنون، چقدر طول می‌کشه؟' },
      { from: 'agent', text: 'سفارش شما در حال آماده‌سازی است. حدوداً ۲۰ دقیقه دیگه ارسال می‌شه.' },
    ],
    nika: [
      { from: 'agent', text: 'سفارش شما آماده ارسال است.' },
      { from: 'user', text: 'عالی، ممنون!' },
      { from: 'agent', text: 'سفارش شما تحویل داده شد. نظرتون رو ثبت کنید.' },
    ],
    support: [
      { from: 'agent', text: 'سلام! پشتیبانی سفارش غذا در خدمت شماست.' },
      { from: 'user', text: 'سفارشم دیر شده، می‌خوام پیگیری کنم.' },
      { from: 'agent', text: 'لطفاً شماره سفارشتون رو بفرمایید.' },
      { from: 'user', text: 'شماره ۱۰۲۶ هست.' },
      { from: 'agent', text: 'سفارش ۱۰۲۶ در حال آماده‌سازی در رستوران شاندیز هست و حدود ۲۰ دقیقه دیگه به دستتون می‌رسه.' },
    ],
    darbar: [
      { from: 'agent', text: 'سلام! به رستوران سنتی دربار خوش آمدید.' },
      { from: 'user', text: 'سلام، قرمه‌سبزی دارین؟' },
      { from: 'agent', text: 'بله! قرمه‌سبزی خانگی با برنج ایرانی. ممنون از سفارش شما! منتظرتون هستیم.' },
    ],
  };

  const AGENT_CARDS: AgentCardItem[] = [
    { id: 'food-ai', name: 'دستیار هوشمند غذا', desc: 'پیشنهاد غذا بر اساس سلیقه شما', icon: 'fa-solid fa-wand-magic-sparkles', color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)' },
    { id: 'diet-ai', name: 'مشاور تغذیه', desc: 'برنامه غذایی و کالری‌شماری', icon: 'fa-solid fa-heartbeat', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
    { id: 'order-ai', name: 'ردیاب سفارش', desc: 'پیگیری هوشمند وضعیت سفارش', icon: 'fa-solid fa-truck-fast', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
    { id: 'review-ai', name: 'راهنمای رستوران', desc: 'بهترین رستوران‌ها و نظرات', icon: 'fa-solid fa-star', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  ];

  const AGENT_TOPICS: Record<string, AgentTopicItem[]> = {
    'food-ai': [
      { id: 'food-t1', title: 'پیشنهاد ناهار امروز', date: '۱ ساعت پیش', msgs: 4, active: true },
      { id: 'food-t2', title: 'انتخاب غذا برای مهمانی', date: 'دیروز', msgs: 8 },
      { id: 'food-t3', title: 'بهترین غذای ایرانی', date: '۳ روز پیش', msgs: 5 },
    ],
    'diet-ai': [
      { id: 'diet-t1', title: 'برنامه رژیم هفتگی', date: '۲ ساعت پیش', msgs: 6, active: true },
      { id: 'diet-t2', title: 'غذای کم‌کالری', date: 'دیروز', msgs: 3 },
    ],
    'order-ai': [
      { id: 'order-t1', title: 'پیگیری سفارش ۱۰۲۶', date: '۱۰ دقیقه پیش', msgs: 2, active: true },
      { id: 'order-t2', title: 'پیگیری سفارش ۱۰۲۵', date: '۱ ساعت پیش', msgs: 3 },
    ],
    'review-ai': [
      { id: 'review-t1', title: 'بهترین رستوران ایرانی', date: '۳۰ دقیقه پیش', msgs: 4, active: true },
      { id: 'review-t2', title: 'مقایسه فست‌فودها', date: '۲ روز پیش', msgs: 6 },
    ],
  };

  const TOPIC_MESSAGES: Record<string, { from: 'user' | 'agent'; text: string }[]> = {
    'food-t1': [
      { from: 'user', text: 'چی پیشنهاد میدی برای ناهار؟' },
      { from: 'agent', text: 'با توجه به سفارشات قبلی‌تون:\n\n🥇 قرمه‌سبزی رستوران شاندیز\n🥈 زرشک‌پلو با مرغ رستوران دربار\n🥉 جوجه کباب ویژه شاندیز\n\nکدوم رو سفارش بدم؟' },
    ],
    'food-t2': [
      { from: 'user', text: 'برای ۶ نفر مهمان غذا لازم دارم.' },
      { from: 'agent', text: 'پیشنهاد من: ۳ پرس چلوکباب سلطانی + ۲ پرس زرشک‌پلو + ۱ سالاد فصل.\nجمع: ۱,۳۰۰,۰۰۰ تومان از شاندیز.' },
    ],
    'food-t3': [
      { from: 'user', text: 'بهترین غذای ایرانی چیه؟' },
      { from: 'agent', text: 'قرمه‌سبزی رستوران شاندیز با امتیاز ۴.۹ بالاترین امتیاز رو داره!' },
    ],
    'diet-t1': [
      { from: 'user', text: 'برنامه غذایی رژیمی این هفته رو بده.' },
      { from: 'agent', text: 'برنامه پیشنهادی:\nشنبه: سالاد سزار (۳۲۰ کالری)\nیکشنبه: فلافل رپ (۴۱۰ کالری)\nدوشنبه: سالاد بار سبز (۲۸۰ کالری)' },
    ],
    'diet-t2': [
      { from: 'user', text: 'غذای کم‌کالری می‌خوام.' },
      { from: 'agent', text: 'سالاد سزار از سالاد بار سبز — ۳۲۰ کالری، ۹۵,۰۰۰ تومان.' },
    ],
    'order-t1': [
      { from: 'agent', text: '📦 سفارش ۱۰۲۶ — در حال آماده‌سازی (۲۰ دقیقه مانده)' },
    ],
    'order-t2': [
      { from: 'agent', text: '🏍️ سفارش ۱۰۲۵ — تحویل داده شد.' },
      { from: 'user', text: 'ممنون!' },
    ],
    'review-t1': [
      { from: 'user', text: 'بهترین رستوران ایرانی کجاست؟' },
      { from: 'agent', text: '🏆 ۱. رستوران سنتی دربار — ⭐ ۴.۹\n۲. رستوران شاندیز — ⭐ ۴.۸' },
    ],
    'review-t2': [
      { from: 'user', text: 'فست‌فود نیکا یا پیتزا هات؟' },
      { from: 'agent', text: 'نیکا: ⭐ ۴.۵ — نزدیک‌تر و سریع‌تر\nپیتزا هات: ⭐ ۴.۲ — تنوع بیشتر ولی فعلاً بسته‌ست.' },
    ],
  };

  const SUGGESTIONS = {
    'food-ai': ['چی پیشنهاد میدی؟', 'غذای محبوب چیه؟', 'تخفیف دارین؟'],
    'diet-ai': ['رژیم کم‌کالری', 'غذای سالم', 'برنامه هفتگی'],
    'order-ai': ['وضعیت سفارشم', 'کی می‌رسه؟', 'لغو سفارش'],
    'review-ai': ['بهترین رستوران', 'مقایسه قیمت‌ها', 'نظرات کاربران'],
  };
  return <AgentChatTabUI chatList={CHAT_LIST} interactionMessages={INTERACTION_MESSAGES} agentCards={AGENT_CARDS} agentTopics={AGENT_TOPICS} topicMessages={TOPIC_MESSAGES} suggestionsByAgent={SUGGESTIONS} uniqueKey="dine" />;
}

function DineOffersTab() {
  const { showToast } = useApp();
  const [offerFilter, setOfferFilter] = useState<'all' | 'personal' | 'discount' | 'popular'>('all');

  const POPULAR_ITEMS = MENU_ITEMS.filter(m => m.popular).map(m => ({
    ...m,
    orderCount: m.id === 1 ? '۱,۲۰۰' : m.id === 3 ? '۸۵۰' : '۶۲۰',
  }));

  const PERSONAL_OFFERS: Offer[] = OFFERS.filter(o => o.icon.includes('wand') || o.icon.includes('gift'));
  const DISCOUNT_OFFERS: Offer[] = OFFERS.filter(o => !o.icon.includes('wand'));

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      {/* Filter tabs */}
      <div className="flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'همه', icon: 'fa-solid fa-border-all' },
          { id: 'personal', label: 'شخصی‌سازی شده', icon: 'fa-solid fa-wand-magic-sparkles' },
          { id: 'discount', label: 'تخفیف‌ها', icon: 'fa-solid fa-percent' },
          { id: 'popular', label: 'پرطرفدار', icon: 'fa-solid fa-fire' },
        ].map(f => (
          <button key={f.id}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-[11px] whitespace-nowrap cursor-pointer transition-all ${
              offerFilter === f.id ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
            }`}
            style={offerFilter === f.id ? { background: 'var(--aw-eu-primary)', fontWeight: 600 } : { fontWeight: 500 }}
            onClick={() => setOfferFilter(f.id as any)}>
            <i className={`${f.icon} text-[9px]`} /> {f.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {/* Personalized section */}
        {(offerFilter === 'all' || offerFilter === 'personal') && (
          <div className="mb-3">
            <SectionTitle icon="fa-solid fa-wand-magic-sparkles" title="پیشنهاد ویژه برای شما" extra={<StatusPill label="AI" color="#EC4899" />} />
            {PERSONAL_OFFERS.map((o, i) => (
              <motion.div key={o.id} className="p-3 mb-2 overflow-hidden relative" style={euCardStyle}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07]" style={{ background: o.color, filter: 'blur(24px)' }} />
                <div className="flex items-start gap-3 mb-2 relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[16px]" style={{ background: o.color }}>
                    <i className={o.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{o.title}</div>
                    <div className="text-[11px] text-[var(--aw-text-secondary)] mt-0.5">{o.desc}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[15px]" style={{ background: `${o.color}cc`, fontWeight: 800 }}>
                    {toFa(o.discount)}%
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
                  <span><i className="fa-solid fa-store text-[8px] ml-1" />{o.restaurant}</span>
                  <span><i className="fa-solid fa-calendar text-[8px] ml-1" />{o.validUntil}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(126,95,170,0.1)]">
                  <span className="text-[11px] text-[var(--aw-text-muted)] flex items-center gap-1">
                    <i className="fa-solid fa-tag text-[8px]" />کد: <span className="text-[var(--aw-eu-primary)]" style={{ fontWeight: 700 }}>{o.code}</span>
                  </span>
                  <button className="text-[10px] px-3 py-1.5 rounded-lg border-none text-white cursor-pointer flex items-center gap-1" style={{ background: o.color, fontWeight: 600 }}
                    onClick={() => showToast(`کد تخفیف ${o.code} کپی شد`)}>
                    <i className="fa-solid fa-copy text-[8px]" /> کپی کد
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Discounts section */}
        {(offerFilter === 'all' || offerFilter === 'discount') && (
          <div className="mb-3">
            <SectionTitle icon="fa-solid fa-percent" title="تخفیف‌ها و کدهای تخفیف" />
            {DISCOUNT_OFFERS.map((o, i) => (
              <motion.div key={o.id} className="p-3 mb-2 overflow-hidden relative" style={euCardStyle}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07]" style={{ background: o.color, filter: 'blur(24px)' }} />
                <div className="flex items-start gap-3 mb-2 relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[16px]" style={{ background: o.color }}>
                    <i className={o.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{o.title}</div>
                    <div className="text-[11px] text-[var(--aw-text-secondary)] mt-0.5">{o.desc}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[15px]" style={{ background: `${o.color}cc`, fontWeight: 800 }}>
                    {toFa(o.discount)}%
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
                    <span><i className="fa-solid fa-store text-[8px] ml-1" />{o.restaurant}</span>
                    <span><i className="fa-solid fa-calendar text-[8px] ml-1" />{o.validUntil}</span>
                  </div>
                  <button className="text-[10px] px-3 py-1.5 rounded-lg border-none text-white cursor-pointer flex items-center gap-1" style={{ background: o.color, fontWeight: 600 }}
                    onClick={() => showToast(`کد تخفیف ${o.code} کپی شد`)}>
                    <i className="fa-solid fa-copy text-[8px]" /> {o.code}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Popular foods section */}
        {(offerFilter === 'all' || offerFilter === 'popular') && (
          <div className="mb-3">
            <SectionTitle icon="fa-solid fa-fire" title="غذاهای پرطرفدار" />
            {POPULAR_ITEMS.map((item, i) => (
              <motion.div key={item.id} className="flex gap-3 p-2.5 mb-1.5" style={euCardStyle}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-1 right-1 text-[7px] px-1 py-0.5 rounded-md text-white" style={{ background: '#F59E0B', fontWeight: 700 }}>
                    <i className="fa-solid fa-fire text-[6px]" /> محبوب
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{item.name}</div>
                    <div className="text-[10px] text-[var(--aw-text-secondary)] truncate mt-0.5">{item.desc}</div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[12px] text-[var(--aw-eu-primary)]" style={{ fontWeight: 700 }}>{item.price} <span className="text-[8px] text-[var(--aw-text-muted)]">تومان</span></span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-star text-[#F59E0B] text-[7px]" /> {item.rating}</span>
                      <span className="text-[9px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-bag-shopping text-[7px]" /> {item.orderCount} سفارش</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DineAccountTab() {
  const { showToast, euProfile } = useApp();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedSection(prev => prev === id ? null : id);

  const ADDRESSES = [
    { id: 1, title: 'خانه', address: 'تهران، خیابان ولیعصر، پلاک ۱۲، واحد ۳', icon: 'fa-solid fa-house', isDefault: true },
    { id: 2, title: 'محل کار', address: 'تهران، سعادت‌آباد، بلوار دریا، ساختمان آلفا', icon: 'fa-solid fa-building', isDefault: false },
  ];

  const PAYMENTS = [
    { id: 1, title: 'کیف پول Neura', balance: '۲,۴۵۰,۰۰۰ تومان', icon: 'fa-solid fa-wallet', color: '#8B5CF6', isDefault: true },
    { id: 2, title: 'کارت بانکی ملت', last4: '****۴۵۶۷', icon: 'fa-solid fa-credit-card', color: '#EF4444', isDefault: false },
    { id: 3, title: 'کارت بانکی ملی', last4: '****۸۹۰۱', icon: 'fa-solid fa-credit-card', color: '#3B82F6', isDefault: false },
  ];

  const HISTORY = [
    { id: 1, items: 'چلوکباب سلطانی × ۲', restaurant: 'شاندیز', date: '۴ اسفند ۱۴۰۴', total: '۵۷۰,۰۰۰', status: 'delivered' as const },
    { id: 2, items: 'پیتزا مخلوط + نوشابه', restaurant: 'فست‌فود نیکا', date: '۳ اسفند ۱۴۰۴', total: '۲۱۵,۰۰۰', status: 'delivered' as const },
    { id: 3, items: 'همبرگر مخصوص × ۳', restaurant: 'فست‌فود نیکا', date: '۲ اسفند ۱۴۰۴', total: '۴۳۵,۰۰۰', status: 'delivered' as const },
    { id: 4, items: 'سالاد سزار + آب‌میوه', restaurant: 'سالاد بار سبز', date: '۱ اسفند ۱۴۰۴', total: '۱۳۵,۰۰۰', status: 'cancelled' as const },
    { id: 5, items: 'قرمه‌سبزی', restaurant: 'رستوران دربار', date: '۲۸ بهمن ۱۴۰۴', total: '۱۷۰,۰۰۰', status: 'delivered' as const },
  ];

  const SECTIONS = [
    { id: 'addresses', icon: 'fa-solid fa-map-marker-alt', label: 'آدرس‌های من', color: '#3B82F6', count: ADDRESSES.length },
    { id: 'payments', icon: 'fa-solid fa-credit-card', label: 'روش‌های پرداخت', color: '#10B981', count: PAYMENTS.length },
    { id: 'history', icon: 'fa-solid fa-clock-rotate-left', label: 'تاریخچه خرید', color: '#F59E0B', count: HISTORY.length },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      {/* Profile card */}
      <div className="p-4 rounded-2xl mb-3" style={{ ...euCardStyle, background: 'linear-gradient(135deg, var(--aw-eu-primary), #14b8a6)' }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-[20px] border-2 border-white/30"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800 }}>
            {euProfile.avatar || 'P'}
          </div>
          <div className="flex-1">
            <div className="text-[14px] text-white" style={{ fontWeight: 800 }}>{euProfile.name}</div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{euProfile.phone || '۰۹۱۲۳۴۵۶۷۸۹'}</div>
          </div>
          <button className="w-9 h-9 rounded-xl border border-white/20 bg-white/10 text-white cursor-pointer flex items-center justify-center"
            onClick={() => showToast('ویرایش پروفایل')}>
            <i className="fa-solid fa-pen text-[12px]" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/15">
          <div className="flex-1 text-center">
            <div className="text-[16px] text-white" style={{ fontWeight: 800 }}>۲۳</div>
            <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>سفارش</div>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="flex-1 text-center">
            <div className="text-[16px] text-white" style={{ fontWeight: 800 }}>۴.۸</div>
            <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>امتیاز</div>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-0.5">
              <StatusPill label="طلایی" color="#F59E0B" />
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>سطح</div>
          </div>
        </div>
      </div>

      {/* Expandable sections */}
      {SECTIONS.map((section, si) => (
        <div key={section.id} className="mb-2">
          <motion.div className="p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform" style={euCardStyle}
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.06 }}
            onClick={() => toggle(section.id)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: section.color + '18' }}>
              <i className={`${section.icon} text-[14px]`} style={{ color: section.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{section.label}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">{toFa(section.count)} مورد</div>
            </div>
            <i className={`fa-solid fa-chevron-${expandedSection === section.id ? 'up' : 'down'} text-[10px] text-[var(--aw-text-muted)] transition-transform`} />
          </motion.div>

          <AnimatePresence>
            {expandedSection === section.id && (
              <motion.div className="mt-1 space-y-1"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                {section.id === 'addresses' && ADDRESSES.map(addr => (
                  <div key={addr.id} className="p-3 mr-3 rounded-xl flex items-start gap-2.5" style={euCardStyle}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#3B82F618' }}>
                      <i className={`${addr.icon} text-[12px] text-[#3B82F6]`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{addr.title}</span>
                        {addr.isDefault && <StatusPill label="پیش‌فرض" color="#10B981" />}
                      </div>
                      <div className="text-[10px] text-[var(--aw-text-muted)] mt-0.5" style={{ lineHeight: '1.7' }}>{addr.address}</div>
                    </div>
                  </div>
                ))}

                {section.id === 'payments' && PAYMENTS.map(pay => (
                  <div key={pay.id} className="p-3 mr-3 rounded-xl flex items-center gap-2.5" style={euCardStyle}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: pay.color + '18' }}>
                      <i className={`${pay.icon} text-[12px]`} style={{ color: pay.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{pay.title}</span>
                        {pay.isDefault && <StatusPill label="پیش‌فرض" color="#10B981" />}
                      </div>
                      <div className="text-[10px] text-[var(--aw-text-muted)]">{pay.balance || pay.last4}</div>
                    </div>
                  </div>
                ))}

                {section.id === 'history' && HISTORY.map(h => (
                  <div key={h.id} className="p-3 mr-3 rounded-xl" style={euCardStyle}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{h.items}</span>
                      <StatusPill label={h.status === 'delivered' ? 'تحویل شده' : 'لغو شده'} color={h.status === 'delivered' ? '#10B981' : '#EF4444'} />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
                      <span><i className="fa-solid fa-store text-[8px] ml-1" />{h.restaurant}</span>
                      <span><i className="fa-regular fa-clock text-[8px] ml-1" />{h.date}</span>
                      <span className="text-[var(--aw-eu-primary)] mr-auto" style={{ fontWeight: 700 }}>{h.total} ت</span>
                    </div>
                  </div>
                ))}

                {/* Add button */}
                <button className="w-full p-2.5 mr-3 rounded-xl border border-dashed border-[var(--aw-border)] bg-transparent text-[11px] text-[var(--aw-text-muted)] cursor-pointer flex items-center justify-center gap-1.5 hover:border-[var(--aw-eu-primary)] hover:text-[var(--aw-eu-primary)] transition-all"
                  onClick={() => showToast(`افزودن ${section.label}`)}>
                  <i className="fa-solid fa-plus text-[9px]" />
                  {section.id === 'addresses' ? 'افزودن آدرس جدید' : section.id === 'payments' ? 'افزودن روش پرداخت' : 'مشاهده بیشتر'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Extra expandable sections */}
      <div className="mt-2 space-y-1.5">
        {[
          {
            id: 'favorites', icon: 'fa-solid fa-heart', label: 'غذاهای مورد علاقه', color: '#EF4444', desc: '۵ مورد',
            items: [
              { t: 'چلوکباب سلطانی', s: 'رستوران شاندیز', p: '۲۸۵,۰۰۰', icon: 'fa-solid fa-drumstick-bite' },
              { t: 'پیتزا پپرونی', s: 'فست‌فود نیکا', p: '۱۹۵,۰۰۰', icon: 'fa-solid fa-pizza-slice' },
              { t: 'قرمه‌سبزی', s: 'رستوران دربار', p: '۱۷۰,۰۰۰', icon: 'fa-solid fa-bowl-food' },
              { t: 'سالاد سزار', s: 'سالاد بار سبز', p: '۹۵,۰۰۰', icon: 'fa-solid fa-leaf' },
              { t: 'برگر مخصوص', s: 'فست‌فود نیکا', p: '۱۴۵,۰۰۰', icon: 'fa-solid fa-burger' },
            ],
          },
          {
            id: 'notifications', icon: 'fa-solid fa-bell', label: 'تنظیمات اعلان', color: '#F59E0B', desc: 'فعال',
            toggles: [
              { t: 'وضعیت سفارش', s: 'آماده‌سازی، ارسال و تحویل', on: true },
              { t: 'تخفیف‌ها و کدها', s: 'اطلاع از کدهای ویژه', on: true },
              { t: 'پیشنهاد دستیار غذا', s: 'پیشنهادهای روزانه AI', on: true },
              { t: 'نظرسنجی پس از سفارش', s: 'یادآور ثبت نظر', on: false },
              { t: 'اعلان صوتی', s: 'پخش صدای اعلان', on: false },
            ],
          },
          {
            id: 'support', icon: 'fa-solid fa-circle-question', label: 'پشتیبانی و راهنما', color: '#6B7280', desc: '',
            links: [
              { t: 'سوالات متداول', s: '۱۲ مقاله', icon: 'fa-solid fa-list' },
              { t: 'تماس با پشتیبانی', s: '۲۴ ساعته', icon: 'fa-solid fa-headset' },
              { t: 'گزارش مشکل سفارش', s: 'برای سفارش‌های اخیر', icon: 'fa-solid fa-triangle-exclamation' },
              { t: 'راهنمای استفاده', s: 'آموزش گام به گام', icon: 'fa-solid fa-book-open' },
            ],
          },
        ].map(item => (
          <div key={item.id}>
            <div className="p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform" style={euCardStyle}
              onClick={() => toggle(item.id)}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18' }}>
                <i className={`${item.icon} text-[13px]`} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{item.label}</div>
                {item.desc && <div className="text-[10px] text-[var(--aw-text-muted)]">{item.desc}</div>}
              </div>
              <i className={`fa-solid fa-chevron-${expandedSection === item.id ? 'up' : 'down'} text-[10px] text-[var(--aw-text-muted)]`} />
            </div>
            <AnimatePresence>
              {expandedSection === item.id && (
                <motion.div className="mt-1 space-y-1"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                  {item.items && item.items.map((f, i) => (
                    <div key={i} className="p-3 mr-3 rounded-xl flex items-center gap-2.5" style={euCardStyle}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18' }}>
                        <i className={`${f.icon} text-[12px]`} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{f.t}</div>
                        <div className="text-[10px] text-[var(--aw-text-muted)]">{f.s}</div>
                      </div>
                      <span className="text-[11px] text-[var(--aw-eu-primary)]" style={{ fontWeight: 700 }}>{f.p} ت</span>
                    </div>
                  ))}
                  {item.toggles && item.toggles.map((tg, i) => (
                    <div key={i} className="p-3 mr-3 rounded-xl flex items-center gap-2.5" style={euCardStyle}>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{tg.t}</div>
                        <div className="text-[10px] text-[var(--aw-text-muted)]">{tg.s}</div>
                      </div>
                      <div className={`w-9 h-5 rounded-full relative transition-colors`} style={{ background: tg.on ? 'var(--aw-eu-primary)' : 'var(--aw-border)' }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ [tg.on ? 'left' : 'right']: '2px' } as any} />
                      </div>
                    </div>
                  ))}
                  {item.links && item.links.map((lk, i) => (
                    <div key={i} className="p-3 mr-3 rounded-xl flex items-center gap-2.5 cursor-pointer active:scale-[0.98] transition-transform" style={euCardStyle}
                      onClick={() => showToast(lk.t)}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18' }}>
                        <i className={`${lk.icon} text-[12px]`} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{lk.t}</div>
                        <div className="text-[10px] text-[var(--aw-text-muted)]">{lk.s}</div>
                      </div>
                      <i className="fa-solid fa-chevron-left text-[10px] text-[var(--aw-text-muted)]" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketChatTab() {
  const CHAT_LIST: ChatListItem[] = [
    { id: 'digitec', name: 'دیجی‌تک', icon: 'fa-solid fa-microchip', color: '#3B82F6', lastMsg: 'سفارش هدفون شما ارسال شد.', time: '۲۰ دقیقه پیش', unread: 1, online: true },
    { id: 'sabz', name: 'سبز مارکت', icon: 'fa-solid fa-seedling', color: '#10B981', lastMsg: 'تخفیف ویژه میوه‌های تازه فعال شد.', time: '۲ ساعت پیش', unread: 2, online: true },
    { id: 'mod', name: 'مد اسپورت', icon: 'fa-solid fa-shirt', color: '#8B5CF6', lastMsg: 'سایز موجود است، می‌توانید سفارش دهید.', time: 'دیروز', unread: 0, online: true },
    { id: 'support', name: 'پشتیبانی مارکت', icon: 'fa-solid fa-headset', color: '#F59E0B', lastMsg: 'پیگیری سفارش ۸۸۷۷ انجام شد.', time: '۱ روز پیش', unread: 0, online: true },
  ];
  const INTERACTION_MESSAGES: Record<string, { from: 'user' | 'agent'; text: string }[]> = {
    digitec: [
      { from: 'agent', text: 'سلام! سفارش هدفون پرو شما تایید شد.' },
      { from: 'user', text: 'کی به دستم می‌رسه؟' },
      { from: 'agent', text: 'سفارش شما ارسال شد و ۱ تا ۲ روز کاری زمان می‌برد.' },
    ],
    sabz: [
      { from: 'agent', text: 'محصولات تازه روزانه به فروشگاه اضافه شد.' },
      { from: 'user', text: 'تخفیف خاصی دارین؟' },
      { from: 'agent', text: 'بله — ۲۰٪ تخفیف روی میوه‌های تازه با کد FRESH20' },
    ],
    mod: [
      { from: 'user', text: 'پیراهن مدل آلفا سایز L موجوده؟' },
      { from: 'agent', text: 'بله موجود است، می‌توانید سفارش دهید. ارسال ۱ تا ۳ روز کاری.' },
    ],
    support: [
      { from: 'agent', text: 'سلام! پشتیبانی مارکت در خدمت شماست.' },
      { from: 'user', text: 'پیگیری سفارش ۸۸۷۷' },
      { from: 'agent', text: 'سفارش ۸۸۷۷ در حال بسته‌بندی است و فردا ارسال می‌شود.' },
    ],
  };
  const AGENT_CARDS: AgentCardItem[] = [
    { id: 'shop-ai', name: 'دستیار خرید', desc: 'پیشنهاد محصول هوشمند', icon: 'fa-solid fa-wand-magic-sparkles', color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)' },
    { id: 'price-ai', name: 'مقایسه قیمت', desc: 'بهترین قیمت بین فروشگاه‌ها', icon: 'fa-solid fa-scale-balanced', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
    { id: 'deal-ai', name: 'ردیاب تخفیف', desc: 'پیشنهادهای ویژه و کدها', icon: 'fa-solid fa-tag', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
    { id: 'review-ai', name: 'تحلیل نظرات', desc: 'خلاصه نظرات کاربران', icon: 'fa-solid fa-comments', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
  ];
  const AGENT_TOPICS: Record<string, AgentTopicItem[]> = {
    'shop-ai': [
      { id: 'shop-t1', title: 'هدفون مناسب گیمینگ', date: '۳۰ دقیقه پیش', msgs: 5, active: true },
      { id: 'shop-t2', title: 'لپ‌تاپ زیر ۴۰ میلیون', date: 'دیروز', msgs: 9 },
    ],
    'price-ai': [
      { id: 'price-t1', title: 'مقایسه قیمت هدفون پرو', date: '۱ ساعت پیش', msgs: 3, active: true },
      { id: 'price-t2', title: 'مقایسه میوه‌فروشی‌ها', date: '۲ روز پیش', msgs: 4 },
    ],
    'deal-ai': [
      { id: 'deal-t1', title: 'تخفیف‌های امروز', date: '۴۵ دقیقه پیش', msgs: 6, active: true },
      { id: 'deal-t2', title: 'جشنواره دیجی‌تک', date: 'دیروز', msgs: 2 },
    ],
    'review-ai': [
      { id: 'rev-t1', title: 'نظرات هدفون پرو', date: '۲۰ دقیقه پیش', msgs: 3, active: true },
    ],
  };
  const TOPIC_MESSAGES: Record<string, { from: 'user' | 'agent'; text: string }[]> = {
    'shop-t1': [
      { from: 'user', text: 'هدفون گیمینگ خوب پیشنهاد بده.' },
      { from: 'agent', text: '🥇 هدفون پرو دیجی‌تک — ۲,۴۵۰,۰۰۰ (۱۰٪ تخفیف)\n🥈 هدفون گیمر X — ۱,۸۵۰,۰۰۰\n🥉 هدفون استودیو Y — ۲,۱۰۰,۰۰۰' },
    ],
    'shop-t2': [
      { from: 'user', text: 'لپ‌تاپ زیر ۴۰ میلیون پیشنهاد بده.' },
      { from: 'agent', text: 'لپ‌تاپ ایسوس مدل K17 — ۳۸,۵۰۰,۰۰۰\nگارانتی ۱۸ ماهه از دیجی‌تک.' },
    ],
    'price-t1': [
      { from: 'user', text: 'هدفون پرو در فروشگاه‌های دیگه چقدره؟' },
      { from: 'agent', text: 'دیجی‌تک: ۲,۴۵۰,۰۰۰ ✅ بهترین قیمت\nمد اسپورت: ۲,۶۸۰,۰۰۰\nسایر: ۲,۵۵۰,۰۰۰' },
    ],
    'price-t2': [
      { from: 'user', text: 'سبزیجات تازه از کجا بخرم؟' },
      { from: 'agent', text: 'سبز مارکت ۱۸٪ ارزان‌تر از میانگین بازار است.' },
    ],
    'deal-t1': [
      { from: 'agent', text: '🔥 تخفیف‌های ویژه امروز:\n• دیجی‌تک ۱۰٪ روی صوتی\n• سبز مارکت ۲۰٪ میوه\n• مد اسپورت ۱۵٪ پوشاک' },
    ],
    'deal-t2': [
      { from: 'agent', text: 'جشنواره دیجی‌تک تا پایان هفته فعال است.' },
    ],
    'rev-t1': [
      { from: 'user', text: 'نظرات کاربران درباره هدفون پرو چیه؟' },
      { from: 'agent', text: '⭐ ۴.۷ از ۵ — ۲۳۸ نظر\n✅ کیفیت صدا عالی\n✅ باتری طولانی\n⚠️ کمی سنگین' },
    ],
  };
  const SUGGESTIONS = {
    'shop-ai': ['چی پیشنهاد میدی؟', 'پرفروش‌ترین‌ها', 'محصولات جدید'],
    'price-ai': ['ارزان‌ترین قیمت', 'مقایسه فروشگاه', 'تخفیف فعلی'],
    'deal-ai': ['تخفیف‌های امروز', 'کد فعال دارین؟', 'جشنواره‌ها'],
    'review-ai': ['نظرات محصول', 'بهترین برند', 'تحلیل کیفیت'],
  };
  return <AgentChatTabUI chatList={CHAT_LIST} interactionMessages={INTERACTION_MESSAGES} agentCards={AGENT_CARDS} agentTopics={AGENT_TOPICS} topicMessages={TOPIC_MESSAGES} suggestionsByAgent={SUGGESTIONS} uniqueKey="market" />;
}

function MarketAccountTab() {
  const { showToast, euProfile } = useApp();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedSection(prev => prev === id ? null : id);

  const ADDRESSES = [
    { id: 1, title: 'خانه', address: 'تهران، خیابان ولیعصر، پلاک ۱۲، واحد ۳', icon: 'fa-solid fa-house', isDefault: true },
    { id: 2, title: 'محل کار', address: 'تهران، سعادت‌آباد، بلوار دریا، ساختمان آلفا', icon: 'fa-solid fa-building', isDefault: false },
    { id: 3, title: 'انبار', address: 'کرج، عظیمیه، خیابان نسیم، پلاک ۴۵', icon: 'fa-solid fa-warehouse', isDefault: false },
  ];
  const PAYMENTS = [
    { id: 1, title: 'کیف پول Neura', balance: '۲,۴۵۰,۰۰۰ تومان', icon: 'fa-solid fa-wallet', color: '#8B5CF6', isDefault: true },
    { id: 2, title: 'کارت بانکی ملت', last4: '****۴۵۶۷', icon: 'fa-solid fa-credit-card', color: '#EF4444', isDefault: false },
    { id: 3, title: 'کارت بانکی ملی', last4: '****۸۹۰۱', icon: 'fa-solid fa-credit-card', color: '#3B82F6', isDefault: false },
  ];
  const HISTORY = [
    { id: 1, items: 'هدفون پرو دیجی‌تک', shop: 'دیجی‌تک', date: '۴ اسفند ۱۴۰۴', total: '۲,۲۰۵,۰۰۰', status: 'delivered' as const },
    { id: 2, items: 'بسته میوه و سبزیجات', shop: 'سبز مارکت', date: '۳ اسفند ۱۴۰۴', total: '۳۸۵,۰۰۰', status: 'delivered' as const },
    { id: 3, items: 'پیراهن مردانه آلفا × ۲', shop: 'مد اسپورت', date: '۲ اسفند ۱۴۰۴', total: '۹۵۰,۰۰۰', status: 'shipping' as const },
    { id: 4, items: 'کرم مرطوب‌کننده', shop: 'بیوتی‌شاپ رز', date: '۱ اسفند ۱۴۰۴', total: '۳۲۰,۰۰۰', status: 'delivered' as const },
    { id: 5, items: 'کتاب رمان فارسی × ۳', shop: 'کتاب‌سرا', date: '۲۸ بهمن ۱۴۰۴', total: '۴۸۰,۰۰۰', status: 'cancelled' as const },
  ];

  const SECTIONS = [
    { id: 'addresses', icon: 'fa-solid fa-map-marker-alt', label: 'آدرس‌های ارسال', color: '#3B82F6', count: ADDRESSES.length },
    { id: 'payments', icon: 'fa-solid fa-credit-card', label: 'روش‌های پرداخت', color: '#10B981', count: PAYMENTS.length },
    { id: 'history', icon: 'fa-solid fa-clock-rotate-left', label: 'تاریخچه خرید', color: '#F59E0B', count: HISTORY.length },
  ];

  const statusLabel = (s: string) => s === 'delivered' ? 'تحویل شده' : s === 'shipping' ? 'در حال ارسال' : 'لغو شده';
  const statusColor = (s: string) => s === 'delivered' ? '#10B981' : s === 'shipping' ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      {/* Profile card */}
      <div className="p-4 rounded-2xl mb-3" style={{ ...euCardStyle, background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-[20px] border-2 border-white/30"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800 }}>
            {euProfile.avatar || 'P'}
          </div>
          <div className="flex-1">
            <div className="text-[14px] text-white" style={{ fontWeight: 800 }}>{euProfile.name}</div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{euProfile.phone || '۰۹۱۲۳۴۵۶۷۸۹'}</div>
          </div>
          <button className="w-9 h-9 rounded-xl border border-white/20 bg-white/10 text-white cursor-pointer flex items-center justify-center"
            onClick={() => showToast('ویرایش پروفایل')}>
            <i className="fa-solid fa-pen text-[12px]" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/15">
          <div className="flex-1 text-center">
            <div className="text-[16px] text-white" style={{ fontWeight: 800 }}>۳۸</div>
            <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>خرید</div>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="flex-1 text-center">
            <div className="text-[16px] text-white" style={{ fontWeight: 800 }}>۴.۹</div>
            <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>امتیاز</div>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-0.5">
              <StatusPill label="VIP" color="#8B5CF6" />
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>سطح</div>
          </div>
        </div>
      </div>

      {SECTIONS.map((section, si) => (
        <div key={section.id} className="mb-2">
          <motion.div className="p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform" style={euCardStyle}
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.06 }}
            onClick={() => toggle(section.id)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: section.color + '18' }}>
              <i className={`${section.icon} text-[14px]`} style={{ color: section.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{section.label}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">{toFa(section.count)} مورد</div>
            </div>
            <i className={`fa-solid fa-chevron-${expandedSection === section.id ? 'up' : 'down'} text-[10px] text-[var(--aw-text-muted)]`} />
          </motion.div>

          <AnimatePresence>
            {expandedSection === section.id && (
              <motion.div className="mt-1 space-y-1"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                {section.id === 'addresses' && ADDRESSES.map(addr => (
                  <div key={addr.id} className="p-3 mr-3 rounded-xl flex items-start gap-2.5" style={euCardStyle}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#3B82F618' }}>
                      <i className={`${addr.icon} text-[12px] text-[#3B82F6]`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{addr.title}</span>
                        {addr.isDefault && <StatusPill label="پیش‌فرض" color="#10B981" />}
                      </div>
                      <div className="text-[10px] text-[var(--aw-text-muted)] mt-0.5" style={{ lineHeight: '1.7' }}>{addr.address}</div>
                    </div>
                  </div>
                ))}
                {section.id === 'payments' && PAYMENTS.map(pay => (
                  <div key={pay.id} className="p-3 mr-3 rounded-xl flex items-center gap-2.5" style={euCardStyle}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: pay.color + '18' }}>
                      <i className={`${pay.icon} text-[12px]`} style={{ color: pay.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{pay.title}</span>
                        {pay.isDefault && <StatusPill label="پیش‌فرض" color="#10B981" />}
                      </div>
                      <div className="text-[10px] text-[var(--aw-text-muted)]">{pay.balance || pay.last4}</div>
                    </div>
                  </div>
                ))}
                {section.id === 'history' && HISTORY.map(h => (
                  <div key={h.id} className="p-3 mr-3 rounded-xl" style={euCardStyle}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{h.items}</span>
                      <StatusPill label={statusLabel(h.status)} color={statusColor(h.status)} />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
                      <span><i className="fa-solid fa-store text-[8px] ml-1" />{h.shop}</span>
                      <span><i className="fa-regular fa-clock text-[8px] ml-1" />{h.date}</span>
                      <span className="text-[#F59E0B] mr-auto" style={{ fontWeight: 700 }}>{h.total} ت</span>
                    </div>
                  </div>
                ))}
                <button className="w-full p-2.5 mr-3 rounded-xl border border-dashed border-[var(--aw-border)] bg-transparent text-[11px] text-[var(--aw-text-muted)] cursor-pointer flex items-center justify-center gap-1.5 hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all"
                  onClick={() => showToast(`افزودن ${section.label}`)}>
                  <i className="fa-solid fa-plus text-[9px]" />
                  {section.id === 'addresses' ? 'افزودن آدرس جدید' : section.id === 'payments' ? 'افزودن روش پرداخت' : 'مشاهده بیشتر'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div className="mt-2 space-y-1.5">
        {[
          {
            id: 'wishlist', icon: 'fa-solid fa-heart', label: 'علاقه‌مندی‌ها', color: '#EF4444', desc: '۷ محصول',
            items: [
              { t: 'هدفون پرو دیجی‌تک', s: 'دیجی‌تک', p: '۲,۴۵۰,۰۰۰', icon: 'fa-solid fa-headphones' },
              { t: 'لپ‌تاپ ایسوس K17', s: 'دیجی‌تک', p: '۳۸,۵۰۰,۰۰۰', icon: 'fa-solid fa-laptop' },
              { t: 'پیراهن مدل آلفا', s: 'مد اسپورت', p: '۴۸۰,۰۰۰', icon: 'fa-solid fa-shirt' },
              { t: 'کرم ضد پیری', s: 'بیوتی‌شاپ رز', p: '۵۲۰,۰۰۰', icon: 'fa-solid fa-spa' },
              { t: 'کتاب رمان شب', s: 'کتاب‌سرا', p: '۱۸۰,۰۰۰', icon: 'fa-solid fa-book' },
            ],
          },
          {
            id: 'cashback', icon: 'fa-solid fa-gift', label: 'کش‌بک و امتیازها', color: '#8B5CF6', desc: '۳۲۵,۰۰۰ ت',
            items: [
              { t: 'کش‌بک هدفون پرو', s: 'دیجی‌تک — ۴ اسفند', p: '۱۲۰,۰۰۰', icon: 'fa-solid fa-coins' },
              { t: 'کش‌بک خرید میوه', s: 'سبز مارکت — ۳ اسفند', p: '۴۵,۰۰۰', icon: 'fa-solid fa-coins' },
              { t: 'بونوس عضویت VIP', s: '۱ اسفند', p: '۱۶۰,۰۰۰', icon: 'fa-solid fa-crown' },
            ],
          },
          {
            id: 'notifications', icon: 'fa-solid fa-bell', label: 'تنظیمات اعلان', color: '#F59E0B', desc: 'فعال',
            toggles: [
              { t: 'وضعیت سفارش', s: 'بسته‌بندی، ارسال و تحویل', on: true },
              { t: 'تخفیف‌ها و جشنواره‌ها', s: 'پیشنهادهای ویژه', on: true },
              { t: 'موجود شدن محصول', s: 'علاقه‌مندی‌های ناموجود', on: true },
              { t: 'کاهش قیمت', s: 'محصولات تحت نظر', on: false },
              { t: 'پیشنهاد دستیار خرید', s: 'محصولات مرتبط AI', on: true },
            ],
          },
          {
            id: 'support', icon: 'fa-solid fa-circle-question', label: 'پشتیبانی و راهنما', color: '#6B7280', desc: '',
            links: [
              { t: 'سوالات متداول', s: '۱۸ مقاله', icon: 'fa-solid fa-list' },
              { t: 'تماس با پشتیبانی', s: '۲۴ ساعته', icon: 'fa-solid fa-headset' },
              { t: 'گزارش مشکل سفارش', s: 'برای سفارش‌های اخیر', icon: 'fa-solid fa-triangle-exclamation' },
              { t: 'درخواست مرجوعی', s: 'پیگیری کالای برگشتی', icon: 'fa-solid fa-rotate-left' },
              { t: 'راهنمای ضمانت', s: 'شرایط بازگشت کالا', icon: 'fa-solid fa-shield-halved' },
            ],
          },
        ].map(item => (
          <div key={item.id}>
            <div className="p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform" style={euCardStyle}
              onClick={() => toggle(item.id)}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18' }}>
                <i className={`${item.icon} text-[13px]`} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{item.label}</div>
                {item.desc && <div className="text-[10px] text-[var(--aw-text-muted)]">{item.desc}</div>}
              </div>
              <i className={`fa-solid fa-chevron-${expandedSection === item.id ? 'up' : 'down'} text-[10px] text-[var(--aw-text-muted)]`} />
            </div>
            <AnimatePresence>
              {expandedSection === item.id && (
                <motion.div className="mt-1 space-y-1"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                  {item.items && item.items.map((f, i) => (
                    <div key={i} className="p-3 mr-3 rounded-xl flex items-center gap-2.5" style={euCardStyle}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18' }}>
                        <i className={`${f.icon} text-[12px]`} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{f.t}</div>
                        <div className="text-[10px] text-[var(--aw-text-muted)]">{f.s}</div>
                      </div>
                      <span className="text-[11px]" style={{ color: item.color, fontWeight: 700 }}>{f.p} ت</span>
                    </div>
                  ))}
                  {item.toggles && item.toggles.map((tg, i) => (
                    <div key={i} className="p-3 mr-3 rounded-xl flex items-center gap-2.5" style={euCardStyle}>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{tg.t}</div>
                        <div className="text-[10px] text-[var(--aw-text-muted)]">{tg.s}</div>
                      </div>
                      <div className="w-9 h-5 rounded-full relative transition-colors" style={{ background: tg.on ? '#F59E0B' : 'var(--aw-border)' }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ [tg.on ? 'left' : 'right']: '2px' } as any} />
                      </div>
                    </div>
                  ))}
                  {item.links && item.links.map((lk, i) => (
                    <div key={i} className="p-3 mr-3 rounded-xl flex items-center gap-2.5 cursor-pointer active:scale-[0.98] transition-transform" style={euCardStyle}
                      onClick={() => showToast(lk.t)}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18' }}>
                        <i className={`${lk.icon} text-[12px]`} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{lk.t}</div>
                        <div className="text-[10px] text-[var(--aw-text-muted)]">{lk.s}</div>
                      </div>
                      <i className="fa-solid fa-chevron-left text-[10px] text-[var(--aw-text-muted)]" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EuDineScreen() {
  const { setEuScreen } = useApp();
  const [tab, setTab] = useState('restaurants');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const activeOrders = DINE_ORDERS.filter(o => o.status === 'preparing' || o.status === 'delivering').length;
  const dineTabs = DINE_TABS.map(t => {
    if (t.id === 'orders') return { ...t, badge: cartCount + activeOrders > 0 ? cartCount + activeOrders : undefined };
    return t;
  });

  // If a restaurant is selected & we're on the restaurants tab, show its detail
  if (selectedRestaurant && tab === 'restaurants') {
    return (
      <div className="flex flex-col h-full relative">
        <AgentHeader title="سفارش غذا" icon="fa-solid fa-utensils" color="#14b8a6" onBack={() => setEuScreen('euHomeScreen')}
          badge={cartCount > 0 ? (
            <button className="relative w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent text-[var(--aw-eu-primary)] cursor-pointer flex items-center justify-center"
              onClick={() => { setSelectedRestaurant(null); setTab('orders'); }}>
              <i className="fa-solid fa-shopping-cart text-[14px]" />
              <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>{toFa(cartCount)}</span>
            </button>
          ) : undefined}
        />
        <RestaurantDetailView restaurant={selectedRestaurant} onBack={() => setSelectedRestaurant(null)} cart={cart} setCart={setCart} />

        {/* Floating cart bar inside restaurant */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div className="absolute bottom-14 left-4 right-4 z-20"
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border-none text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--aw-eu-primary), #14b8a6)', boxShadow: '0 4px 20px rgba(126,95,170,0.4)' }}
                onClick={() => { setSelectedRestaurant(null); setTab('orders'); }}>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-shopping-cart" />
                  <span className="text-[12px]" style={{ fontWeight: 600 }}>مشاهده سبد خرید</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 700 }}>{toFa(cartCount)} آیتم</span>
                </div>
                <span className="text-[13px]" style={{ fontWeight: 700 }}>{cart.reduce((s, c) => s + c.menuItem.priceNum * c.qty, 0).toLocaleString('fa-IR')} ت</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AgentTabBar tabs={dineTabs} active={tab} onChange={(id) => { setSelectedRestaurant(null); setTab(id); }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <AgentHeader title="سفارش غذا" icon="fa-solid fa-utensils" color="#14b8a6" onBack={() => setEuScreen('euHomeScreen')}
        badge={cartCount > 0 ? (
          <button className="relative w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent text-[var(--aw-eu-primary)] cursor-pointer flex items-center justify-center"
            onClick={() => setTab('orders')}>
            <i className="fa-solid fa-shopping-cart text-[14px]" />
            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>{toFa(cartCount)}</span>
          </button>
        ) : undefined}
      />
      <AnimatePresence mode="wait">
        <motion.div key={tab} className="flex-1 flex flex-col min-h-0"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'restaurants' && <DineRestaurantsTab onSelectRestaurant={setSelectedRestaurant} />}
          {tab === 'orders' && <DineOrdersTab cart={cart} setCart={setCart} />}
          {tab === 'chat' && <DineChatTab />}
          {tab === 'offers' && <DineOffersTab />}
          {tab === 'account' && <DineAccountTab />}
        </motion.div>
      </AnimatePresence>

      {/* Floating cart bar */}
      <AnimatePresence>
        {cartCount > 0 && tab === 'restaurants' && (
          <motion.div className="absolute bottom-14 left-4 right-4 z-20"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border-none text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--aw-eu-primary), #14b8a6)', boxShadow: '0 4px 20px rgba(126,95,170,0.4)' }}
              onClick={() => setTab('orders')}>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-shopping-cart" />
                <span className="text-[12px]" style={{ fontWeight: 600 }}>مشاهده سبد خرید</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 700 }}>{toFa(cartCount)} آیتم</span>
              </div>
              <span className="text-[13px]" style={{ fontWeight: 700 }}>{cart.reduce((s, c) => s + c.menuItem.priceNum * c.qty, 0).toLocaleString('fa-IR')} ت</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AgentTabBar tabs={dineTabs} active={tab} onChange={setTab} />
    </div>
  );
}


// =====================================================================
//  2.  ASSISTANT SCREEN (دستیار شخصی)
// =====================================================================
const ASSISTANT_TABS = [
  { id: 'chat', icon: 'fa-solid fa-comments', label: 'گفتگو' },
];

type PlanStatus = 'pending' | 'inprogress' | 'done' | 'cancelled';

interface CalEvent { id: number; title: string; time: string; date: string; type: 'meeting' | 'reminder' | 'personal' | 'work'; status: PlanStatus; muted: boolean; description?: string }

const planStatusStyles: Record<PlanStatus, { label: string; bg: string; border: string; pillBg: string; pillText: string; icon: string }> = {
  pending:    { label: 'معلق',         bg: 'rgba(255,255,255,0.04)',  border: 'rgba(255,255,255,0.10)', pillBg: 'rgba(255,255,255,0.10)', pillText: '#E5E7EB', icon: 'fa-solid fa-hourglass-half' },
  inprogress: { label: 'در حال انجام', bg: 'rgba(245,158,11,0.10)',   border: 'rgba(245,158,11,0.35)', pillBg: 'rgba(245,158,11,0.18)', pillText: '#F59E0B', icon: 'fa-solid fa-spinner' },
  done:       { label: 'انجام شده',    bg: 'rgba(16,185,129,0.10)',   border: 'rgba(16,185,129,0.35)', pillBg: 'rgba(16,185,129,0.18)', pillText: '#10B981', icon: 'fa-solid fa-circle-check' },
  cancelled:  { label: 'لغو شده',      bg: 'rgba(239,68,68,0.10)',    border: 'rgba(239,68,68,0.35)',  pillBg: 'rgba(239,68,68,0.18)',  pillText: '#EF4444', icon: 'fa-solid fa-ban' },
};

const INITIAL_CAL_EVENTS: CalEvent[] = [
  { id: 1, title: 'جلسه تیم فنی', time: '۰۹:۰۰ - ۱۰:۳۰', date: 'امروز', type: 'meeting', status: 'done', muted: false, description: 'مرور پیشرفت اسپرینت جاری و رفع موانع تیم.' },
  { id: 2, title: 'یادآوری: ارسال گزارش ماهانه', time: '۱۱:۰۰', date: 'امروز', type: 'reminder', status: 'pending', muted: false, description: 'تهیه و ارسال گزارش KPI‌های ماهانه به مدیر عامل.' },
  { id: 3, title: 'ناهار با تیم', time: '۱۲:۳۰ - ۱۳:۳۰', date: 'امروز', type: 'personal', status: 'done', muted: false, description: 'صرف ناهار با اعضای تیم در رستوران شاندیز.' },
  { id: 4, title: 'بررسی بودجه فصلی', time: '۱۴:۰۰ - ۱۵:۰۰', date: 'امروز', type: 'work', status: 'inprogress', muted: false, description: 'تحلیل عملکرد بودجه و آماده‌سازی پیش‌بینی فصل بعد.' },
  { id: 5, title: 'جلسه با مشتری آلفا', time: '۱۰:۰۰ - ۱۱:۰۰', date: 'فردا', type: 'meeting', status: 'pending', muted: false, description: 'بررسی پیشنهاد جدید قرارداد سالانه.' },
  { id: 6, title: 'ورزش صبحگاهی', time: '۰۷:۰۰ - ۰۷:۴۵', date: 'فردا', type: 'personal', status: 'pending', muted: true, description: 'دویدن و تمرینات کششی در پارک.' },
  { id: 7, title: 'جلسه هماهنگی پروژه دلتا', time: '۰۹:۳۰ - ۱۱:۰۰', date: 'تا یک ماه آینده', type: 'meeting', status: 'pending', muted: false },
  { id: 8, title: 'وبینار آموزش تیم فروش', time: '۱۴:۰۰ - ۱۵:۳۰', date: 'تا یک ماه آینده', type: 'work', status: 'inprogress', muted: false, description: 'آموزش تکنیک‌های جدید مذاکره و بستن قرارداد.' },
  { id: 9, title: 'یادآوری: تمدید قرارداد سرور', time: '۱۰:۰۰', date: 'تا یک ماه آینده', type: 'reminder', status: 'pending', muted: false },
  { id: 10, title: 'جلسه بررسی عملکرد فصلی', time: '۱۰:۰۰ - ۱۲:۰۰', date: 'تا یک ماه آینده', type: 'meeting', status: 'pending', muted: false },
  { id: 11, title: 'سمینار نوآوری و فناوری', time: '۰۹:۰۰ - ۱۷:۰۰', date: 'تا یک ماه آینده', type: 'work', status: 'cancelled', muted: false, description: 'به دلیل تداخل با جلسه هیئت‌مدیره لغو شد.' },
  { id: 12, title: 'سفر تفریحی تیم', time: 'تمام روز', date: 'تا یک ماه آینده', type: 'personal', status: 'pending', muted: false },
  { id: 13, title: 'یادآوری: ارسال گزارش سالانه', time: '۱۶:۰۰', date: 'تا یک ماه آینده', type: 'reminder', status: 'pending', muted: false },
  // —— تاریخچه برنامه‌های انجام‌شده / لغو شده برای گزارش‌گیری ——
  { id: 14, title: 'جلسه استارت‌آپ ویکند',           time: '۱۰:۰۰ - ۱۲:۰۰', date: 'تا یک ماه آینده', type: 'meeting',  status: 'done',      muted: false, description: 'حضور در رویداد استارت‌آپ ویکند به‌عنوان منتور.' },
  { id: 15, title: 'بازنگری کیفیت کد تیم بک‌اند',     time: '۱۴:۰۰ - ۱۶:۰۰', date: 'تا یک ماه آینده', type: 'work',     status: 'done',      muted: false },
  { id: 16, title: 'تماس با شرکت بیمه',              time: '۱۱:۰۰',         date: 'تا یک ماه آینده', type: 'reminder', status: 'done',      muted: false },
  { id: 17, title: 'جلسه ریتسپکتیو اسپرینت',          time: '۱۵:۰۰ - ۱۶:۰۰', date: 'تا یک ماه آینده', type: 'meeting',  status: 'done',      muted: false },
  { id: 18, title: 'تماس مشاوره پزشکی',              time: '۰۹:۰۰',         date: 'تا یک ماه آینده', type: 'personal', status: 'done',      muted: false },
  { id: 19, title: 'دوره آموزشی TypeScript',          time: '۱۸:۰۰ - ۲۰:۰۰', date: 'تا یک ماه آینده', type: 'work',     status: 'done',      muted: false },
  { id: 20, title: 'جلسه با تیم طراحی محصول',         time: '۱۰:۳۰ - ۱۱:۳۰', date: 'تا یک ماه آینده', type: 'meeting',  status: 'done',      muted: false },
  { id: 21, title: 'تولد همکار',                     time: '۱۹:۰۰',         date: 'تا یک ماه آینده', type: 'personal', status: 'done',      muted: false },
  { id: 22, title: 'یادآوری: تمدید بیمه خودرو',       time: '۱۲:۰۰',         date: 'تا یک ماه آینده', type: 'reminder', status: 'done',      muted: false },
  { id: 23, title: 'جلسه هیئت‌مدیره فصلی',            time: '۰۹:۰۰ - ۱۲:۰۰', date: 'تا یک ماه آینده', type: 'meeting',  status: 'done',      muted: false },
  { id: 24, title: 'کارگاه آموزش UI/UX',             time: '۱۰:۰۰ - ۱۷:۰۰', date: 'تا یک ماه آینده', type: 'work',     status: 'done',      muted: false },
  { id: 25, title: 'جلسه بررسی KPI تیم پشتیبانی',     time: '۱۳:۰۰ - ۱۴:۰۰', date: 'تا یک ماه آینده', type: 'work',     status: 'done',      muted: false },
  { id: 26, title: 'دیدار خانوادگی',                 time: '۱۸:۰۰ - ۲۲:۰۰', date: 'تا یک ماه آینده', type: 'personal', status: 'done',      muted: false },
  { id: 27, title: 'یادآوری: پرداخت قبض اینترنت',     time: '۱۵:۰۰',         date: 'تا یک ماه آینده', type: 'reminder', status: 'done',      muted: false },
  { id: 28, title: 'جلسه برنامه‌ریزی پروژه گاما',     time: '۱۰:۰۰ - ۱۱:۳۰', date: 'تا یک ماه آینده', type: 'meeting',  status: 'done',      muted: false },
  { id: 29, title: 'مصاحبه استخدامی بک‌اند',          time: '۱۴:۰۰ - ۱۵:۰۰', date: 'تا یک ماه آینده', type: 'work',     status: 'done',      muted: false },
  { id: 30, title: 'سفر کاری به اصفهان',             time: 'تمام روز',       date: 'تا یک ماه آینده', type: 'work',     status: 'done',      muted: false },
  { id: 31, title: 'جلسه دموی محصول با سرمایه‌گذار', time: '۱۱:۰۰ - ۱۲:۳۰', date: 'تا یک ماه آینده', type: 'meeting',  status: 'cancelled', muted: false },
  { id: 32, title: 'مرور سالیانه تیم',                time: '۰۹:۰۰ - ۱۲:۰۰', date: 'تا یک ماه آینده', type: 'work',     status: 'done',      muted: false },
  { id: 33, title: 'جلسه طراحی معماری میکروسرویس',    time: '۱۴:۰۰ - ۱۶:۳۰', date: 'تا یک ماه آینده', type: 'meeting',  status: 'done',      muted: false },
  { id: 34, title: 'دیدار با پزشک خانواده',           time: '۱۶:۰۰',         date: 'تا یک ماه آینده', type: 'personal', status: 'done',      muted: false },
  { id: 35, title: 'یادآوری: آبیاری گیاهان',         time: '۰۸:۰۰',         date: 'تا یک ماه آینده', type: 'reminder', status: 'done',      muted: true  },
  { id: 36, title: 'جلسه فروش شعبه شمال',             time: '۱۰:۰۰ - ۱۱:۰۰', date: 'تا یک ماه آینده', type: 'meeting',  status: 'done',      muted: false },
  { id: 37, title: 'کارگاه مهارت‌های ارتباطی',        time: '۱۳:۰۰ - ۱۷:۰۰', date: 'تا یک ماه آینده', type: 'work',     status: 'cancelled', muted: false },
];

const calTypeColors: Record<string, { color: string; icon: string; label: string }> = {
  meeting: { color: '#3B82F6', icon: 'fa-solid fa-users', label: 'جلسه' },
  reminder: { color: '#F59E0B', icon: 'fa-solid fa-bell', label: 'یادآور' },
  personal: { color: '#10B981', icon: 'fa-solid fa-heart', label: 'شخصی' },
  work: { color: '#8B5CF6', icon: 'fa-solid fa-briefcase', label: 'کاری' },
};

interface AsstTask { id: number; title: string; priority: 'high' | 'medium' | 'low'; done: boolean; dueDate: string; eventId?: number }

const INITIAL_TASKS: AsstTask[] = [
  // برنامه ۱: جلسه تیم فنی (انجام شده)
  { id: 101, title: 'آماده‌سازی دستور جلسه', priority: 'medium', done: true, dueDate: 'دیروز', eventId: 1 },
  { id: 102, title: 'مرور تیکت‌های باز اسپرینت', priority: 'high', done: true, dueDate: 'امروز', eventId: 1 },
  { id: 103, title: 'ثبت صورت‌جلسه و ارسال به تیم', priority: 'low', done: true, dueDate: 'امروز', eventId: 1 },

  // برنامه ۲: یادآوری ارسال گزارش ماهانه (معلق)
  { id: 201, title: 'استخراج آمار فروش ماه', priority: 'high', done: false, dueDate: 'امروز', eventId: 2 },
  { id: 202, title: 'تهیه نمودارهای KPI', priority: 'medium', done: false, dueDate: 'امروز', eventId: 2 },
  { id: 203, title: 'ارسال نسخه نهایی به مدیر عامل', priority: 'high', done: false, dueDate: 'امروز', eventId: 2 },

  // برنامه ۴: بررسی بودجه فصلی (در حال انجام)
  { id: 401, title: 'جمع‌آوری گزارش‌های مالی واحدها', priority: 'high', done: false, dueDate: 'امروز', eventId: 4 },
  { id: 402, title: 'تهیه پیش‌بینی هزینه‌های فصل بعد', priority: 'medium', done: false, dueDate: 'امروز', eventId: 4 },
  { id: 403, title: 'تماس با تأمین‌کننده جدید', priority: 'high', done: true, dueDate: 'دیروز', eventId: 4 },
  { id: 404, title: 'بازبینی قراردادهای جاری', priority: 'low', done: false, dueDate: 'فردا', eventId: 4 },

  // برنامه ۵: جلسه با مشتری آلفا (معلق)
  { id: 501, title: 'مرور پروپوزال قبلی', priority: 'medium', done: false, dueDate: 'فردا', eventId: 5 },
  { id: 502, title: 'تهیه اسلاید معرفی محصول', priority: 'high', done: false, dueDate: 'فردا', eventId: 5 },
  { id: 503, title: 'هماهنگی لینک گوگل‌میت', priority: 'low', done: false, dueDate: 'فردا', eventId: 5 },

  // برنامه ۷: جلسه هماهنگی پروژه دلتا (معلق)
  { id: 701, title: 'بررسی پیشرفت تیم بک‌اند', priority: 'high', done: false, dueDate: 'هفته بعد', eventId: 7 },
  { id: 702, title: 'تهیه گزارش وضعیت پروژه', priority: 'medium', done: false, dueDate: 'هفته بعد', eventId: 7 },

  // برنامه ۸: وبینار آموزش تیم فروش (در حال انجام)
  { id: 801, title: 'تهیه اسلاید معرفی تکنیک‌ها', priority: 'high', done: false, dueDate: 'فردا', eventId: 8 },
  { id: 802, title: 'هماهنگی با اساتید مهمان', priority: 'medium', done: true, dueDate: 'هفته پیش', eventId: 8 },
  { id: 803, title: 'تست پلتفرم پخش زنده', priority: 'medium', done: false, dueDate: 'فردا', eventId: 8 },
  { id: 804, title: 'ارسال لینک ثبت‌نام به فروشندگان', priority: 'low', done: false, dueDate: 'امروز', eventId: 8 },

  // برنامه ۱۰: جلسه بررسی عملکرد فصلی (معلق)
  { id: 1001, title: 'جمع‌آوری بازخورد سرپرستان', priority: 'medium', done: false, dueDate: 'هفته بعد', eventId: 10 },
  { id: 1002, title: 'تحلیل شاخص‌های عملکرد', priority: 'high', done: false, dueDate: 'هفته بعد', eventId: 10 },

  // وظایف بدون برنامه
  { id: 9001, title: 'بررسی ایمیل‌های مشتریان', priority: 'low', done: false, dueDate: 'فردا' },
  { id: 9002, title: 'پاسخ به نظرات شبکه‌های اجتماعی', priority: 'low', done: false, dueDate: 'امروز' },

  // —— تاریخچه وظایف انجام‌شده برای گزارش‌گیری ——
  { id: 9100, title: 'بازبینی پروپوزال پروژه آلفا',         priority: 'high',   done: true, dueDate: 'دیروز' },
  { id: 9101, title: 'به‌روزرسانی مستندات API',             priority: 'medium', done: true, dueDate: 'دیروز' },
  { id: 9102, title: 'پاسخ به تیکت‌های پشتیبانی',           priority: 'medium', done: true, dueDate: 'دیروز' },
  { id: 9103, title: 'بررسی کامیت‌های پول‌ریکوئست',          priority: 'high',   done: true, dueDate: '۲ روز پیش' },
  { id: 9104, title: 'تنظیم ساعت ورزش هفتگی',                priority: 'low',    done: true, dueDate: '۲ روز پیش' },
  { id: 9105, title: 'مذاکره با تأمین‌کننده اصلی',           priority: 'high',   done: true, dueDate: '۳ روز پیش' },
  { id: 9106, title: 'ساخت گزارش هفتگی فروش',                priority: 'medium', done: true, dueDate: '۳ روز پیش' },
  { id: 9107, title: 'پیگیری انبارگردانی شعبه ۲',            priority: 'medium', done: true, dueDate: '۴ روز پیش' },
  { id: 9108, title: 'پاسخ به نظرسنجی مشتریان',              priority: 'low',    done: true, dueDate: '۴ روز پیش' },
  { id: 9109, title: 'بررسی صورت‌حساب‌های ماهانه',           priority: 'high',   done: true, dueDate: '۵ روز پیش' },
  { id: 9110, title: 'تماس با وکیل برای قرارداد جدید',       priority: 'high',   done: true, dueDate: '۵ روز پیش' },
  { id: 9111, title: 'بک‌آپ‌گیری از سرور اصلی',              priority: 'medium', done: true, dueDate: '۶ روز پیش' },
  { id: 9112, title: 'پیاده‌سازی فیچر فیلتر سفارش',          priority: 'high',   done: true, dueDate: '۶ روز پیش' },
  { id: 9113, title: 'بازبینی طراحی صفحه فرود',              priority: 'medium', done: true, dueDate: '۷ روز پیش' },
  { id: 9114, title: 'برگزاری جلسه استندآپ تیم',             priority: 'low',    done: true, dueDate: '۷ روز پیش' },
  { id: 9115, title: 'تنظیم بودجه تبلیغات اینستاگرام',       priority: 'medium', done: true, dueDate: '۹ روز پیش' },
  { id: 9116, title: 'تست رگرسیون انتشار جدید',              priority: 'high',   done: true, dueDate: '۹ روز پیش' },
  { id: 9117, title: 'بررسی اپلیکیشن پس از انتشار',          priority: 'high',   done: true, dueDate: '۱۰ روز پیش' },
  { id: 9118, title: 'به‌روزرسانی روال آنبوردینگ پرسنل',     priority: 'medium', done: true, dueDate: '۱۲ روز پیش' },
  { id: 9119, title: 'تهیه گزارش تحلیل رقبا',                priority: 'high',   done: true, dueDate: '۱۲ روز پیش' },
  { id: 9120, title: 'تنظیم قرار جلسه با مشاور مالی',        priority: 'low',    done: true, dueDate: '۱۴ روز پیش' },
  { id: 9121, title: 'بهینه‌سازی کوئری‌های دیتابیس',         priority: 'high',   done: true, dueDate: '۱۴ روز پیش' },
  { id: 9122, title: 'بازبینی متن قرارداد همکاری',           priority: 'medium', done: true, dueDate: '۱۶ روز پیش' },
  { id: 9123, title: 'برگزاری دمو داخلی محصول',              priority: 'medium', done: true, dueDate: '۱۸ روز پیش' },
  { id: 9124, title: 'مهاجرت دیتابیس به نسخه جدید',          priority: 'high',   done: true, dueDate: '۲۰ روز پیش' },
  { id: 9125, title: 'مرور بازخوردهای فصلی پرسنل',           priority: 'medium', done: true, dueDate: '۲۲ روز پیش' },
  { id: 9126, title: 'تماس پیگیری با ۱۰ مشتری برتر',         priority: 'high',   done: true, dueDate: '۲۵ روز پیش' },
  { id: 9127, title: 'تهیه ویدیوی معرفی محصول',              priority: 'medium', done: true, dueDate: '۲۸ روز پیش' },
  { id: 9128, title: 'تنظیم نشست توسعه استراتژی',            priority: 'high',   done: true, dueDate: '۳۰ روز پیش' },
  { id: 9129, title: 'بازنگری ساختار سازمانی',                priority: 'medium', done: true, dueDate: '۴۰ روز پیش' },
  { id: 9130, title: 'تهیه پکیج آموزشی سازمانی',             priority: 'low',    done: true, dueDate: '۴۵ روز پیش' },
  { id: 9131, title: 'مرور قراردادهای فروش فصلی',            priority: 'high',   done: true, dueDate: '۵۰ روز پیش' },
  { id: 9132, title: 'تحلیل KPI کانال‌های فروش',             priority: 'medium', done: true, dueDate: '۶۰ روز پیش' },
  { id: 9133, title: 'بازنگری استراتژی بازاریابی محتوا',     priority: 'high',   done: true, dueDate: '۷۵ روز پیش' },
  { id: 9134, title: 'یادآوری تمدید گواهی SSL',              priority: 'medium', done: true, dueDate: '۹۰ روز پیش' },
  { id: 9135, title: 'مرور بستهٔ مزایای کارکنان',             priority: 'low',    done: true, dueDate: '۱۲۰ روز پیش' },
  { id: 9136, title: 'پیاده‌سازی سیستم اعلان داخلی',          priority: 'medium', done: true, dueDate: '۱۵۰ روز پیش' },
  { id: 9137, title: 'بازبینی فرآیند مالی شعب',              priority: 'high',   done: true, dueDate: '۱۸۰ روز پیش' },
  { id: 9138, title: 'تهیه گزارش سالانه به سهام‌داران',       priority: 'high',   done: true, dueDate: '۲۲۰ روز پیش' },
  { id: 9139, title: 'بازنگری ارزیابی عملکرد سالیانه',        priority: 'medium', done: true, dueDate: '۲۸۰ روز پیش' },
  { id: 9140, title: 'تدوین چشم‌انداز سال جدید',              priority: 'high',   done: true, dueDate: '۳۳۰ روز پیش' },
];

const priColors: Record<string, { color: string; label: string }> = {
  high: { color: '#EF4444', label: 'فوری' },
  medium: { color: '#F59E0B', label: 'متوسط' },
  low: { color: '#10B981', label: 'عادی' },
};

interface Note { id: number; title: string; preview: string; date: string; tag: string; color: string }

const NOTES: Note[] = [
  { id: 1, title: 'ایده‌های پروژه جدید', preview: 'فاز ۱: تحلیل نیازها / فاز ۲: طراحی / فاز ۳: پیاده‌سازی...', date: 'امروز', tag: 'کاری', color: '#3B82F6' },
  { id: 2, title: 'لیست خرید هفتگی', preview: 'شیر، نان، میوه، سبزیجات، گوشت...', date: 'دیروز', tag: 'شخصی', color: '#10B981' },
  { id: 3, title: 'یادداشت جلسه فنی', preview: 'نکات مهم: ۱) بروزرسانی API ۲) رفع باگ فرم...', date: '۲ روز پیش', tag: 'جلسه', color: '#8B5CF6' },
];

const ASST_CHAT_MSGS = [
  { from: 'agent' as const, text: 'سلام! من دستیار شخصی هوشمند شما هستم. چطور می‌تونم کمکتون کنم؟' },
  { from: 'user' as const, text: 'برنامه امروزم چیه؟' },
  { from: 'agent' as const, text: 'امروز ۴ رویداد دارید: جلسه تیم فنی (۹ صبح)، گزارش ماهانه (۱۱)، ناهار (۱۲:۳۰) و بررسی بودجه (۱۴). همچنین ۳ وظیفه فعال دارید.' },
  { from: 'user' as const, text: 'جلسه فردا با مشتری ساعت چنده؟' },
  { from: 'agent' as const, text: 'جلسه با مشتری آلفا فردا ساعت ۱۰ تا ۱۱ صبح. آیا می‌خواین یادآوری تنظیم کنم؟' },
];

function AssistantCalendarTab({ events, setEvents, tasks, setTasks }: { events: CalEvent[]; setEvents: React.Dispatch<React.SetStateAction<CalEvent[]>>; tasks: AsstTask[]; setTasks: React.Dispatch<React.SetStateAction<AsstTask[]>> }) {
  const { showToast } = useApp();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState<string>('امروز');
  const [newType, setNewType] = useState<CalEvent['type']>('reminder');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCalendarHint, setShowCalendarHint] = useState(false);
  useEffect(() => {
    if (!showCalendar) return;
    setShowCalendarHint(true);
    const t = setTimeout(() => setShowCalendarHint(false), 1000);
    return () => clearTimeout(t);
  }, [showCalendar]);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selectedCalDate, setSelectedCalDate] = useState<Date | null>(null);
  const [newTaskDrafts, setNewTaskDrafts] = useState<{ title: string; priority: 'high' | 'medium' | 'low' }[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatUnit, setRepeatUnit] = useState<'day' | 'week' | 'month'>('week');
  const [repeatMaxCount, setRepeatMaxCount] = useState(5);

  const PERSIAN_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const PERSIAN_MONTHS = ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'];

  const getCalendarDays = (monthStart: Date) => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const firstDay = new Date(year, month, 1);
    let startDow = firstDay.getDay();
    startDow = (startDow + 1) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const dateToCategoryLabel = (date: Date): string => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(date); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'امروز';
    if (diff === 1) return 'فردا';
    return 'تا یک ماه آینده';
  };

  const formatSelectedDate = (date: Date): string => {
    return `${toFa(date.getDate())} ${PERSIAN_MONTHS[date.getMonth()]} ${toFa(date.getFullYear())}`;
  };

  const todayEvents = events.filter(e => e.date === 'امروز');
  const tomorrowEvents = events.filter(e => e.date === 'فردا');
  const upToMonthEvents = events.filter(e => e.date === 'تا یک ماه آینده');

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [taskDragId, setTaskDragId] = useState<number | null>(null);

  const toggleTaskDone = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    showToast('وضعیت وظیفه تغییر کرد');
  };

  const reorderTask = (sourceId: number, targetId: number) => {
    if (sourceId === targetId) return;
    setTasks(prev => {
      const source = prev.find(t => t.id === sourceId);
      const target = prev.find(t => t.id === targetId);
      if (!source || !target || source.eventId !== target.eventId) return prev;
      const others = prev.filter(t => t.id !== sourceId);
      const targetIdx = others.findIndex(t => t.id === targetId);
      return [...others.slice(0, targetIdx), source, ...others.slice(targetIdx)];
    });
  };

  const setStatus = (id: number, status: PlanStatus) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    showToast(`وضعیت برنامه: ${planStatusStyles[status].label}`);
  };

  const reorderEvent = (sourceId: number, targetId: number) => {
    if (sourceId === targetId) return;
    setEvents(prev => {
      const source = prev.find(e => e.id === sourceId);
      const target = prev.find(e => e.id === targetId);
      if (!source || !target || source.date !== target.date) return prev;
      const others = prev.filter(e => e.id !== sourceId);
      const targetIdx = others.findIndex(e => e.id === targetId);
      const next = [...others.slice(0, targetIdx), source, ...others.slice(targetIdx)];
      return next;
    });
  };

  const toggleMute = (id: number) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, muted: !e.muted } : e));
    const ev = events.find(e => e.id === id);
    showToast(ev?.muted ? 'اعلان فعال شد' : 'اعلان سایلنت شد');
  };

  const deleteEvent = (id: number) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('رویداد حذف شد');
  };

  const submitNewEvent = () => {
    if (!newTitle.trim()) { showToast('لطفاً عنوان رویداد را وارد کنید'); return; }
    if (!newTime.trim()) { showToast('لطفاً ساعت رویداد را وارد کنید'); return; }
    const newId = Math.max(...events.map(e => e.id), 0) + 1;
    const ev: CalEvent = { id: newId, title: newTitle.trim(), time: newTime.trim(), date: newDate, type: newType, status: 'pending', muted: false };
    setEvents(prev => [...prev, ev]);
    if (newTaskDrafts.length > 0) {
      const baseId = Math.max(...tasks.map(t => t.id), 0) + 1;
      const newTasks: AsstTask[] = newTaskDrafts.map((d, idx) => ({
        id: baseId + idx, title: d.title, priority: d.priority, done: false, dueDate: newDate, eventId: newId,
      }));
      setTasks(prev => [...prev, ...newTasks]);
    }
    setNewTitle(''); setNewTime(''); setNewDate('امروز'); setNewType('reminder'); setShowCalendar(false); setSelectedCalDate(null); setAutoRepeat(false); setRepeatInterval(1); setRepeatUnit('week'); setRepeatMaxCount(5);
    setNewTaskDrafts([]); setNewTaskInput(''); setNewTaskPriority('medium');
    setShowNewForm(false);
    showToast('رویداد جدید اضافه شد');
  };

  const dateOptions = [
    { value: 'امروز', label: 'امروز' },
    { value: 'فردا', label: 'فردا' },
  ];

  const typeOptions: { value: CalEvent['type']; label: string; icon: string; color: string }[] = [
    { value: 'reminder', label: 'یادآور', icon: 'fa-solid fa-bell', color: '#F59E0B' },
    { value: 'personal', label: 'شخصی', icon: 'fa-solid fa-heart', color: '#10B981' },
    { value: 'work', label: 'کاری', icon: 'fa-solid fa-briefcase', color: '#8B5CF6' },
  ];

  const renderStatusActions = (ev: CalEvent) => {
    const btn = (label: string, icon: string, color: string, target: PlanStatus) => (
      <button
        key={target}
        className="flex-1 py-2 px-2.5 rounded-lg border-none text-white text-[11px] cursor-pointer flex items-center justify-center gap-1.5 transition-all"
        style={{ background: color, fontWeight: 600 }}
        onClick={e => { e.stopPropagation(); setStatus(ev.id, target); }}
      >
        <i className={`${icon} text-[10px]`} /> {label}
      </button>
    );
    if (ev.status === 'pending') return <>{btn('شروع', 'fa-solid fa-play', '#F59E0B', 'inprogress')}{btn('لغو', 'fa-solid fa-ban', '#EF4444', 'cancelled')}</>;
    if (ev.status === 'inprogress') return <>{btn('انجام شد', 'fa-solid fa-check', '#10B981', 'done')}{btn('لغو', 'fa-solid fa-ban', '#EF4444', 'cancelled')}</>;
    if (ev.status === 'done') return <>{btn('بازگردانی به معلق', 'fa-solid fa-rotate-left', '#6366f1', 'pending')}</>;
    return <>{btn('بازگردانی به معلق', 'fa-solid fa-rotate-left', '#6366f1', 'pending')}</>;
  };

  const renderGroup = (title: string, icon: string, iconColor: string, items: CalEvent[], delayOffset: number) => (
    <>
      <div className="text-[12px] text-[var(--aw-text-muted)] mb-2 px-1 flex items-center gap-1" style={{ fontWeight: 700 }}>
        <i className={`${icon}`} style={{ color: iconColor }} /> {title}
        <span className="mr-auto text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: `${iconColor}15`, color: iconColor, fontWeight: 700 }}>{toFa(items.length)}</span>
      </div>
      {items.map((ev, i) => {
        const ct = calTypeColors[ev.type];
        const ss = planStatusStyles[ev.status];
        const isExpanded = expandedId === ev.id;
        return (
          <motion.div key={ev.id}
            className={`group mb-2 cursor-pointer rounded-2xl border transition-all ${dragId === ev.id ? 'opacity-50' : ''}`}
            style={{ background: ss.bg, borderColor: ss.border }}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + delayOffset }}
            onClick={() => setExpandedId(isExpanded ? null : ev.id)}
            draggable
            onDragStart={() => setDragId(ev.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={e => { e.preventDefault(); }}
            onDrop={e => { e.preventDefault(); if (dragId !== null) { reorderEvent(dragId, ev.id); setDragId(null); } }}
          >
            <div className="flex items-center gap-2.5 p-3">
              <div
                className="w-6 h-9 flex items-center justify-center text-[var(--aw-text-muted)] cursor-grab active:cursor-grabbing flex-shrink-0"
                onClick={e => e.stopPropagation()}
                title="جابه‌جایی"
              >
                <i className="fa-solid fa-grip-vertical text-[12px]" />
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ct.color}15` }}>
                <i className={`${ct.icon} text-[14px]`} style={{ color: ct.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] ${ev.status === 'done' ? 'line-through text-[var(--aw-text-muted)]' : 'text-[var(--aw-text-primary)]'}`} style={{ fontWeight: 600 }}>{ev.title}</div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-regular fa-clock text-[8px] ml-1" />{ev.time}</span>
                  <StatusPill label={ct.label} color={ct.color} />
                  <span className="text-[9.5px] px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ background: ss.pillBg, color: ss.pillText, fontWeight: 700 }}>
                    <i className={`${ss.icon} text-[8px]`} />{ss.label}
                  </span>
                </div>
              </div>
              <button
                className={`w-7 h-7 rounded-lg border-none bg-transparent text-[11px] cursor-pointer flex items-center justify-center transition-all ${ev.muted ? 'text-amber-400 hover:bg-amber-500/10' : 'text-[var(--aw-text-muted)] hover:text-amber-400 hover:bg-amber-500/10'}`}
                onClick={e => { e.stopPropagation(); toggleMute(ev.id); }}
                title={ev.muted ? 'فعال‌سازی اعلان' : 'سایلنت'}
              >
                <i className={ev.muted ? 'fa-solid fa-bell-slash' : 'fa-solid fa-bell'} />
              </button>
              <button
                className="w-7 h-7 rounded-lg border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer flex items-center justify-center hover:text-red-400 hover:bg-red-500/10"
                onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                title="حذف"
              >
                <i className="fa-solid fa-trash" />
              </button>
              <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] text-[var(--aw-text-muted)]`} />
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-0 border-t" style={{ borderColor: ss.border }} onClick={e => e.stopPropagation()}>
                    <div className="text-[11px] text-[var(--aw-text-secondary)] leading-6 mt-2.5 mb-3">
                      {ev.description || 'توضیحاتی برای این برنامه ثبت نشده است.'}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--aw-text-muted)] mb-3">
                      <div className="flex items-center gap-1.5"><i className="fa-regular fa-calendar text-[9px]" />{ev.date}</div>
                      <div className="flex items-center gap-1.5"><i className="fa-regular fa-clock text-[9px]" />{ev.time}</div>
                    </div>

                    {/* Tasks for this plan */}
                    {(() => {
                      const planTasks = tasks.filter(t => t.eventId === ev.id);
                      return (
                        <div className="mb-3">
                          <div className="text-[10.5px] text-[var(--aw-text-muted)] mb-1.5 px-0.5 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                            <i className="fa-solid fa-list-check text-[10px]" />
                            وظایف برنامه ({toFa(planTasks.length)})
                          </div>
                          {planTasks.length === 0 ? (
                            <div className="text-[10.5px] text-[var(--aw-text-muted)] px-3 py-2 rounded-xl border border-dashed border-[var(--aw-border)]">
                              وظیفه‌ای برای این برنامه ثبت نشده است.
                            </div>
                          ) : planTasks.map(task => {
                            const pr = priColors[task.priority];
                            return (
                              <div key={task.id}
                                className={`flex items-center gap-2 px-2.5 py-2 mb-1.5 rounded-xl border border-[var(--aw-border)] cursor-pointer ${taskDragId === task.id ? 'opacity-50' : ''}`}
                                style={{ background: 'var(--aw-bg-input)' }}
                                onClick={() => toggleTaskDone(task.id)}
                                draggable
                                onDragStart={e => { e.stopPropagation(); setTaskDragId(task.id); }}
                                onDragEnd={() => setTaskDragId(null)}
                                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={e => { e.preventDefault(); e.stopPropagation(); if (taskDragId !== null) { reorderTask(taskDragId, task.id); setTaskDragId(null); } }}
                              >
                                <div className="w-4 h-6 flex items-center justify-center text-[var(--aw-text-muted)] cursor-grab active:cursor-grabbing flex-shrink-0"
                                  onClick={e => e.stopPropagation()} title="جابه‌جایی">
                                  <i className="fa-solid fa-grip-vertical text-[10px]" />
                                </div>
                                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                                  style={{ borderColor: task.done ? '#10B981' : 'var(--aw-border)', background: task.done ? 'rgba(16,185,129,0.15)' : 'transparent' }}>
                                  {task.done && <i className="fa-solid fa-check text-[8px] text-[#10B981]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-[11.5px] truncate ${task.done ? 'line-through text-[var(--aw-text-muted)]' : 'text-[var(--aw-text-primary)]'}`} style={{ fontWeight: 600 }}>{task.title}</div>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: `${pr.color}18`, color: pr.color, fontWeight: 700 }}>{pr.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <div className="flex gap-2">{renderStatusActions(ev)}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      <AnimatePresence>
        {showCalendarHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] shadow-lg"
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              background: '#6366f1', color: '#fff', fontWeight: 600, zIndex: 9999,
              boxShadow: '0 10px 30px rgba(99,102,241,0.4)',
            }}
          >
            <i className="fa-solid fa-circle-info text-[12px]" />
            شما می‌توانید چند تاریخ انتخاب کنید
          </motion.div>
        )}
      </AnimatePresence>
      {/* New event button / form */}
      <AnimatePresence mode="wait">
        {showNewForm ? (
          <motion.div key="new-form" className="p-3.5 mb-4 rounded-2xl border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                <i className="fa-solid fa-plus text-[13px]" style={{ color: '#6366f1' }} />
              </div>
              <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>ایجاد برنامه جدید</span>
            </div>

            <input
              className="w-full rounded-xl border border-[var(--aw-border)] px-3 py-2.5 text-[12px] text-[var(--aw-text-primary)] outline-none mb-2.5 placeholder:text-[var(--aw-text-muted)]"
              style={{ background: 'var(--aw-bg-input)' }}
              placeholder="عنوان رویداد..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-[var(--aw-border)] px-3 py-2.5 text-[12px] text-[var(--aw-text-primary)] outline-none mb-2.5 placeholder:text-[var(--aw-text-muted)]"
              style={{ background: 'var(--aw-bg-input)' }}
              placeholder="ساعت (مثلاً ۱۰:۰۰ - ۱۱:۳۰)"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
            />

            <div className="mb-2.5">
              <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5 px-0.5" style={{ fontWeight: 600 }}>زمان‌بندی</div>
              <div className="flex gap-1.5 flex-wrap">
                {dateOptions.map(d => (
                  <button key={d.value}
                    className={`py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer transition-all ${
                      newDate === d.value && !showCalendar ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
                    }`}
                    style={newDate === d.value && !showCalendar ? { background: '#6366f1', fontWeight: 600 } : { fontWeight: 500 }}
                    onClick={() => { setNewDate(d.value); setShowCalendar(false); setSelectedCalDate(null); }}
                  >
                    {d.label}
                  </button>
                ))}
                <button
                  className={`py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer transition-all flex items-center gap-1 ${
                    showCalendar ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
                  }`}
                  style={showCalendar ? { background: '#6366f1', fontWeight: 600 } : { fontWeight: 500 }}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <i className="fa-solid fa-calendar-days text-[9px]" />
                  {selectedCalDate ? formatSelectedDate(selectedCalDate) : 'انتخاب تاریخ'}
                </button>

                <button
                  type="button"
                  onClick={() => setAutoRepeat(v => !v)}
                  className="py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer transition-all flex items-center gap-2"
                  style={autoRepeat
                    ? { background: '#10B981', borderColor: 'transparent', color: '#fff', fontWeight: 600 }
                    : { background: 'transparent', borderColor: 'var(--aw-border)', color: 'var(--aw-text-secondary)', fontWeight: 500 }}
                >
                  <i className="fa-solid fa-repeat text-[9px]" />
                  تکرار خودکار
                  <span className="relative inline-block w-7 h-3.5 rounded-full transition-colors" style={{ background: autoRepeat ? 'rgba(255,255,255,0.45)' : 'var(--aw-border)' }}>
                    <span className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all" style={{ right: autoRepeat ? 2 : 14 }} />
                  </span>
                </button>
              </div>

              <AnimatePresence>
                {autoRepeat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-2 rounded-xl border border-[var(--aw-border)] overflow-hidden"
                    style={{ background: 'var(--aw-bg-input)' }}
                  >
                    <div className="p-2.5 space-y-2.5">
                      <div>
                        <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5 px-0.5" style={{ fontWeight: 600 }}>مدت زمان تکرار</div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] text-[var(--aw-text-muted)]">هر</span>
                          <input
                            type="number" min={1} max={99}
                            value={repeatInterval}
                            onChange={e => setRepeatInterval(Math.max(1, parseInt(e.target.value || '1', 10)))}
                            className="w-14 rounded-lg border border-[var(--aw-border)] px-2 py-1 text-[11px] text-center outline-none"
                            style={{ background: 'var(--aw-bg-card)' }}
                          />
                          <div className="flex gap-1">
                            {([['day','روز'],['week','هفته'],['month','ماه']] as const).map(([u, lbl]) => {
                              const active = repeatUnit === u;
                              return (
                                <button key={u} type="button" onClick={() => setRepeatUnit(u)}
                                  className="py-1 px-2.5 rounded-md border text-[10.5px] cursor-pointer"
                                  style={active
                                    ? { background: '#6366f1', borderColor: 'transparent', color: '#fff', fontWeight: 700 }
                                    : { background: 'transparent', borderColor: 'var(--aw-border)', color: 'var(--aw-text-secondary)', fontWeight: 500 }}>
                                  {lbl}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5 px-0.5" style={{ fontWeight: 600 }}>حداکثر تعداد تکرار</div>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => setRepeatMaxCount(c => Math.max(1, c - 1))}
                            className="w-7 h-7 rounded-lg border border-[var(--aw-border)] cursor-pointer text-[var(--aw-text-secondary)]"
                            style={{ background: 'var(--aw-bg-card)' }}>−</button>
                          <input
                            type="number" min={1} max={365}
                            value={repeatMaxCount}
                            onChange={e => setRepeatMaxCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
                            className="w-16 rounded-lg border border-[var(--aw-border)] px-2 py-1 text-[11px] text-center outline-none"
                            style={{ background: 'var(--aw-bg-card)' }}
                          />
                          <button type="button" onClick={() => setRepeatMaxCount(c => Math.min(365, c + 1))}
                            className="w-7 h-7 rounded-lg border border-[var(--aw-border)] cursor-pointer text-[var(--aw-text-secondary)]"
                            style={{ background: 'var(--aw-bg-card)' }}>+</button>
                          <span className="text-[10.5px] text-[var(--aw-text-muted)]">بار</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1 pt-1 border-t border-[var(--aw-border)]" style={{ paddingTop: 8 }}>
                        <i className="fa-solid fa-circle-info text-[#6366f1]" />
                        این رویداد {toFa(repeatMaxCount)} بار، هر {toFa(repeatInterval)} {repeatUnit === 'day' ? 'روز' : repeatUnit === 'week' ? 'هفته' : 'ماه'} یک‌بار تکرار می‌شود.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline Calendar */}
              <AnimatePresence>
                {showCalendar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-2 rounded-xl border border-[var(--aw-border)] overflow-hidden"
                    style={{ background: 'var(--aw-bg-input)' }}
                  >
                    <div className="p-2.5">
                      {/* Month navigation */}
                      <div className="flex items-center justify-between mb-2">
                        <button
                          className="w-7 h-7 rounded-lg border-none bg-transparent text-[var(--aw-text-secondary)] cursor-pointer hover:bg-[var(--aw-bg-card-hover)] flex items-center justify-center transition-colors"
                          onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                        >
                          <i className="fa-solid fa-chevron-right text-[10px]" />
                        </button>
                        <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>
                          {PERSIAN_MONTHS[calMonth.getMonth()]} {toFa(calMonth.getFullYear())}
                        </span>
                        <button
                          className="w-7 h-7 rounded-lg border-none bg-transparent text-[var(--aw-text-secondary)] cursor-pointer hover:bg-[var(--aw-bg-card-hover)] flex items-center justify-center transition-colors"
                          onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                        >
                          <i className="fa-solid fa-chevron-left text-[10px]" />
                        </button>
                      </div>
                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {PERSIAN_WEEKDAYS.map(wd => (
                          <div key={wd} className="text-center text-[9px] text-[var(--aw-text-muted)] py-0.5" style={{ fontWeight: 600 }}>{wd}</div>
                        ))}
                      </div>
                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {getCalendarDays(calMonth).map((day, idx) => {
                          if (day === null) return <div key={`empty-${idx}`} />;
                          const cellDate = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
                          const todayNow = new Date(); todayNow.setHours(0,0,0,0);
                          const isToday = cellDate.getTime() === todayNow.getTime();
                          const isPast = cellDate < todayNow;
                          const isSelected = selectedCalDate && cellDate.getTime() === selectedCalDate.getTime();
                          return (
                            <button
                              key={`day-${day}`}
                              disabled={isPast && !isToday}
                              className={`w-full aspect-square rounded-lg border-none text-[11px] cursor-pointer flex items-center justify-center transition-all ${
                                isSelected ? 'text-white' : isToday ? 'text-[#6366f1]' : isPast ? 'text-[var(--aw-text-muted)] opacity-40 cursor-not-allowed' : 'text-[var(--aw-text-secondary)] hover:bg-[var(--aw-bg-card-hover)]'
                              }`}
                              style={{
                                background: isSelected ? '#6366f1' : isToday && !isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                                fontWeight: isToday || isSelected ? 700 : 500,
                              }}
                              onClick={() => {
                                if (isPast && !isToday) return;
                                setSelectedCalDate(cellDate);
                                setNewDate(dateToCategoryLabel(cellDate));
                              }}
                            >
                              {toFa(day)}
                            </button>
                          );
                        })}
                      </div>
                      {/* Selected date label */}
                      {selectedCalDate && (
                        <div className="mt-2 text-center text-[10px] text-[var(--aw-text-muted)]">
                          <i className="fa-solid fa-check-circle text-[#6366f1] ml-1 text-[9px]" />
                          {formatSelectedDate(selectedCalDate)} — <span style={{ color: '#6366f1', fontWeight: 600 }}>{newDate}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mb-3">
              <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5 px-0.5" style={{ fontWeight: 600 }}>نوع رویداد</div>
              <div className="flex gap-1.5 flex-wrap">
                {typeOptions.map(t => (
                  <button key={t.value}
                    className={`py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer transition-all flex items-center gap-1.5 ${
                      newType === t.value ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
                    }`}
                    style={newType === t.value ? { background: t.color, fontWeight: 600 } : { fontWeight: 500 }}
                    onClick={() => setNewType(t.value)}
                  >
                    <i className={`${t.icon} text-[9px]`} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks list */}
            <div className="mb-3">
              <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5 px-0.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                <i className="fa-solid fa-list-check text-[9px]" />
                وظایف برنامه ({toFa(newTaskDrafts.length)})
              </div>

              {newTaskDrafts.length > 0 && (
                <div className="mb-2">
                  {newTaskDrafts.map((d, idx) => {
                    const pr = priColors[d.priority];
                    return (
                      <div key={idx} className="flex items-center gap-2 px-2.5 py-2 mb-1.5 rounded-xl border border-[var(--aw-border)]"
                        style={{ background: 'var(--aw-bg-input)' }}>
                        <i className="fa-solid fa-circle text-[6px]" style={{ color: pr.color }} />
                        <span className="flex-1 text-[11.5px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: 600 }}>{d.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: `${pr.color}18`, color: pr.color, fontWeight: 700 }}>{pr.label}</span>
                        <button
                          className="w-6 h-6 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] cursor-pointer hover:text-red-400 flex items-center justify-center"
                          onClick={() => setNewTaskDrafts(prev => prev.filter((_, i) => i !== idx))}
                          title="حذف"
                        >
                          <i className="fa-solid fa-times text-[11px]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-1.5">
                <input
                  className="flex-1 rounded-xl border border-[var(--aw-border)] px-3 py-2 text-[11.5px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
                  style={{ background: 'var(--aw-bg-input)' }}
                  placeholder="افزودن وظیفه..."
                  value={newTaskInput}
                  onChange={e => setNewTaskInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTaskInput.trim()) {
                      e.preventDefault();
                      setNewTaskDrafts(prev => [...prev, { title: newTaskInput.trim(), priority: newTaskPriority }]);
                      setNewTaskInput('');
                    }
                  }}
                />
                <button
                  className="px-3 rounded-xl border border-[var(--aw-border)] bg-transparent text-[11px] cursor-pointer flex items-center gap-1"
                  style={{ color: priColors[newTaskPriority].color, fontWeight: 600 }}
                  onClick={() => {
                    const order: ('medium' | 'high' | 'low')[] = ['medium', 'high', 'low'];
                    const next = order[(order.indexOf(newTaskPriority) + 1) % order.length];
                    setNewTaskPriority(next);
                  }}
                  title="تغییر اولویت"
                >
                  <i className="fa-solid fa-flag text-[9px]" />
                  {priColors[newTaskPriority].label}
                </button>
                <button
                  className="px-3 rounded-xl border-none text-white text-[11px] cursor-pointer flex items-center justify-center"
                  style={{ background: '#6366f1', fontWeight: 600 }}
                  onClick={() => {
                    if (!newTaskInput.trim()) return;
                    setNewTaskDrafts(prev => [...prev, { title: newTaskInput.trim(), priority: newTaskPriority }]);
                    setNewTaskInput('');
                  }}
                  title="افزودن"
                >
                  <i className="fa-solid fa-plus text-[10px]" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 rounded-xl border-none text-white text-[12px] cursor-pointer flex items-center justify-center gap-1.5"
                style={{ background: '#6366f1', fontWeight: 600 }}
                onClick={submitNewEvent}
              >
                <i className="fa-solid fa-check text-[10px]" /> ذخیره رویداد
              </button>
              <button
                className="py-2.5 px-4 rounded-xl border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-muted)] text-[12px] cursor-pointer"
                style={{ fontWeight: 500 }}
                onClick={() => { setShowNewForm(false); setNewTitle(''); setNewTime(''); setShowCalendar(false); setSelectedCalDate(null); setNewTaskDrafts([]); setNewTaskInput(''); }}
              >
                انصراف
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button key="new-btn"
            className="w-full flex items-center justify-center gap-2 p-3 mb-4 rounded-xl border border-dashed cursor-pointer text-[12px] transition-all hover:border-[#6366f1] hover:bg-[rgba(99,102,241,0.06)]"
            style={{ borderColor: '#6366f1', background: 'transparent', color: '#6366f1', fontWeight: 600 }}
            onClick={() => setShowNewForm(true)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <i className="fa-solid fa-plus" /> ایجاد برنامه جدید
          </motion.button>
        )}
      </AnimatePresence>

      {renderGroup('امروز', 'fa-solid fa-sun', '#F59E0B', todayEvents, 0)}
      <div className="mt-4" />
      {renderGroup('فردا', 'fa-solid fa-moon', '#8B5CF6', tomorrowEvents, 0.2)}
      {upToMonthEvents.length > 0 && (<><div className="mt-4" />{renderGroup('تا یک ماه آینده', 'fa-solid fa-calendar', '#3B82F6', upToMonthEvents, 0.4)}</>)}
    </div>
  );
}

function AssistantTodoTab({ tasks, setTasks, events }: { tasks: AsstTask[]; setTasks: React.Dispatch<React.SetStateAction<AsstTask[]>>; events: CalEvent[] }) {
  const { showToast } = useApp();
  const [dragId, setDragId] = useState<number | null>(null);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    showToast('وضعیت وظیفه تغییر کرد');
  };

  const reorderTask = (sourceId: number, targetId: number) => {
    if (sourceId === targetId) return;
    setTasks(prev => {
      const source = prev.find(t => t.id === sourceId);
      const target = prev.find(t => t.id === targetId);
      if (!source || !target || source.eventId !== target.eventId) return prev;
      const others = prev.filter(t => t.id !== sourceId);
      const targetIdx = others.findIndex(t => t.id === targetId);
      return [...others.slice(0, targetIdx), source, ...others.slice(targetIdx)];
    });
  };

  const inProgressEvents = events.filter(e => e.status === 'inprogress');
  const groups = inProgressEvents.map(ev => ({ ev, items: tasks.filter(t => t.eventId === ev.id) }));
  const orphanTasks = tasks.filter(t => !t.eventId || !inProgressEvents.some(ev => ev.id === t.eventId));

  const doneCount = tasks.filter(t => t.done).length;

  const renderTaskRow = (task: AsstTask, i: number) => {
    const pr = priColors[task.priority];
    return (
      <motion.div key={task.id}
        className={`flex items-center gap-2.5 p-3 mb-2 cursor-pointer ${dragId === task.id ? 'opacity-50' : ''}`}
        style={euCardStyle}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
        onClick={() => toggleTask(task.id)}
        draggable
        onDragStart={() => setDragId(task.id)}
        onDragEnd={() => setDragId(null)}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (dragId !== null) { reorderTask(dragId, task.id); setDragId(null); } }}
      >
        <div className="w-5 h-7 flex items-center justify-center text-[var(--aw-text-muted)] cursor-grab active:cursor-grabbing flex-shrink-0"
          onClick={e => e.stopPropagation()} title="جابه‌جایی">
          <i className="fa-solid fa-grip-vertical text-[11px]" />
        </div>
        <div className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all"
          style={{ borderColor: task.done ? '#10B981' : 'var(--aw-border)', background: task.done ? 'rgba(16,185,129,0.15)' : 'transparent' }}>
          {task.done && <i className="fa-solid fa-check text-[10px] text-[#10B981]" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] ${task.done ? 'line-through text-[var(--aw-text-muted)]' : 'text-[var(--aw-text-primary)]'}`} style={{ fontWeight: 600 }}>{task.title}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusPill label={pr.label} color={pr.color} />
            <span className="text-[9px] text-[var(--aw-text-muted)]"><i className="fa-regular fa-clock text-[8px] ml-0.5" />{task.dueDate}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      {/* Progress summary */}
      <div className="p-3 mb-3 flex items-center gap-3" style={euCardStyle}>
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(126,95,170,0.15)" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--aw-eu-primary)" strokeWidth="3"
              strokeDasharray={`${(doneCount / Math.max(tasks.length, 1)) * 100}, 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>
            {toFa(Math.round((doneCount / Math.max(tasks.length, 1)) * 100))}%
          </span>
        </div>
        <div>
          <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{toFa(doneCount)} از {toFa(tasks.length)} انجام شده</div>
          <div className="text-[10px] text-[var(--aw-text-muted)]">{toFa(tasks.length - doneCount)} وظیفه باقی‌مانده</div>
        </div>
      </div>

      {groups.length === 0 && orphanTasks.length === 0 && (
        <div className="p-6 text-center rounded-2xl border border-dashed border-[var(--aw-border)]">
          <i className="fa-solid fa-list-check text-[22px] text-[var(--aw-text-muted)] mb-2 block" />
          <div className="text-[12px] text-[var(--aw-text-muted)]">وظیفه‌ای برای برنامه‌های در حال انجام ثبت نشده است.</div>
        </div>
      )}

      {groups.map(({ ev, items }) => {
        const ct = calTypeColors[ev.type];
        return (
          <div key={`grp-${ev.id}`} className="mb-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ct.color}15` }}>
                <i className={`${ct.icon} text-[11px]`} style={{ color: ct.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: 700 }}>{ev.title}</div>
                <div className="text-[9.5px] text-[var(--aw-text-muted)]">{ev.date} · {ev.time}</div>
              </div>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-md flex items-center gap-1"
                style={{ background: planStatusStyles.inprogress.pillBg, color: planStatusStyles.inprogress.pillText, fontWeight: 700 }}>
                <i className={`${planStatusStyles.inprogress.icon} text-[8px]`} />{toFa(items.length)} وظیفه
              </span>
            </div>
            {items.length === 0 ? (
              <div className="text-[10.5px] text-[var(--aw-text-muted)] px-3 py-2.5 rounded-xl border border-dashed border-[var(--aw-border)] mb-2">
                وظیفه‌ای برای این برنامه ثبت نشده است.
              </div>
            ) : items.map((t, i) => renderTaskRow(t, i))}
          </div>
        );
      })}

      {orphanTasks.length > 0 && (
        <div className="mb-3">
          <div className="text-[12px] text-[var(--aw-text-muted)] mb-2 px-1 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
            <i className="fa-solid fa-inbox text-[10px]" /> سایر وظایف
          </div>
          {orphanTasks.map((t, i) => renderTaskRow(t, i))}
        </div>
      )}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim();
  const parts: React.ReactNode[] = [];
  let i = 0;
  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  while (i < text.length) {
    const idx = lowerText.indexOf(lowerQ, i);
    if (idx === -1) { parts.push(text.slice(i)); break; }
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark key={idx} style={{ background: 'rgba(99,102,241,0.30)', color: '#fff', padding: '0 2px', borderRadius: 3, fontWeight: 700 }}>
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    i = idx + q.length;
  }
  return <>{parts}</>;
}

function AssistantSearchTab() {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const q = search.trim();
  const has = (s: string | undefined) => !!s && q !== '' && s.toLowerCase().includes(q.toLowerCase());

  const matchedOrders = q ? DINE_ORDERS.filter(o =>
    has(o.num) || has(o.items) || has(o.restaurant) || has(o.date) || has(o.total) || has(o.status) || has(o.eta)
  ) : [];
  const matchedEvents = q ? INITIAL_CAL_EVENTS.filter(e =>
    has(e.title) || has(e.time) || has(e.date) || has(e.type) || has(e.status) || has(e.description)
  ) : [];
  const matchedTasks = q ? INITIAL_TASKS.filter(t =>
    has(t.title) || has(t.priority) || has(t.dueDate)
  ) : [];

  const totalMatches = matchedOrders.length + matchedEvents.length + matchedTasks.length;

  const orderStatusLabel: Record<DineOrder['status'], { label: string; color: string }> = {
    preparing:  { label: 'در حال آماده‌سازی', color: '#F59E0B' },
    delivering: { label: 'در حال ارسال',     color: '#3B82F6' },
    delivered:  { label: 'تحویل شده',         color: '#10B981' },
    cancelled:  { label: 'لغو شده',           color: '#EF4444' },
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)] mb-3" style={{ background: 'var(--aw-bg-input)' }}>
        <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
        <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
          placeholder="جستجو در سفارشات، برنامه‌ها و وظایف..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer" onClick={() => setSearch('')}><i className="fa-solid fa-times text-sm" /></button>}
      </div>

      {q && (
        <div className="text-[10.5px] text-[var(--aw-text-muted)] mb-3 px-1">
          {totalMatches > 0 ? <><i className="fa-solid fa-circle-check text-[#10B981] ml-1 text-[9px]" />{toFa(totalMatches)} نتیجه برای «{q}»</> : <><i className="fa-solid fa-circle-info ml-1 text-[9px]" />نتیجه‌ای برای «{q}» یافت نشد</>}
        </div>
      )}

      {/* Orders results */}
      {matchedOrders.length > 0 && (
        <div className="mb-4">
          <SectionTitle icon="fa-solid fa-bag-shopping" title={`سفارشات (${toFa(matchedOrders.length)})`} />
          {matchedOrders.map((o, i) => {
            const st = orderStatusLabel[o.status];
            return (
              <motion.div key={o.id} className="p-3 mb-2" style={euCardStyle}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12.5px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>
                    سفارش #<Highlight text={o.num} query={q} />
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: `${st.color}18`, color: st.color, fontWeight: 700 }}>{st.label}</span>
                </div>
                <div className="text-[11.5px] text-[var(--aw-text-secondary)] mb-0.5"><Highlight text={o.items} query={q} /></div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--aw-text-muted)] flex-wrap">
                  <span><i className="fa-solid fa-store text-[8px] ml-1" /><Highlight text={o.restaurant} query={q} /></span>
                  <span><i className="fa-regular fa-clock text-[8px] ml-1" /><Highlight text={o.date} query={q} /></span>
                  <span><i className="fa-solid fa-coins text-[8px] ml-1" /><Highlight text={o.total} query={q} /> تومان</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Plans results */}
      {matchedEvents.length > 0 && (
        <div className="mb-4">
          <SectionTitle icon="fa-solid fa-calendar-days" title={`برنامه‌ها (${toFa(matchedEvents.length)})`} />
          {matchedEvents.map((e, i) => {
            const ct = calTypeColors[e.type];
            const ss = planStatusStyles[e.status];
            return (
              <motion.div key={e.id} className="p-3 mb-2 rounded-2xl border"
                style={{ background: ss.bg, borderColor: ss.border }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${ct.color}15` }}>
                    <i className={`${ct.icon} text-[11px]`} style={{ color: ct.color }} />
                  </div>
                  <span className="flex-1 text-[12.5px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: 700 }}>
                    <Highlight text={e.title} query={q} />
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ background: ss.pillBg, color: ss.pillText, fontWeight: 700 }}>
                    <i className={`${ss.icon} text-[8px]`} />{ss.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--aw-text-muted)] flex-wrap mb-1">
                  <span><i className="fa-regular fa-calendar text-[8px] ml-1" /><Highlight text={e.date} query={q} /></span>
                  <span><i className="fa-regular fa-clock text-[8px] ml-1" /><Highlight text={e.time} query={q} /></span>
                  <StatusPill label={ct.label} color={ct.color} />
                </div>
                {e.description && (
                  <div className="text-[10.5px] text-[var(--aw-text-secondary)] leading-5">
                    <Highlight text={e.description} query={q} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tasks results */}
      {matchedTasks.length > 0 && (
        <div className="mb-4">
          <SectionTitle icon="fa-solid fa-list-check" title={`وظایف (${toFa(matchedTasks.length)})`} />
          {matchedTasks.map((t, i) => {
            const pr = priColors[t.priority];
            const parent = t.eventId ? INITIAL_CAL_EVENTS.find(e => e.id === t.eventId) : undefined;
            return (
              <motion.div key={t.id} className="p-3 mb-2" style={euCardStyle}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: t.done ? '#10B981' : 'var(--aw-border)', background: t.done ? 'rgba(16,185,129,0.15)' : 'transparent' }}>
                    {t.done && <i className="fa-solid fa-check text-[8px] text-[#10B981]" />}
                  </div>
                  <span className={`flex-1 text-[12.5px] truncate ${t.done ? 'line-through text-[var(--aw-text-muted)]' : 'text-[var(--aw-text-primary)]'}`} style={{ fontWeight: 600 }}>
                    <Highlight text={t.title} query={q} />
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: `${pr.color}18`, color: pr.color, fontWeight: 700 }}>{pr.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--aw-text-muted)] flex-wrap">
                  <span><i className="fa-regular fa-clock text-[8px] ml-1" /><Highlight text={t.dueDate} query={q} /></span>
                  {parent && (
                    <span><i className="fa-solid fa-link text-[8px] ml-1" />{parent.title}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!q && (
        <>
          <SectionTitle icon="fa-solid fa-bolt" title="دستورات سریع" />
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { icon: 'fa-solid fa-plus', label: 'وظیفه جدید', color: '#3B82F6' },
              { icon: 'fa-solid fa-bell', label: 'یادآور جدید', color: '#F59E0B' },
              { icon: 'fa-solid fa-sticky-note', label: 'یادداشت جدید', color: '#10B981' },
              { icon: 'fa-solid fa-calendar-plus', label: 'رویداد جدید', color: '#8B5CF6' },
            ].map((cmd, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl cursor-pointer hover:opacity-80 transition-all" style={euCardStyle}
                onClick={() => showToast(`${cmd.label} باز شد`)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cmd.color}15` }}>
                  <i className={`${cmd.icon} text-[12px]`} style={{ color: cmd.color }} />
                </div>
                <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{cmd.label}</span>
              </div>
            ))}
          </div>

          <SectionTitle icon="fa-solid fa-sticky-note" title="یادداشت‌های اخیر" />
          {NOTES.map((n, i) => (
            <motion.div key={n.id} className="p-3 mb-2" style={euCardStyle}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{n.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: `${n.color}15`, color: n.color }}>{n.tag}</span>
              </div>
              <div className="text-[11px] text-[var(--aw-text-secondary)] truncate">{n.preview}</div>
              <div className="text-[9px] text-[var(--aw-text-muted)] mt-1"><i className="fa-regular fa-clock text-[8px] ml-0.5" />{n.date}</div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

type ReportRange = 'day' | 'week' | 'month' | 'year';
type ReportPeriod = 'hour' | 'day' | 'week' | 'month';

const RANGE_OPTIONS: { id: ReportRange; label: string; days: number }[] = [
  { id: 'day',   label: 'یک روزه',  days: 1 },
  { id: 'week',  label: 'یک هفته',  days: 7 },
  { id: 'month', label: 'یک ماهه',  days: 30 },
  { id: 'year',  label: 'یک ساله',  days: 365 },
];

const PERIOD_OPTIONS: { id: ReportPeriod; label: string }[] = [
  { id: 'hour',  label: 'ساعتی' },
  { id: 'day',   label: 'روزانه' },
  { id: 'week',  label: 'هفتگی' },
  { id: 'month', label: 'ماهانه' },
];

const PRIORITY_WEIGHT: Record<AsstTask['priority'], number> = { high: 3, medium: 2, low: 1 };

interface SyntheticDoneRecord { type: 'task' | 'plan' | 'order'; title: string; date: Date; weight: number; meta: string }

function generateSyntheticHistory(tasks: AsstTask[], events: CalEvent[]): SyntheticDoneRecord[] {
  const now = new Date();
  const records: SyntheticDoneRecord[] = [];
  const seedRandom = (s: number) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };

  // Build a deterministic year of synthetic completions distributed over past 365 days.
  // Tasks
  tasks.forEach((t, i) => {
    const base = t.done ? 8 : 2;
    for (let k = 0; k < base; k++) {
      const daysAgo = Math.floor(seedRandom(i * 31 + k * 7) * 365);
      const d = new Date(now); d.setDate(now.getDate() - daysAgo); d.setHours(Math.floor(seedRandom(i + k) * 24));
      records.push({ type: 'task', title: t.title, date: d, weight: PRIORITY_WEIGHT[t.priority], meta: t.dueDate });
    }
  });
  // Plans
  events.forEach((e, i) => {
    const base = e.status === 'done' ? 6 : 2;
    for (let k = 0; k < base; k++) {
      const daysAgo = Math.floor(seedRandom(i * 17 + k * 5 + 1) * 365);
      const d = new Date(now); d.setDate(now.getDate() - daysAgo); d.setHours(Math.floor(seedRandom(i + k + 7) * 24));
      records.push({ type: 'plan', title: e.title, date: d, weight: 2, meta: e.time });
    }
  });
  // Orders
  DINE_ORDERS.forEach((o, i) => {
    const base = o.status === 'delivered' ? 7 : 2;
    for (let k = 0; k < base; k++) {
      const daysAgo = Math.floor(seedRandom(i * 11 + k * 3 + 99) * 365);
      const d = new Date(now); d.setDate(now.getDate() - daysAgo); d.setHours(Math.floor(seedRandom(i + k + 13) * 24));
      const totalNum = Number(o.total.replace(/[٬,]/g, '')) || 100000;
      records.push({ type: 'order', title: `سفارش ${o.num}`, date: d, weight: Math.max(1, Math.round(totalNum / 100000)), meta: o.restaurant });
    }
  });
  return records;
}

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function printPDF(title: string, html: string) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: 'Vazirmatn', Tahoma, sans-serif; padding: 24px; color: #111; background:#fff; }
      h1 { font-size: 18px; margin: 0 0 16px; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }
      h2 { font-size: 14px; margin: 18px 0 8px; color: #6366f1; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 12px; }
      th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: right; }
      th { background: #f3f4f6; }
      .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
      .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
      .label { color: #6b7280; font-size: 11px; }
      .value { font-size: 18px; font-weight: 700; }
    </style></head><body>${html}<script>setTimeout(()=>window.print(),250);</script></body></html>`);
  win.document.close();
}

const COLLECTION_OPTIONS: { id: 'order' | 'plan' | 'task'; label: string; icon: string; color: string }[] = [
  { id: 'order', label: 'سفارشات',   icon: 'fa-solid fa-bag-shopping',  color: '#F59E0B' },
  { id: 'plan',  label: 'برنامه‌ها', icon: 'fa-solid fa-calendar-days', color: '#3B82F6' },
  { id: 'task',  label: 'وظایف',     icon: 'fa-solid fa-list-check',    color: '#10B981' },
];

function AssistantReportTab({ tasks, events }: { tasks: AsstTask[]; events: CalEvent[] }) {
  const [range, setRange] = useState<ReportRange>('week');
  const [period, setPeriod] = useState<ReportPeriod>('day');
  const [collections, setCollections] = useState<Set<'order' | 'plan' | 'task'>>(new Set(['order', 'plan', 'task']));

  const toggleCollection = (id: 'order' | 'plan' | 'task') => {
    setCollections(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); } else next.add(id);
      return next;
    });
  };

  const history = useMemo(() => generateSyntheticHistory(tasks, events), [tasks, events]);

  const rangeDays = RANGE_OPTIONS.find(r => r.id === range)!.days;
  const since = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - rangeDays); return d; }, [rangeDays]);
  const inRange = useMemo(
    () => history.filter(h => h.date >= since && collections.has(h.type)),
    [history, since, collections]
  );

  // Line chart: completed tasks over the range, bucketed by period
  const lineData = useMemo(() => {
    const buckets = new Map<string, { label: string; ts: number; count: number }>();
    const bucketKey = (d: Date) => {
      if (period === 'hour') return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
      if (period === 'day')  return `${d.getMonth() + 1}/${d.getDate()}`;
      if (period === 'week') { const ws = new Date(d); ws.setDate(d.getDate() - d.getDay()); return `هفته ${ws.getMonth() + 1}/${ws.getDate()}`; }
      return `${d.getFullYear()}/${d.getMonth() + 1}`;
    };
    inRange.filter(h => h.type === 'task').forEach(h => {
      const k = bucketKey(h.date);
      const cur = buckets.get(k) || { label: k, ts: h.date.getTime(), count: 0 };
      cur.count += 1; if (h.date.getTime() < cur.ts) cur.ts = h.date.getTime();
      buckets.set(k, cur);
    });
    return Array.from(buckets.values()).sort((a, b) => a.ts - b.ts).map(b => ({ name: b.label, value: b.count }));
  }, [inRange, period]);

  // Pie: count of completed operations split by type
  const pieData = useMemo(() => {
    const c = { task: 0, plan: 0, order: 0 };
    inRange.forEach(h => { c[h.type] += 1; });
    return [
      { name: 'وظایف',     value: c.task,  color: '#10B981' },
      { name: 'برنامه‌ها', value: c.plan,  color: '#3B82F6' },
      { name: 'سفارشات',   value: c.order, color: '#F59E0B' },
    ];
  }, [inRange]);

  // Weighted average by period: sum(weight)/count
  const weightedData = useMemo(() => {
    const buckets = new Map<string, { label: string; ts: number; sumW: number; cnt: number; tasksW: number; tasksCnt: number; ordersW: number; ordersCnt: number }>();
    const bucketKey = (d: Date) => {
      if (period === 'hour') return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
      if (period === 'day')  return `${d.getMonth() + 1}/${d.getDate()}`;
      if (period === 'week') { const ws = new Date(d); ws.setDate(d.getDate() - d.getDay()); return `هفته ${ws.getMonth() + 1}/${ws.getDate()}`; }
      return `${d.getFullYear()}/${d.getMonth() + 1}`;
    };
    inRange.filter(h => h.type === 'task' || h.type === 'order').forEach(h => {
      const k = bucketKey(h.date);
      const cur = buckets.get(k) || { label: k, ts: h.date.getTime(), sumW: 0, cnt: 0, tasksW: 0, tasksCnt: 0, ordersW: 0, ordersCnt: 0 };
      cur.sumW += h.weight; cur.cnt += 1;
      if (h.type === 'task')  { cur.tasksW  += h.weight; cur.tasksCnt  += 1; }
      if (h.type === 'order') { cur.ordersW += h.weight; cur.ordersCnt += 1; }
      if (h.date.getTime() < cur.ts) cur.ts = h.date.getTime();
      buckets.set(k, cur);
    });
    return Array.from(buckets.values()).sort((a, b) => a.ts - b.ts).map(b => ({
      name: b.label,
      tasks:  b.tasksCnt  ? +(b.tasksW  / b.tasksCnt ).toFixed(2) : 0,
      orders: b.ordersCnt ? +(b.ordersW / b.ordersCnt).toFixed(2) : 0,
      total:  b.cnt       ? +(b.sumW    / b.cnt      ).toFixed(2) : 0,
    }));
  }, [inRange, period]);

  // Operation log
  const log = useMemo(() => [...inRange].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 40), [inRange]);

  const fmtDate = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;

  const exportExcel = () => {
    const headers = ['نوع', 'عنوان', 'تاریخ', 'وزن', 'توضیح'];
    const rows = log.map(l => [
      l.type === 'task' ? 'وظیفه' : l.type === 'plan' ? 'برنامه' : 'سفارش',
      l.title, fmtDate(l.date), l.weight, l.meta,
    ]);
    downloadCSV(`report-${range}-${period}.csv`, headers, rows);
  };

  const exportPDF = () => {
    const summary = `<div class="summary">
      <div class="card"><div class="label">وظایف انجام‌شده</div><div class="value">${pieData[0].value}</div></div>
      <div class="card"><div class="label">برنامه‌های انجام‌شده</div><div class="value">${pieData[1].value}</div></div>
      <div class="card"><div class="label">سفارشات تکمیل‌شده</div><div class="value">${pieData[2].value}</div></div>
    </div>`;
    const wTable = `<h2>میانگین وزنی</h2><table><thead><tr><th>دوره</th><th>وظایف</th><th>سفارشات</th><th>کل</th></tr></thead><tbody>${
      weightedData.map(w => `<tr><td>${w.name}</td><td>${w.tasks}</td><td>${w.orders}</td><td>${w.total}</td></tr>`).join('')
    }</tbody></table>`;
    const lTable = `<h2>لاگ عملیات</h2><table><thead><tr><th>نوع</th><th>عنوان</th><th>تاریخ</th><th>وزن</th><th>توضیح</th></tr></thead><tbody>${
      log.map(l => `<tr><td>${l.type === 'task' ? 'وظیفه' : l.type === 'plan' ? 'برنامه' : 'سفارش'}</td><td>${l.title}</td><td>${fmtDate(l.date)}</td><td>${l.weight}</td><td>${l.meta}</td></tr>`).join('')
    }</tbody></table>`;
    printPDF('گزارش Neura', `<h1>گزارش تجمیعی · بازه ${RANGE_OPTIONS.find(r => r.id === range)!.label} · دوره ${PERIOD_OPTIONS.find(p => p.id === period)!.label}</h1>${summary}${wTable}${lTable}`);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      {/* Collection filter */}
      <div className="mb-3">
        <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5 px-0.5" style={{ fontWeight: 700 }}>کالکشن‌های گزارش</div>
        <div className="flex gap-1.5 flex-wrap">
          {COLLECTION_OPTIONS.map(c => {
            const active = collections.has(c.id);
            return (
              <button key={c.id}
                className="py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer transition-all flex items-center gap-1.5"
                style={active
                  ? { background: c.color, color: '#fff', borderColor: 'transparent', fontWeight: 700 }
                  : { background: 'transparent', color: 'var(--aw-text-secondary)', borderColor: 'var(--aw-border)', fontWeight: 500 }}
                onClick={() => toggleCollection(c.id)}>
                <i className={`${c.icon} text-[9px]`} />
                {c.label}
                {active && <i className="fa-solid fa-check text-[8px]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range selector */}
      <div className="mb-3">
        <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5 px-0.5" style={{ fontWeight: 700 }}>بازه گزارش</div>
        <div className="flex gap-1.5 flex-wrap">
          {RANGE_OPTIONS.map(r => (
            <button key={r.id}
              className="py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer transition-all"
              style={range === r.id
                ? { background: '#6366f1', color: '#fff', borderColor: 'transparent', fontWeight: 700 }
                : { background: 'transparent', color: 'var(--aw-text-secondary)', borderColor: 'var(--aw-border)', fontWeight: 500 }}
              onClick={() => setRange(r.id)}>{r.label}</button>
          ))}
        </div>
      </div>

      {/* Period selector */}
      <div className="mb-3">
        <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5 px-0.5" style={{ fontWeight: 700 }}>دوره تجمیع</div>
        <div className="flex gap-1.5 flex-wrap">
          {PERIOD_OPTIONS.map(p => (
            <button key={p.id}
              className="py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer transition-all"
              style={period === p.id
                ? { background: '#10B981', color: '#fff', borderColor: 'transparent', fontWeight: 700 }
                : { background: 'transparent', color: 'var(--aw-text-secondary)', borderColor: 'var(--aw-border)', fontWeight: 500 }}
              onClick={() => setPeriod(p.id)}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-2 mb-4">
        <button className="flex-1 py-2 rounded-xl border-none text-white text-[11.5px] cursor-pointer flex items-center justify-center gap-1.5"
          style={{ background: '#10B981', fontWeight: 700 }} onClick={exportExcel}>
          <i className="fa-solid fa-file-excel text-[11px]" /> خروجی اکسل
        </button>
        <button className="flex-1 py-2 rounded-xl border-none text-white text-[11.5px] cursor-pointer flex items-center justify-center gap-1.5"
          style={{ background: '#EF4444', fontWeight: 700 }} onClick={exportPDF}>
          <i className="fa-solid fa-file-pdf text-[11px]" /> خروجی PDF
        </button>
      </div>

      {/* Summary cards */}
      <SectionTitle icon="fa-solid fa-chart-pie" title="گزارش تجمیعی" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {pieData.map((s, i) => (
          <motion.div key={s.name} className="p-3 flex flex-col gap-1.5" style={euCardStyle}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
              <i className="fa-solid fa-circle-check text-[10px]" style={{ color: s.color }} />
            </div>
            <span className="text-[16px] text-[var(--aw-text-primary)]" style={{ fontWeight: 800 }}>{toFa(s.value)}</span>
            <span className="text-[10px] text-[var(--aw-text-muted)]">{s.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Line chart: done tasks */}
      <SectionTitle icon="fa-solid fa-chart-line" title="وظایف انجام‌شده در بازه" />
      <div className="p-2 mb-4" style={euCardStyle}>
        {lineData.length === 0 ? (
          <div className="py-8 text-center text-[11px] text-[var(--aw-text-muted)]">داده‌ای برای این بازه/دوره ثبت نشده است.</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(126,95,170,0.10)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie chart: operations split */}
      <SectionTitle icon="fa-solid fa-chart-pie" title="تفکیک عملیات‌ها" />
      <div className="p-2 mb-4" style={euCardStyle}>
        {pieData.every(p => p.value === 0) ? (
          <div className="py-8 text-center text-[11px] text-[var(--aw-text-muted)]">داده‌ای برای این بازه ثبت نشده است.</div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={36} paddingAngle={2}>
                {pieData.map(p => <Cell key={p.name} fill={p.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--aw-text-secondary)' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weighted average chart */}
      <SectionTitle icon="fa-solid fa-scale-balanced" title="میانگین وزنی وظایف و سفارشات" />
      <div className="p-2 mb-4" style={euCardStyle}>
        {weightedData.length === 0 ? (
          <div className="py-8 text-center text-[11px] text-[var(--aw-text-muted)]">داده‌ای برای این بازه/دوره ثبت نشده است.</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weightedData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(126,95,170,0.10)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--aw-text-secondary)' }} />
              <Bar dataKey="tasks"  name="وظایف"   fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" name="سفارشات" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Operation log */}
      <SectionTitle icon="fa-solid fa-list-ul" title={`لاگ عملیات (${toFa(log.length)})`} />
      <div className="p-2" style={euCardStyle}>
        {log.length === 0 ? (
          <div className="py-6 text-center text-[11px] text-[var(--aw-text-muted)]">لاگی برای این بازه ثبت نشده است.</div>
        ) : log.map((l, i) => {
          const meta = l.type === 'task'
            ? { icon: 'fa-solid fa-list-check', color: '#10B981', label: 'وظیفه' }
            : l.type === 'plan'
              ? { icon: 'fa-solid fa-calendar-days', color: '#3B82F6', label: 'برنامه' }
              : { icon: 'fa-solid fa-bag-shopping', color: '#F59E0B', label: 'سفارش' };
          return (
            <div key={`${l.type}-${i}`} className="flex items-center gap-2.5 py-2 border-b border-[rgba(126,95,170,0.08)] last:border-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}18` }}>
                <i className={`${meta.icon} text-[10px]`} style={{ color: meta.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: 600 }}>{l.title}</div>
                <div className="text-[9.5px] text-[var(--aw-text-muted)]">{meta.label} · {l.meta}</div>
              </div>
              <div className="text-[9.5px] text-[var(--aw-text-muted)] flex-shrink-0 text-left">
                {fmtDate(l.date)}
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: `${meta.color}18`, color: meta.color, fontWeight: 700 }}>w {l.weight}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssistantNewChat() {
  const [messages, setMessages] = useState<{ from: 'user' | 'agent'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');

  const AGENT_REPLIES = [
    'بله، حتماً! بذارید بررسی کنم...',
    'متوجه شدم. الان انجام می‌دم.',
    'اطلاعات رو پیدا کردم. لطفاً چند لحظه صبر کنید.',
    'بله، این مورد رو برنامه‌ریزی می‌کنم.',
    'انجام شد! کار دیگه‌ای هست؟',
  ];

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setTimeout(() => {
      const reply = AGENT_REPLIES[Math.floor(Math.random() * AGENT_REPLIES.length)];
      setMessages(prev => [...prev, { from: 'agent', text: reply }]);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-3 aw-scroll space-y-2">
        {messages.length === 0 && (
          <motion.div className="flex flex-col items-center justify-center h-full text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#6366f118' }}>
              <i className="fa-solid fa-robot text-[28px]" style={{ color: '#6366f1' }} />
            </div>
            <h3 className="text-[15px] text-[var(--aw-text-primary)] mb-1" style={{ fontWeight: 700 }}>گفتگوی جدید</h3>
            <p className="text-[12px] text-[var(--aw-text-muted)] max-w-[220px]">سوالی بپرسید یا دستوری بدهید، دستیار هوشمند آماده کمک است.</p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {['برنامه امروزم چیه؟', 'یه تسک جدید بساز', 'یادآوری تنظیم کن'].map((suggestion, i) => (
                <button key={i} className="px-3 py-1.5 rounded-full border border-[var(--aw-border)] bg-transparent text-[11px] text-[var(--aw-text-secondary)] cursor-pointer hover:border-[#6366f1] hover:text-[#6366f1] transition-all"
                  onClick={() => { setInputText(suggestion); }}>
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {messages.map((m, i) => (
          <motion.div key={i} className={`flex ${m.from === 'user' ? 'justify-start' : 'justify-end'}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-[12px] ${
              m.from === 'user'
                ? 'bg-[var(--aw-eu-primary)] text-white rounded-br-md'
                : 'rounded-bl-md'
            }`} style={m.from === 'agent' ? { background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' } : {}}>
              {m.from === 'agent' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[8px]" style={{ background: '#6366f1' }}>
                    <i className="fa-solid fa-robot" />
                  </div>
                  <span className="text-[10px] text-[var(--aw-text-muted)]" style={{ fontWeight: 600 }}>دستیار شخصی</span>
                </div>
              )}
              <span style={{ lineHeight: '1.7' }}>{m.text}</span>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--aw-border)]">
        <div className="flex-1 flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <input className="flex-1 bg-transparent border-none py-2.5 text-[12px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
            placeholder="پیام خود را بنویسید..." value={inputText} onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
        </div>
        <button className="w-10 h-10 rounded-xl border-none text-white cursor-pointer flex items-center justify-center text-[14px]"
          style={{ background: '#6366f1' }}
          onClick={sendMessage}>
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}

export function EuAssistantScreen() {
  const { setEuScreen, openChat, showToast } = useApp();
  const [tab, setTab] = useState('chat');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [events, setEvents] = useState(INITIAL_CAL_EVENTS);
  const [showTopics, setShowTopics] = useState(false);

  const pendingTasks = tasks.filter(t => !t.done).length;
  const asstTabs = ASSISTANT_TABS.map(t => t.id === 'todo' ? { ...t, badge: pendingTasks } : t);

  const TOPICS_LIST = [
    { id: 1, title: 'گفتگوی اولیه', date: 'امروز', msgs: 5, active: true },
    { id: 2, title: 'بررسی برنامه هفتگی', date: 'دیروز', msgs: 12, active: false },
    { id: 3, title: 'یادآوری جلسات', date: '۲ روز پیش', msgs: 8, active: false },
    { id: 4, title: 'لیست خرید', date: '۳ روز پیش', msgs: 4, active: false },
  ];

  return (
    <div className="flex flex-col h-full relative">
      <AgentHeader title="دستیار شخصی" icon="fa-solid fa-robot" color="#6366f1" onBack={() => setEuScreen('euHomeScreen')}
        rightAction={
          <div className="flex items-center gap-1.5">
            <button className="w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)] hover:text-[#6366f1] hover:border-[#6366f1] transition-all relative"
              onClick={() => setShowTopics(!showTopics)}>
              <i className="fa-solid fa-folder-open text-[14px]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px]" style={{ background: '#6366f1', fontWeight: 700 }}>{TOPICS_LIST.length}</span>
            </button>
            <button className="w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)] hover:text-[#6366f1] hover:border-[#6366f1] transition-all"
              onClick={() => { openChat('assistant', 'eu'); }}>
              <i className="fa-solid fa-plus text-[14px]" />
            </button>
          </div>
        }
      />

      {/* Topics drawer */}
      <AnimatePresence>
        {showTopics && (
          <motion.div className="absolute top-[60px] left-4 right-4 z-30 rounded-xl overflow-hidden"
            style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--aw-border)]">
              <span className="text-[13px] text-[var(--aw-text-primary)] flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                <i className="fa-solid fa-folder-open text-[12px]" style={{ color: '#6366f1' }} /> پرونده‌ها
              </span>
              <button className="text-[11px] px-2.5 py-1 rounded-lg border-none cursor-pointer text-white flex items-center gap-1"
                style={{ background: '#6366f1', fontWeight: 600 }}
                onClick={() => { showToast('پرونده جدید ایجاد شد'); setShowTopics(false); openChat('assistant', 'eu'); }}>
                <i className="fa-solid fa-plus text-[9px]" /> جدید
              </button>
            </div>
            {TOPICS_LIST.map(topic => (
              <button key={topic.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 border-none bg-transparent cursor-pointer text-right transition-all hover:bg-[rgba(99,102,241,0.08)]"
                style={topic.active ? { background: 'rgba(99,102,241,0.1)' } : {}}
                onClick={() => { setShowTopics(false); setTab('chat'); }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: topic.active ? '#6366f122' : 'var(--aw-bg-app)' }}>
                  <i className={`fa-solid ${topic.active ? 'fa-comment-dots' : 'fa-file-lines'} text-[12px]`}
                    style={{ color: topic.active ? '#6366f1' : 'var(--aw-text-muted)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: topic.active ? 700 : 500 }}>{topic.title}</div>
                  <div className="text-[10px] text-[var(--aw-text-muted)]">{topic.date} · {topic.msgs} پیام</div>
                </div>
                {topic.active && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#6366f1' }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div key={tab} className="flex-1 flex flex-col min-h-0"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'chat' && <AssistantNewChat />}
        </motion.div>
      </AnimatePresence>
      <AgentTabBar tabs={asstTabs} active={tab} onChange={setTab} />
    </div>
  );
}


// =====================================================================
//  SEARCH SCREEN (جستجو – مستقل)
// =====================================================================
export function EuSearchScreen() {
  const { setEuScreen } = useApp();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
        <button className="w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)]"
          onClick={() => setEuScreen('euHomeScreen')}>
          <i className="fa-solid fa-arrow-right text-[14px]" />
        </button>
        <div className="flex-1">
          <div className="text-[15px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>جستجو</div>
          <div className="text-[11px] text-[var(--aw-text-muted)]">جستجوی هوشمند در یادداشت‌ها و وظایف</div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
          <i className="fa-solid fa-magnifying-glass text-[18px]" style={{ color: '#6366f1' }} />
        </div>
      </div>
      <AssistantSearchTab />
    </div>
  );
}

// =====================================================================
//  REPORT SCREEN (گزارش – مستقل)
// =====================================================================
export function EuReportScreen() {
  const { setEuScreen } = useApp();
  const [tasks] = useState(INITIAL_TASKS);
  const [events] = useState(INITIAL_CAL_EVENTS);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
        <button className="w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)]"
          onClick={() => setEuScreen('euHomeScreen')}>
          <i className="fa-solid fa-arrow-right text-[14px]" />
        </button>
        <div className="flex-1">
          <div className="text-[15px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>گزارش</div>
          <div className="text-[11px] text-[var(--aw-text-muted)]">گزارش روزانه فعالیت‌ها</div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
          <i className="fa-solid fa-chart-pie text-[18px]" style={{ color: '#6366f1' }} />
        </div>
      </div>
      <AssistantReportTab tasks={tasks} events={events} />
    </div>
  );
}

// =====================================================================
//  PLANNER SCREEN (برنامه‌ها و وظایف – ادغام‌شده)
// =====================================================================
export function EuPlannerScreen() {
  const { setEuScreen, showToast } = useApp();
  const [tab, setTab] = useState<'calendar' | 'todo'>('calendar');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [events, setEvents] = useState(INITIAL_CAL_EVENTS);

  const pendingTasks = tasks.filter(t => !t.done).length;
  const todayEvents = events.filter(e => e.date === 'امروز').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
        <button className="w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)]"
          onClick={() => setEuScreen('euHomeScreen')}>
          <i className="fa-solid fa-arrow-right text-[14px]" />
        </button>
        <div className="flex-1">
          <div className="text-[15px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>برنامه‌ها و ��ظایف</div>
          <div className="text-[11px] text-[var(--aw-text-muted)]">{toFa(todayEvents)} رویداد · {toFa(pendingTasks)} وظیفه فعال</div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
          <i className="fa-solid fa-calendar-check text-[18px]" style={{ color: '#6366f1' }} />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 px-4 py-2.5" style={{ background: 'var(--aw-bg-card)' }}>
        {([
          { id: 'calendar' as const, icon: 'fa-solid fa-calendar-days', label: 'برنامه‌ها', badge: todayEvents },
          { id: 'todo' as const, icon: 'fa-solid fa-list-check', label: 'وظایف', badge: pendingTasks },
        ]).map(t => (
          <button key={t.id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-none cursor-pointer text-[12px] transition-all"
            style={{
              background: tab === t.id ? '#6366f1' : 'var(--aw-bg-app)',
              color: tab === t.id ? '#fff' : 'var(--aw-text-secondary)',
              fontWeight: tab === t.id ? 700 : 500,
            }}
            onClick={() => setTab(t.id)}>
            <i className={`${t.icon} text-[12px]`} />
            {t.label}
            {t.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px]" style={{
                background: tab === t.id ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.15)',
                color: tab === t.id ? '#fff' : '#6366f1',
                fontWeight: 700,
              }}>{toFa(t.badge)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} className="flex-1 flex flex-col min-h-0"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'calendar' && <AssistantCalendarTab events={events} setEvents={setEvents} tasks={tasks} setTasks={setTasks} />}
          {tab === 'todo' && <AssistantTodoTab tasks={tasks} setTasks={setTasks} events={events} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
//  3.  SUPPORT SCREEN (پشتیبانی)
// =====================================================================
const SUPPORT_TABS = [
  { id: 'chat', icon: 'fa-solid fa-comments', label: 'گفتگو' },
  { id: 'tickets', icon: 'fa-solid fa-ticket', label: 'تیکت‌ها' },
  { id: 'call', icon: 'fa-solid fa-phone', label: 'تماس' },
  { id: 'faq', icon: 'fa-solid fa-circle-question', label: 'راهنما' },
  { id: 'feedback', icon: 'fa-solid fa-star', label: 'بازخورد' },
];

interface Ticket { id: number; code: string; title: string; status: 'open' | 'inprogress' | 'resolved' | 'closed'; priority: 'high' | 'medium' | 'low'; date: string; lastReply: string; department: string }

const INITIAL_TICKETS: Ticket[] = [
  { id: 1, code: 'TK-۴۰۵۶', title: 'مشکل در پرداخت آنلاین', status: 'open', priority: 'high', date: 'امروز ۱۰:۳۰', lastReply: '—', department: 'مالی' },
  { id: 2, code: 'TK-۴۰۵۵', title: 'تأخیر در تحویل سفارش', status: 'inprogress', priority: 'medium', date: 'دیروز', lastReply: '۲ ساعت پیش', department: 'لجستیک' },
  { id: 3, code: 'TK-۴۰۵۴', title: 'تغییر آدرس تحویل', status: 'resolved', priority: 'low', date: '۲ روز پیش', lastReply: 'دیروز', department: 'عمومی' },
  { id: 4, code: 'TK-۴۰۵۳', title: 'درخواست فاکتور رسمی', status: 'closed', priority: 'low', date: 'هفته پیش', lastReply: '۳ روز پیش', department: 'مالی' },
  { id: 5, code: 'TK-۴۰۵۲', title: 'کیفیت نامناسب غذا', status: 'resolved', priority: 'high', date: '۵ روز پیش', lastReply: '۴ روز پیش', department: 'کیفیت' },
];

const ticketStatusMap: Record<string, { color: string; label: string; icon: string }> = {
  open: { color: '#3B82F6', label: 'باز', icon: 'fa-solid fa-circle-dot' },
  inprogress: { color: '#F59E0B', label: 'در بررسی', icon: 'fa-solid fa-spinner' },
  resolved: { color: '#10B981', label: 'حل شده', icon: 'fa-solid fa-circle-check' },
  closed: { color: '#6B7280', label: 'بسته', icon: 'fa-solid fa-lock' },
};

interface FaqItem { id: number; q: string; a: string; category: string }

const FAQ_ITEMS: FaqItem[] = [
  { id: 1, q: 'چگونه سفارش خود را پیگیری کنم؟', a: 'از بخش سفارشات من، وضعیت سفارش‌تان را ببینید. همچنین می‌توانید با ربات پشتیبانی گفتگو کنید.', category: 'سفارش' },
  { id: 2, q: 'چگونه سفارش را لغو کنم؟', a: 'قبل از آماده‌سازی، می‌توانید از بخش سفارشات دکمه لغو را بزنید. بعد از آماده‌سازی با پشتیبانی تماس بگیرید.', category: 'سفارش' },
  { id: 3, q: 'روش‌های پرداخت چیست؟', a: 'پرداخت آنلاین، کارت‌خوان در محل و کیف پول الکترونیکی پشتیبانی می‌شود.', category: 'پرداخت' },
  { id: 4, q: 'زمان تحویل چقدر است؟', a: 'معمولاً ۲۰ تا ۴۵ دقیقه بسته به فاصله رستوران. در ساعات شلوغ ممکن است بیشتر شود.', category: 'تحویل' },
  { id: 5, q: 'چگونه آدرس تحویل را تغییر دهم؟', a: 'از بخش پروفایل > آدرس‌ها، آدرس جدید اضافه یا آدرس فعلی را ویرایش کنید.', category: 'حساب' },
  { id: 6, q: 'اگر غذا مشکل داشت چه کنم؟', a: 'در بخش تیکت‌ها یک درخواست جدید ثبت کنید یا با پشتیبانی تماس بگیرید. مبلغ بازگردانده می‌شود.', category: 'کیفیت' },
];

const SUPPORT_CHAT_MSGS = [
  { from: 'agent' as const, text: 'سلام! به پشتیبانی Neura خوش آمدید. چطور می‌تونم کمکتون کنم؟' },
  { from: 'user' as const, text: 'سفارش من دیر رسید و غذا سرد بود.' },
  { from: 'agent' as const, text: 'متأسفم از این تجربه. شماره سفارشتان را لطفاً بفرمایید تا بررسی کنم و مبلغ را بازگردانم.' },
  { from: 'user' as const, text: 'سفارش شماره ۱۰۲۴' },
  { from: 'agent' as const, text: 'سفارش #۱۰۲۴ بررسی شد. مبلغ ۳۲۰,۰۰۰ تومان به کیف پول شما بازگردانده شد. آیا کار دیگری هست؟' },
];

function SupportTicketsTab() {
  const { showToast } = useApp();
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [filter, setFilter] = useState('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('عمومی');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'inprogress').length;

  const submitTicket = () => {
    if (!newTitle.trim()) { showToast('لطفاً عنوان تیکت را وارد کنید'); return; }
    const newTicket: Ticket = {
      id: tickets.length + 1,
      code: `TK-${toFa(4057 + tickets.length - 5)}`,
      title: newTitle,
      status: 'open',
      priority: newPriority,
      date: 'الان',
      lastReply: '—',
      department: newDept,
    };
    setTickets(prev => [newTicket, ...prev]);
    setNewTitle('');
    setShowNewForm(false);
    showToast('تیکت جدید ثبت شد');
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      {/* Filter pills */}
      <div className="flex gap-1.5 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: `همه (${toFa(tickets.length)})` },
          { id: 'open', label: `باز (${toFa(openCount)})` },
          { id: 'inprogress', label: 'در بررسی' },
          { id: 'resolved', label: 'حل شده' },
        ].map(f => (
          <button key={f.id}
            className={`py-1.5 px-3 rounded-full border text-[10px] cursor-pointer transition-all whitespace-nowrap ${
              filter === f.id ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
            }`}
            style={filter === f.id ? { background: 'var(--aw-eu-primary)', fontWeight: 600 } : { fontWeight: 500 }}
            onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* New ticket button or form */}
      <AnimatePresence mode="wait">
        {showNewForm ? (
          <motion.div key="form" className="p-3 mb-3" style={euCardStyle}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="text-[12px] text-[var(--aw-text-primary)] mb-2" style={{ fontWeight: 700 }}>ثبت تیکت جدید</div>
            <input className="w-full rounded-lg border border-[var(--aw-border)] px-3 py-2 text-[12px] text-[var(--aw-text-primary)] outline-none mb-2 placeholder:text-[var(--aw-text-muted)]"
              style={{ background: 'var(--aw-bg-input)' }} placeholder="عنوان مشکل..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <div className="flex gap-2 mb-2">
              <select className="flex-1 rounded-lg border border-[var(--aw-border)] px-2 py-2 text-[11px] text-[var(--aw-text-primary)] outline-none"
                style={{ background: 'var(--aw-bg-input)' }} value={newDept} onChange={e => setNewDept(e.target.value)}>
                <option value="عمومی">عمومی</option><option value="مالی">مالی</option><option value="لجستیک">لجستیک</option><option value="کیفیت">کیفیت</option>
              </select>
              <select className="flex-1 rounded-lg border border-[var(--aw-border)] px-2 py-2 text-[11px] text-[var(--aw-text-primary)] outline-none"
                style={{ background: 'var(--aw-bg-input)' }} value={newPriority} onChange={e => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}>
                <option value="high">فوری</option><option value="medium">متوسط</option><option value="low">عادی</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg border-none text-white text-[11px] cursor-pointer" style={{ background: 'var(--aw-eu-primary)', fontWeight: 600 }} onClick={submitTicket}>
                <i className="fa-solid fa-paper-plane text-[9px] ml-1" />ارسال تیکت
              </button>
              <button className="py-2 px-3 rounded-lg border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer" onClick={() => setShowNewForm(false)}>انصراف</button>
            </div>
          </motion.div>
        ) : (
          <motion.button key="btn" className="w-full flex items-center justify-center gap-2 p-3 mb-3 rounded-xl border border-dashed border-[var(--aw-eu-primary)] bg-transparent text-[var(--aw-eu-primary)] text-[12px] cursor-pointer"
            style={{ fontWeight: 600 }} onClick={() => setShowNewForm(true)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <i className="fa-solid fa-plus" /> ثبت تیکت جدید
          </motion.button>
        )}
      </AnimatePresence>

      {filtered.map((tk, i) => {
        const st = ticketStatusMap[tk.status];
        const pr = priColors[tk.priority];
        return (
          <motion.div key={tk.id} className="p-3 mb-2" style={euCardStyle}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] text-[var(--aw-eu-primary)]" style={{ fontWeight: 700 }}>{tk.code}</span>
                  <StatusPill label={st.label} color={st.color} />
                  <StatusPill label={pr.label} color={pr.color} />
                </div>
                <div className="text-[13px] text-[var(--aw-text-primary)] mt-1" style={{ fontWeight: 600 }}>{tk.title}</div>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${st.color}12` }}>
                <i className={`${st.icon} text-[12px]`} style={{ color: st.color }} />
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
              <span><i className="fa-solid fa-building text-[8px] ml-1" />{tk.department}</span>
              <span><i className="fa-regular fa-clock text-[8px] ml-1" />{tk.date}</span>
              {tk.lastReply !== '—' && <span><i className="fa-solid fa-reply text-[8px] ml-1" />پاسخ: {tk.lastReply}</span>}
            </div>
          </motion.div>
        );
      })}
      {filtered.length === 0 && <EmptyState icon="fa-solid fa-ticket" text="تیکتی یافت نشد" />}
    </div>
  );
}

function SupportCallTab() {
  const { showToast, openUnifiedCall } = useApp();
  const contacts = [
    { icon: 'fa-solid fa-headset', label: 'پشتیبانی عمومی', desc: 'پاسخگویی ۲۴ ساعته', ext: '۱۰۰', color: '#3B82F6', available: true },
    { icon: 'fa-solid fa-utensils', label: 'واحد سفارشات', desc: 'پیگیری و تغییر سفارش', ext: '۱۰۱', color: '#10B981', available: true },
    { icon: 'fa-solid fa-money-bill', label: 'واحد مالی', desc: 'مشکلات پرداخت و استرداد', ext: '۱۰۲', color: '#F59E0B', available: true },
    { icon: 'fa-solid fa-shield-halved', label: 'واحد کیفیت', desc: 'شکایات و پیشنهادات', ext: '۱۰۳', color: '#EF4444', available: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      <SectionTitle icon="fa-solid fa-phone-volume" title="تماس سریع" />
      {/* Emergency call banner */}
      <div className="p-3 mb-3 rounded-xl flex items-center gap-3 cursor-pointer" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        onClick={openUnifiedCall}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: '#EF4444' }}>
          <i className="fa-solid fa-phone-volume text-[16px]" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] text-[#EF4444]" style={{ fontWeight: 700 }}>تماس فوری</div>
          <div className="text-[10px] text-[var(--aw-text-secondary)]">برای مشکلات فوری تماس بگیرید</div>
        </div>
        <i className="fa-solid fa-chevron-left text-[var(--aw-text-muted)]" />
      </div>

      {contacts.map((item, i) => (
        <motion.div key={i} className="flex items-center gap-3 p-3 mb-2 cursor-pointer" style={{ ...euCardStyle, opacity: item.available ? 1 : 0.5 }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: item.available ? 1 : 0.5, y: 0 }} transition={{ delay: i * 0.08 }}
          onClick={() => item.available ? openUnifiedCall() : showToast('این واحد در حال حاضر در دسترس نیست')}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
            <i className={`${item.icon} text-[17px]`} style={{ color: item.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{item.label}</span>
              {item.available ? <StatusPill label="آنلاین" color="#10B981" /> : <StatusPill label="آفلاین" color="#6B7280" />}
            </div>
            <div className="text-[11px] text-[var(--aw-text-secondary)]">{item.desc}</div>
            <div className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-phone text-[8px] ml-1" />داخلی {item.ext}</div>
          </div>
          <button className="w-10 h-10 rounded-xl border-none text-white cursor-pointer flex items-center justify-center" style={{ background: item.available ? item.color : '#6B7280' }}
            onClick={(e) => { e.stopPropagation(); if (item.available) showToast(`تماس با ${item.label}...`); }}>
            <i className="fa-solid fa-phone text-[14px]" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

function SupportFaqTab() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const allCats = ['all', ...Array.from(new Set(FAQ_ITEMS.map(f => f.category)))];
  const filtered = FAQ_ITEMS.filter(f =>
    (catFilter === 'all' || f.category === catFilter) &&
    (!search || f.q.includes(search) || f.a.includes(search))
  );

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)] mb-2" style={{ background: 'var(--aw-bg-input)' }}>
        <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
        <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
          placeholder="جستجو در سوالات متداول..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer" onClick={() => setSearch('')}><i className="fa-solid fa-times text-sm" /></button>}
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 pb-3 overflow-x-auto">
        {allCats.map(c => (
          <button key={c}
            className={`py-1 px-2.5 rounded-full border text-[10px] cursor-pointer transition-all whitespace-nowrap ${
              catFilter === c ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
            }`}
            style={catFilter === c ? { background: 'var(--aw-eu-primary)', fontWeight: 600 } : { fontWeight: 500 }}
            onClick={() => setCatFilter(c)}>
            {c === 'all' ? 'همه' : c}
          </button>
        ))}
      </div>

      {filtered.map((faq, i) => (
        <motion.div key={faq.id} className="mb-2 cursor-pointer overflow-hidden" style={euCardStyle}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          onClick={() => setOpen(open === faq.id ? null : faq.id)}>
          <div className="flex items-center gap-2 p-3">
            <i className={`fa-solid ${open === faq.id ? 'fa-chevron-down' : 'fa-chevron-left'} text-[10px] text-[var(--aw-eu-primary)] transition-transform`} />
            <span className="flex-1 text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{faq.q}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: 'rgba(126,95,170,0.1)', color: 'var(--aw-eu-primary)' }}>{faq.category}</span>
          </div>
          <AnimatePresence>
            {open === faq.id && (
              <motion.div className="px-3 pb-3 text-[12px] text-[var(--aw-text-secondary)] pr-7"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ lineHeight: '1.8' }}>
                {faq.a}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
      {filtered.length === 0 && <EmptyState icon="fa-solid fa-circle-question" text="سوالی یافت نشد" />}
    </div>
  );
}

function SupportFeedbackTab() {
  const { showToast } = useApp();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [feedbacks, setFeedbacks] = useState([
    { rating: 5, text: 'سرعت تحویل عالی بود!', date: 'هفته پیش' },
    { rating: 4, text: 'کیفیت غذا خوب ولی بسته‌بندی می‌تونست بهتر باشه.', date: '۲ هفته پیش' },
  ]);

  const ratingLabels = ['', 'خیلی بد', 'بد', 'متوسط', 'خوب', 'عالی'];
  const ratingEmojis = ['', '😞', '😕', '😐', '😊', '🤩'];

  const submitFeedback = () => {
    if (rating === 0) return;
    setFeedbacks(prev => [{ rating, text: text || '(بدون نظر)', date: 'الان' }, ...prev]);
    showToast('بازخورد شما ثبت شد. متشکریم!');
    setRating(0);
    setText('');
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      <SectionTitle icon="fa-solid fa-star" title="امتیازدهی و بازخورد" />

      <div className="p-4 mb-4" style={euCardStyle}>
        <div className="text-center mb-4">
          <div className="text-[14px] text-[var(--aw-text-primary)] mb-3" style={{ fontWeight: 700 }}>تجربه شما چگونه بود؟</div>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s}
                className="w-11 h-11 rounded-full border-2 cursor-pointer text-[18px] transition-all"
                style={{
                  background: s <= rating ? '#F59E0B' : 'transparent',
                  borderColor: s <= rating ? '#F59E0B' : 'var(--aw-border)',
                  color: s <= rating ? '#fff' : 'var(--aw-text-muted)',
                  transform: s === rating ? 'scale(1.15)' : 'scale(1)',
                }}
                onClick={() => setRating(s)}>
                <i className="fa-solid fa-star" />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <motion.div className="text-[13px] text-[var(--aw-text-primary)]" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[20px] ml-1">{ratingEmojis[rating]}</span>
              <span style={{ fontWeight: 600 }}>{ratingLabels[rating]}</span>
            </motion.div>
          )}
        </div>

        <textarea
          className="w-full rounded-xl border border-[var(--aw-border)] p-3 text-[12px] text-[var(--aw-text-primary)] outline-none resize-none placeholder:text-[var(--aw-text-muted)]"
          style={{ background: 'var(--aw-bg-input)', minHeight: 80 }}
          placeholder="نظر یا پیشنهاد خود را بنویسید..."
          value={text} onChange={e => setText(e.target.value)}
        />

        <button
          className="w-full mt-3 py-3 rounded-xl border-none text-white text-[13px] cursor-pointer flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--aw-eu-primary), #ec4899)', fontWeight: 600, opacity: rating === 0 ? 0.5 : 1 }}
          disabled={rating === 0}
          onClick={submitFeedback}>
          <i className="fa-solid fa-paper-plane" /> ارسال بازخورد
        </button>
      </div>

      {feedbacks.length > 0 && (
        <>
          <SectionTitle icon="fa-solid fa-clock-rotate-left" title="بازخوردهای قبلی" />
          {feedbacks.map((fb, i) => (
            <motion.div key={i} className="p-3 mb-2" style={euCardStyle}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <i key={s} className={`fa-solid fa-star text-[10px] ${s <= fb.rating ? 'text-[#F59E0B]' : 'text-[var(--aw-text-muted)]'}`} />
                ))}
                <span className="text-[9px] text-[var(--aw-text-muted)] mr-2">{fb.date}</span>
              </div>
              <div className="text-[12px] text-[var(--aw-text-secondary)]">{fb.text}</div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

function SupportNewChat() {
  const [messages, setMessages] = useState<{ from: 'user' | 'agent'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');

  const AGENT_REPLIES = [
    'متوجه شدم. بذارید بررسی کنم...',
    'مشکلتون رو ثبت کردم. پیگیری می‌کنم.',
    'بله، الان وضعیت سفارش رو چک می‌کنم.',
    'تیکت شما ثبت شد. به‌زودی پاسخ می‌دیم.',
    'مبلغ به کیف پول شما بازگردانده شد.',
  ];

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setTimeout(() => {
      const reply = AGENT_REPLIES[Math.floor(Math.random() * AGENT_REPLIES.length)];
      setMessages(prev => [...prev, { from: 'agent', text: reply }]);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-3 aw-scroll space-y-2">
        {messages.length === 0 && (
          <motion.div className="flex flex-col items-center justify-center h-full text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f43f5e18' }}>
              <i className="fa-solid fa-headset text-[28px]" style={{ color: '#f43f5e' }} />
            </div>
            <h3 className="text-[15px] text-[var(--aw-text-primary)] mb-1" style={{ fontWeight: 700 }}>گفتگوی جدید</h3>
            <p className="text-[12px] text-[var(--aw-text-muted)] max-w-[220px]">سوال یا مشکلی دارید؟ تیم پشتیبانی آماده کمک است.</p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {['مشکل در پرداخت دارم', 'سفارشم کجاست؟', 'درخواست بازگشت وجه'].map((suggestion, i) => (
                <button key={i} className="px-3 py-1.5 rounded-full border border-[var(--aw-border)] bg-transparent text-[11px] text-[var(--aw-text-secondary)] cursor-pointer hover:border-[#f43f5e] hover:text-[#f43f5e] transition-all"
                  onClick={() => { setInputText(suggestion); }}>
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {messages.map((m, i) => (
          <motion.div key={i} className={`flex ${m.from === 'user' ? 'justify-start' : 'justify-end'}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-[12px] ${
              m.from === 'user'
                ? 'bg-[var(--aw-eu-primary)] text-white rounded-br-md'
                : 'rounded-bl-md'
            }`} style={m.from === 'agent' ? { background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' } : {}}>
              {m.from === 'agent' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[8px]" style={{ background: '#f43f5e' }}>
                    <i className="fa-solid fa-headset" />
                  </div>
                  <span className="text-[10px] text-[var(--aw-text-muted)]" style={{ fontWeight: 600 }}>پشتیبان Neura</span>
                </div>
              )}
              <span style={{ lineHeight: '1.7' }}>{m.text}</span>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--aw-border)]">
        <div className="flex-1 flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <input className="flex-1 bg-transparent border-none py-2.5 text-[12px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
            placeholder="پیام خود را بنویسید..." value={inputText} onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
        </div>
        <button className="w-10 h-10 rounded-xl border-none text-white cursor-pointer flex items-center justify-center text-[14px]"
          style={{ background: '#f43f5e' }}
          onClick={sendMessage}>
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}

export function EuSupportScreen() {
  const { setEuScreen, openChat, showToast } = useApp();
  const [tab, setTab] = useState('chat');
  const [showTopics, setShowTopics] = useState(false);
  const openTickets = INITIAL_TICKETS.filter(t => t.status === 'open' || t.status === 'inprogress').length;

  const supportTabs = SUPPORT_TABS.map(t => t.id === 'tickets' ? { ...t, badge: openTickets } : t);

  const SUPPORT_TOPICS = [
    { id: 1, title: 'مشکل پرداخت آنلاین', date: 'امروز', msgs: 6, active: true },
    { id: 2, title: 'تأخیر در تحویل سفارش', date: 'دیروز', msgs: 9, active: false },
    { id: 3, title: 'بازگشت وجه سفارش ۱۰۲۴', date: '۲ روز پیش', msgs: 4, active: false },
    { id: 4, title: 'سوال درباره گارانتی', date: 'هفته پیش', msgs: 3, active: false },
  ];

  return (
    <div className="flex flex-col h-full relative">
      <AgentHeader title="پشتیبانی" icon="fa-solid fa-headset" color="#f43f5e" onBack={() => setEuScreen('euHomeScreen')}
        rightAction={
          <div className="flex items-center gap-1.5">
            <button className="w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)] hover:text-[#f43f5e] hover:border-[#f43f5e] transition-all relative"
              onClick={() => setShowTopics(!showTopics)}>
              <i className="fa-solid fa-folder-open text-[14px]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px]" style={{ background: '#f43f5e', fontWeight: 700 }}>{SUPPORT_TOPICS.length}</span>
            </button>
            <button className="w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-text-secondary)] hover:text-[#f43f5e] hover:border-[#f43f5e] transition-all"
              onClick={() => { openChat('support', 'eu'); }}>
              <i className="fa-solid fa-plus text-[14px]" />
            </button>
          </div>
        }
      />

      {/* Topics drawer */}
      <AnimatePresence>
        {showTopics && (
          <motion.div className="absolute top-[60px] left-4 right-4 z-30 rounded-xl overflow-hidden"
            style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--aw-border)]">
              <span className="text-[13px] text-[var(--aw-text-primary)] flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                <i className="fa-solid fa-folder-open text-[12px]" style={{ color: '#f43f5e' }} /> پرونده‌ها
              </span>
              <button className="text-[11px] px-2.5 py-1 rounded-lg border-none cursor-pointer text-white flex items-center gap-1"
                style={{ background: '#f43f5e', fontWeight: 600 }}
                onClick={() => { showToast('پرونده جدید ایجاد شد'); setShowTopics(false); openChat('support', 'eu'); }}>
                <i className="fa-solid fa-plus text-[9px]" /> جدید
              </button>
            </div>
            {SUPPORT_TOPICS.map(topic => (
              <button key={topic.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 border-none bg-transparent cursor-pointer text-right transition-all hover:bg-[rgba(244,63,94,0.08)]"
                style={topic.active ? { background: 'rgba(244,63,94,0.1)' } : {}}
                onClick={() => { setShowTopics(false); setTab('chat'); }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: topic.active ? '#f43f5e22' : 'var(--aw-bg-app)' }}>
                  <i className={`fa-solid ${topic.active ? 'fa-comment-dots' : 'fa-file-lines'} text-[12px]`}
                    style={{ color: topic.active ? '#f43f5e' : 'var(--aw-text-muted)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-[var(--aw-text-primary)] truncate" style={{ fontWeight: topic.active ? 700 : 500 }}>{topic.title}</div>
                  <div className="text-[10px] text-[var(--aw-text-muted)]">{topic.date} · {topic.msgs} پیام</div>
                </div>
                {topic.active && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f43f5e' }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div key={tab} className="flex-1 flex flex-col min-h-0"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'chat' && <SupportNewChat />}
          {tab === 'tickets' && <SupportTicketsTab />}
          {tab === 'call' && <SupportCallTab />}
          {tab === 'faq' && <SupportFaqTab />}
          {tab === 'feedback' && <SupportFeedbackTab />}
        </motion.div>
      </AnimatePresence>
      <AgentTabBar tabs={supportTabs} active={tab} onChange={setTab} />
    </div>
  );
}


// =====================================================================
//  4.  MARKET SCREEN (مارکت — خرید از فروشگاه‌ها)
// =====================================================================
const MARKET_TABS = [
  { id: 'shops', icon: 'fa-solid fa-store', label: 'فروشگاه‌ها' },
  { id: 'catalog', icon: 'fa-solid fa-th-large', label: 'کاتالوگ' },
  { id: 'orders', icon: 'fa-solid fa-shopping-cart', label: 'سفارشات' },
  { id: 'chat', icon: 'fa-solid fa-comments', label: 'گفتگو' },
  { id: 'deals', icon: 'fa-solid fa-star', label: 'پیشنهادها' },
  { id: 'account', icon: 'fa-solid fa-user', label: 'حساب من' },
];

interface Shop {
  id: number; name: string; type: string; rating: number; distance: string;
  deliveryTime: string; isOpen: boolean; icon: string; color: string; products: number;
}

const MARKET_SHOPS: Shop[] = [
  { id: 1, name: 'دیجی‌تک', type: 'لوازم دیجیتال', rating: 4.8, distance: '۲.۵ km', deliveryTime: '۱-۲ روز', isOpen: true, icon: 'fa-solid fa-microchip', color: '#3B82F6', products: 245 },
  { id: 2, name: 'سبز مارکت', type: 'سوپرمارکت آنلاین', rating: 4.6, distance: '۰.۸ km', deliveryTime: '۴۵ دقیقه', isOpen: true, icon: 'fa-solid fa-seedling', color: '#10B981', products: 580 },
  { id: 3, name: 'مد اسپورت', type: 'پوشاک و ورزشی', rating: 4.5, distance: '۳.۲ km', deliveryTime: '۱-۳ روز', isOpen: true, icon: 'fa-solid fa-shirt', color: '#8B5CF6', products: 320 },
  { id: 4, name: 'بیوتی‌شاپ رز', type: 'لوازم آرایشی بهداشتی', rating: 4.7, distance: '۱.۵ km', deliveryTime: '۱ روز', isOpen: true, icon: 'fa-solid fa-spa', color: '#EC4899', products: 190 },
  { id: 5, name: 'کتاب‌سرا', type: 'کتاب و لوازم‌التحریر', rating: 4.9, distance: '۴.۰ km', deliveryTime: '۲-۳ روز', isOpen: false, icon: 'fa-solid fa-book', color: '#F59E0B', products: 410 },
];

interface MarketProduct {
  id: number; name: string; desc: string; price: string; priceNum: number;
  category: string; shop: string; image: string; rating: number; inStock: boolean; discount?: number;
}

const MKT_CATEGORIES = [
  { id: 'all', label: 'همه', icon: 'fa-solid fa-border-all' },
  { id: 'electronics', label: 'دیجیتال', icon: 'fa-solid fa-laptop' },
  { id: 'fashion', label: 'پوشاک', icon: 'fa-solid fa-shirt' },
  { id: 'grocery', label: 'سوپرمارکت', icon: 'fa-solid fa-basket-shopping' },
  { id: 'beauty', label: 'آرایشی', icon: 'fa-solid fa-spa' },
];

const MARKET_PRODUCTS: MarketProduct[] = [
  { id: 101, name: 'هدفون بی‌سیم پرو', desc: 'نویزکنسلینگ، باتری ۳۰ ساعت', price: '۲,۴۵۰,۰۰۰', priceNum: 2450000, category: 'electronics', shop: 'دیجی‌تک', image: 'https://images.unsplash.com/photo-1755182529034-189a6051faae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGVhcmJ1ZHMlMjBoZWFkcGhvbmVzJTIwcHJvZHVjdHxlbnwxfHx8fDE3NzE4MzUxODd8MA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.7, inStock: true, discount: 10 },
  { id: 102, name: 'کتانی ورزشی نایک', desc: 'مناسب دویدن، سبک و راحت', price: '۳,۸۰۰,۰۰۰', priceNum: 3800000, category: 'fashion', shop: 'مد اسپورت', image: 'https://images.unsplash.com/photo-1656950246075-68a65e9c3ea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHNob2VzJTIwc3BvcnRzd2VhcnxlbnwxfHx8fDE3NzE4NjEzNDB8MA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.5, inStock: true },
  { id: 103, name: 'ساعت هوشمند', desc: 'ضدآب، سنسور سلامت', price: '۵,۲۰۰,۰۰۰', priceNum: 5200000, category: 'electronics', shop: 'دیجی‌تک', image: 'https://images.unsplash.com/photo-1749831754129-3a84b9fdeb87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRjaCUyMGx1eHVyeSUyMHdyaXN0d2F0Y2glMjBwcm9kdWN0fGVufDF8fHx8MTc3MTg2MTM0MXww&ixlib=rb-4.1.0&q=80&w=400', rating: 4.8, inStock: true, discount: 15 },
  { id: 104, name: 'لپ‌تاپ ۱۵ اینچ', desc: 'پردازنده i7، رم ۱۶GB', price: '۴۵,۰۰۰,۰۰۰', priceNum: 45000000, category: 'electronics', shop: 'دیجی‌تک', image: 'https://images.unsplash.com/photo-1750056393300-102f7c4b8bc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMHdvcmtzcGFjZSUyMHByb2R1Y3R8ZW58MXx8fHwxNzcxODYxMzQxfDA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.9, inStock: true },
  { id: 105, name: 'کوله‌پش��ی مسافرتی', desc: 'ضدآب، ۴۰ لیتری', price: '۱,۲۰۰,۰۰۰', priceNum: 1200000, category: 'fashion', shop: 'مد اسپورت', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFjayUyMHRyYXZlbCUyMGJhZyUyMHByb2R1Y3R8ZW58MXx8fHwxNzcxODYwNzg3fDA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.3, inStock: true, discount: 25 },
  { id: 106, name: 'عینک آفتابی', desc: 'فریم فلزی، UV400', price: '۸۵۰,۰۰۰', priceNum: 850000, category: 'fashion', shop: 'مد اسپورت', image: 'https://images.unsplash.com/photo-1764722755184-9863f7b11ab6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5nbGFzc2VzJTIwZmFzaGlvbiUyMGFjY2Vzc29yaWVzfGVufDF8fHx8MTc3MTczODUxNXww&ixlib=rb-4.1.0&q=80&w=400', rating: 4.4, inStock: false },
  { id: 107, name: 'ست مراقبت پوست', desc: 'پاک‌کننده، تونر، مرطوب‌کننده', price: '۶۸۰,۰۰۰', priceNum: 680000, category: 'beauty', shop: 'بیوتی‌شاپ رز', image: 'https://images.unsplash.com/photo-1765852549902-bd9c79d01afb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpY3MlMjBiZWF1dHklMjBwcm9kdWN0cyUyMGRpc3BsYXl8ZW58MXx8fHwxNzcxODYxMzQwfDA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.6, inStock: true },
  { id: 108, name: 'گوشی هوشمند', desc: 'صفحه ۶.۷ اینچ، دوربین ۱۰۸MP', price: '۱۸,۵۰۰,۰۰۰', priceNum: 18500000, category: 'electronics', shop: 'دیجی‌تک', image: 'https://images.unsplash.com/photo-1584658645175-90788b3347b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNob3AlMjBzbWFydHBob25lJTIwZGlzcGxheXxlbnwxfHx8fDE3NzE4NjEzMzh8MA&ixlib=rb-4.1.0&q=80&w=400', rating: 4.8, inStock: true, discount: 5 },
];

interface MktCartItem { product: MarketProduct; qty: number }

interface MktOrder { id: number; num: string; items: string; status: 'preparing' | 'shipping' | 'delivered' | 'cancelled'; shop: string; date: string; total: string; progress?: number }

const MKT_ORDERS: MktOrder[] = [
  { id: 1, num: '۵۰۲۶', items: 'هدفون بی‌سیم پرو × ۱', status: 'shipping', shop: 'دیجی‌تک', date: 'دیروز', total: '۲,۲۰۵,۰۰۰', progress: 70 },
  { id: 2, num: '۵۰۲۵', items: 'کتانی ورزشی + کوله‌پشتی', status: 'preparing', shop: 'مد اسپورت', date: 'امروز', total: '۴,۷۰۰,۰۰۰', progress: 30 },
  { id: 3, num: '۵۰۲۴', items: 'ست مراقبت پوست', status: 'delivered', shop: 'بیوتی‌شاپ رز', date: '۳ روز پیش', total: '۶۸۰,۰۰۰' },
];

const mktOrderStatusMap: Record<string, { color: string; label: string; icon: string }> = {
  preparing: { color: '#F59E0B', label: 'آماده‌سازی', icon: 'fa-solid fa-box' },
  shipping: { color: '#3B82F6', label: 'در حال ارسال', icon: 'fa-solid fa-truck' },
  delivered: { color: '#10B981', label: 'تحویل شده', icon: 'fa-solid fa-circle-check' },
  cancelled: { color: '#EF4444', label: 'لغو شده', icon: 'fa-solid fa-ban' },
};

interface MktOffer { id: number; title: string; desc: string; discount: number; shop: string; validUntil: string; code: string; color: string; icon: string }

const MKT_OFFERS: MktOffer[] = [
  { id: 1, title: 'تخفیف خوش‌آمدگویی', desc: 'اولین خرید از هر فروشگاه', discount: 20, shop: 'همه فروشگاه‌ها', validUntil: 'تا پایان ماه', code: 'WELCOME20', color: '#10B981', icon: 'fa-solid fa-gift' },
  { id: 2, title: 'حراج لوازم دیجیتال', desc: 'تخفیف ویژه ��وی هدفون و ساعت', discount: 15, shop: 'دیجی‌تک', validUntil: 'تا ۳ روز دیگر', code: 'TECH15', color: '#3B82F6', icon: 'fa-solid fa-bolt' },
  { id: 3, title: 'پیشنهاد AI برای شما', desc: 'کوله‌پشتی مسافرتی — بر اساس علاقه‌مندی شما', discount: 10, shop: 'مد اسپورت', validUntil: 'فقط امروز', code: 'AIPACK10', color: '#EC4899', icon: 'fa-solid fa-wand-magic-sparkles' },
  { id: 4, title: 'جشنواره زیبایی', desc: 'محصولات مراقبت پوست با تخفیف', discount: 30, shop: 'بیوتی‌شاپ رز', validUntil: 'تا هفته آینده', code: 'BEAUTY30', color: '#8B5CF6', icon: 'fa-solid fa-spa' },
];

const MKT_CHAT_MSGS = [
  { from: 'agent' as const, text: 'سلام! به مارکت Neura خوش آمدید. محصول خاصی مد نظرتان هست؟' },
  { from: 'user' as const, text: 'سلام، یه هدفون بی‌سیم خوب می‌خوام.' },
  { from: 'agent' as const, text: 'هدفون بی‌سیم پرو از دیجی‌تک با نویزکنسلینگ و ۳۰ ساعت باتری عالیه! الان ۱۰٪ تخفیف هم داره. می‌خواین به سبدتون اضافه کنم؟' },
  { from: 'user' as const, text: 'آره، لطفاً اضافه کن.' },
  { from: 'agent' as const, text: 'اضافه شد! قیمت نهایی: ۲,۲۰۵,۰۰۰ تومان. برای ثبت سفارش به تب سبد خرید مراجعه کنید.' },
];

function MarketShopsTab() {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const filtered = MARKET_SHOPS.filter(s => !search || s.name.includes(search) || s.type.includes(search));

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)] mb-3" style={{ background: 'var(--aw-bg-input)' }}>
        <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
        <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
          placeholder="جستجوی فروشگاه..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer" onClick={() => setSearch('')}><i className="fa-solid fa-times text-sm" /></button>}
      </div>

      <SectionTitle icon="fa-solid fa-store" title={`فروشگاه‌ها (${toFa(filtered.length)})`} />
      {filtered.map((shop, i) => (
        <motion.div key={shop.id} className="p-3 mb-2 cursor-pointer" style={{ ...euCardStyle, opacity: shop.isOpen ? 1 : 0.5 }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: shop.isOpen ? 1 : 0.5, y: 0 }} transition={{ delay: i * 0.06 }}
          onClick={() => showToast(shop.isOpen ? `فروشگاه ${shop.name} انتخاب شد` : `${shop.name} در حال حاضر بسته است`)}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px] flex-shrink-0" style={{ background: shop.color }}>
              <i className={shop.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{shop.name}</span>
                {shop.isOpen ? <StatusPill label="فعال" color="#10B981" /> : <StatusPill label="بسته" color="#EF4444" />}
              </div>
              <div className="text-[10px] text-[var(--aw-text-secondary)]">{shop.type}</div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-0.5 text-[13px] text-[#F59E0B]" style={{ fontWeight: 700 }}>
                <i className="fa-solid fa-star text-[9px]" />{shop.rating}
              </div>
              <span className="text-[9px] text-[var(--aw-text-muted)]">{toFa(shop.products)} محصول</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[var(--aw-text-muted)] mt-2 pr-15">
            <span><i className="fa-solid fa-location-arrow text-[8px] ml-1" />{shop.distance}</span>
            <span><i className="fa-solid fa-truck text-[8px] ml-1" />{shop.deliveryTime}</span>
          </div>
        </motion.div>
      ))}
      {filtered.length === 0 && <EmptyState icon="fa-solid fa-store" text="فروشگاهی یافت نشد" />}
    </div>
  );
}

function MarketCatalogTab({ cart, setCart }: { cart: MktCartItem[]; setCart: React.Dispatch<React.SetStateAction<MktCartItem[]>> }) {
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = MARKET_PRODUCTS.filter(p => (cat === 'all' || p.category === cat) && (!search || p.name.includes(search) || p.desc.includes(search)));

  const addToCart = useCallback((item: MarketProduct) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === item.id);
      if (existing) return prev.map(c => c.product.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product: item, qty: 1 }];
    });
  }, [setCart]);

  const removeFromCart = useCallback((itemId: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === itemId);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter(c => c.product.id !== itemId);
      return prev.map(c => c.product.id === itemId ? { ...c, qty: c.qty - 1 } : c);
    });
  }, [setCart]);

  const getQty = (id: number) => cart.find(c => c.product.id === id)?.qty || 0;

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
          <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
            placeholder="جستجوی محصول..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer" onClick={() => setSearch('')}><i className="fa-solid fa-times text-sm" /></button>}
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {MKT_CATEGORIES.map(c => (
          <button key={c.id}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] whitespace-nowrap cursor-pointer transition-all ${
              cat === c.id ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
            }`}
            style={cat === c.id ? { background: '#F59E0B', fontWeight: 600 } : { fontWeight: 500 }}
            onClick={() => setCat(c.id)}>
            <i className={c.icon} />{c.label}
          </button>
        ))}
      </div>

      <div className="px-4 grid gap-2.5">
        {filtered.map((item, i) => {
          const qty = getQty(item.id);
          return (
            <motion.div key={item.id} className="flex gap-3 p-2.5" style={{ ...euCardStyle, opacity: item.inStock ? 1 : 0.55 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: item.inStock ? 1 : 0.55, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="w-[76px] h-[76px] rounded-xl overflow-hidden flex-shrink-0 relative">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {item.discount && (
                  <span className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 rounded-md text-white" style={{ background: '#EF4444', fontWeight: 700 }}>
                    {toFa(item.discount)}%
                  </span>
                )}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[9px] text-white px-2 py-0.5 rounded-md" style={{ background: 'rgba(0,0,0,0.7)', fontWeight: 700 }}>ناموجود</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{item.name}</div>
                  <div className="text-[10px] text-[var(--aw-text-secondary)] truncate mt-0.5">{item.desc}</div>
                  <div className="text-[9px] text-[var(--aw-text-muted)] mt-0.5"><i className="fa-solid fa-store text-[7px] ml-0.5" />{item.shop}</div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <span className="text-[12px] text-[#F59E0B]" style={{ fontWeight: 700 }}>{item.price}</span>
                    <span className="text-[8px] text-[var(--aw-text-muted)] mr-0.5">تومان</span>
                  </div>
                  <span className="text-[9px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-star text-[#F59E0B] text-[7px]" /> {item.rating}</span>
                </div>
                {item.inStock && (
                  <div className="flex items-center justify-end mt-1">
                    {qty === 0 ? (
                      <button className="text-[10px] px-3 py-1.5 rounded-lg border-none text-white cursor-pointer flex items-center gap-1"
                        style={{ background: '#F59E0B', fontWeight: 600 }}
                        onClick={() => addToCart(item)}>
                        <i className="fa-solid fa-plus text-[8px]" /> افزودن
                      </button>
                    ) : (
                      <div className="flex items-center gap-0">
                        <button className="w-7 h-7 rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[11px]"
                          style={{ background: 'var(--aw-danger)' }} onClick={() => removeFromCart(item.id)}>
                          <i className={`fa-solid ${qty === 1 ? 'fa-trash' : 'fa-minus'} text-[9px]`} />
                        </button>
                        <span className="w-7 text-center text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{toFa(qty)}</span>
                        <button className="w-7 h-7 rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[11px]"
                          style={{ background: '#F59E0B' }} onClick={() => addToCart(item)}>
                          <i className="fa-solid fa-plus text-[9px]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <EmptyState icon="fa-solid fa-th-large" text="محصولی یافت نشد" />}
      </div>
    </div>
  );
}

function MarketOrdersTab({ cart, setCart }: { cart: MktCartItem[]; setCart: React.Dispatch<React.SetStateAction<MktCartItem[]>> }) {
  const { showToast } = useApp();
  const [subTab, setSubTab] = useState<'cart' | 'orders'>(cart.length > 0 ? 'cart' : 'orders');
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.product.priceNum * c.qty, 0);
  const activeOrders = MKT_ORDERS.filter(o => o.status === 'preparing' || o.status === 'shipping').length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Tab Switcher */}
      <div className="flex gap-0 px-4 pt-3 pb-1 flex-shrink-0">
        <button
          className={`flex-1 py-2 rounded-r-xl text-[12px] cursor-pointer transition-all border flex items-center justify-center gap-1.5 ${
            subTab === 'cart' ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
          }`}
          style={subTab === 'cart' ? { background: '#F59E0B', fontWeight: 700 } : { fontWeight: 500 }}
          onClick={() => setSubTab('cart')}>
          <i className="fa-solid fa-shopping-cart text-[10px]" />
          سبد خرید
          {cartCount > 0 && (
            <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>{toFa(cartCount)}</span>
          )}
        </button>
        <button
          className={`flex-1 py-2 rounded-l-xl text-[12px] cursor-pointer transition-all border flex items-center justify-center gap-1.5 ${
            subTab === 'orders' ? 'text-white border-transparent' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
          }`}
          style={subTab === 'orders' ? { background: '#F59E0B', fontWeight: 700 } : { fontWeight: 500 }}
          onClick={() => setSubTab('orders')}>
          <i className="fa-solid fa-receipt text-[10px]" />
          سفارشات
          {activeOrders > 0 && (
            <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>{toFa(activeOrders)}</span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'cart' ? (
          <motion.div key="mkt-cart-sub" className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-2"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}>
            {cartCount > 0 ? (
              <>
                {cart.map((c, i) => (
                  <motion.div key={c.product.id} className="flex items-center gap-3 p-2.5 mb-1.5 rounded-xl" style={{ background: 'var(--aw-eu-card)', border: '1px solid rgba(126,95,170,0.15)' }}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={c.product.image} alt={c.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{c.product.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#F59E0B]" style={{ fontWeight: 700 }}>{c.product.price} <span className="text-[8px] text-[var(--aw-text-muted)]">تومان</span></span>
                        {c.product.discount && (
                          <span className="text-[8px] text-white px-1.5 py-0.5 rounded-md" style={{ background: '#EF4444', fontWeight: 700 }}>{toFa(c.product.discount)}%</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0">
                      <button className="w-7 h-7 rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[10px]"
                        style={{ background: 'var(--aw-danger)' }}
                        onClick={() => setCart(prev => { const e = prev.find(x => x.product.id === c.product.id); if (!e || e.qty <= 1) return prev.filter(x => x.product.id !== c.product.id); return prev.map(x => x.product.id === c.product.id ? { ...x, qty: x.qty - 1 } : x); })}>
                        <i className={`fa-solid ${c.qty === 1 ? 'fa-trash' : 'fa-minus'} text-[9px]`} />
                      </button>
                      <span className="w-7 text-center text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 800 }}>{toFa(c.qty)}</span>
                      <button className="w-7 h-7 rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[10px]"
                        style={{ background: '#F59E0B' }}
                        onClick={() => setCart(prev => prev.map(x => x.product.id === c.product.id ? { ...x, qty: x.qty + 1 } : x))}>
                        <i className="fa-solid fa-plus text-[9px]" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                <div className="mt-2 p-3 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
                  <div className="flex justify-between items-center text-[12px] mb-1.5 text-[var(--aw-text-secondary)]">
                    <span>هزینه ارسال</span><span className="text-[#10B981]" style={{ fontWeight: 600 }}>رایگان</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] pt-1.5 border-t border-[var(--aw-border)]">
                    <span className="text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>جمع کل</span>
                    <span className="text-[#F59E0B]" style={{ fontWeight: 800 }}>{cartTotal.toLocaleString('fa-IR')} <span className="text-[9px] text-[var(--aw-text-muted)]">تومان</span></span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2.5 rounded-xl border-none text-white text-[13px] cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', fontWeight: 700 }}
                    onClick={() => { showToast('سفارش شما با موفقیت ثبت شد!'); setCart([]); setSubTab('orders'); }}>
                    <i className="fa-solid fa-check-circle text-[11px]" /> ثبت سفارش
                  </button>
                  <button className="py-2.5 px-4 rounded-xl border border-[var(--aw-danger)] bg-transparent text-[var(--aw-danger)] text-[11px] cursor-pointer flex items-center justify-center gap-1"
                    style={{ fontWeight: 600 }}
                    onClick={() => { setCart([]); showToast('سبد خرید خالی شد'); }}>
                    <i className="fa-solid fa-trash text-[9px]" />
                  </button>
                </div>
              </>
            ) : (
              <EmptyState icon="fa-solid fa-shopping-cart" text="سبد خرید خالی است" />
            )}
          </motion.div>
        ) : (
          <motion.div key="mkt-orders-sub" className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-2"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
            {MKT_ORDERS.map((ord, i) => {
              const st = mktOrderStatusMap[ord.status];
              return (
                <motion.div key={ord.id} className="p-3 mb-2" style={euCardStyle}
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#F59E0B]" style={{ fontWeight: 700 }}>#{ord.num}</span>
                        <StatusPill label={st.label} color={st.color} />
                      </div>
                      <div className="text-[13px] text-[var(--aw-text-primary)] mt-1" style={{ fontWeight: 600 }}>{ord.items}</div>
                    </div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${st.color}15` }}>
                      <i className={`${st.icon} text-[14px]`} style={{ color: st.color }} />
                    </div>
                  </div>
                  {ord.progress != null && (
                    <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'rgba(126,95,170,0.1)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: st.color }}
                        initial={{ width: 0 }} animate={{ width: `${ord.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
                    <span><i className="fa-solid fa-store text-[8px] ml-1" />{ord.shop}</span>
                    <span><i className="fa-regular fa-clock text-[8px] ml-1" />{ord.date}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(126,95,170,0.1)]">
                    <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{ord.total} <span className="text-[9px] text-[var(--aw-text-muted)]">تومان</span></span>
                    {(ord.status === 'preparing' || ord.status === 'shipping') && (
                      <button className="text-[10px] px-3 py-1.5 rounded-lg border border-[#F59E0B] bg-transparent text-[#F59E0B] cursor-pointer" style={{ fontWeight: 600 }}>
                        <i className="fa-solid fa-eye text-[8px] ml-1" />پیگیری
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {MKT_ORDERS.length === 0 && <EmptyState icon="fa-solid fa-shopping-bag" text="سفارشی یافت نشد" />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MarketDealsTab() {
  const { showToast } = useApp();
  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll px-4 pt-3">
      <SectionTitle icon="fa-solid fa-wand-magic-sparkles" title="پیشنهادهای ویژه" />
      {MKT_OFFERS.map((o, i) => (
        <motion.div key={o.id} className="p-3 mb-2 overflow-hidden relative" style={euCardStyle}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07]" style={{ background: o.color, filter: 'blur(24px)' }} />
          <div className="flex items-start gap-3 mb-2 relative">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[16px]" style={{ background: o.color }}>
              <i className={o.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{o.title}</div>
              <div className="text-[11px] text-[var(--aw-text-secondary)] mt-0.5">{o.desc}</div>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[15px]" style={{ background: `${o.color}cc`, fontWeight: 800 }}>
              {toFa(o.discount)}%
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
            <span><i className="fa-solid fa-store text-[8px] ml-1" />{o.shop}</span>
            <span><i className="fa-solid fa-calendar text-[8px] ml-1" />{o.validUntil}</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(126,95,170,0.1)]">
            <span className="text-[11px] text-[var(--aw-text-muted)] flex items-center gap-1">
              <i className="fa-solid fa-tag text-[8px]" />کد: <span className="text-[#F59E0B]" style={{ fontWeight: 700 }}>{o.code}</span>
            </span>
            <button className="text-[10px] px-3 py-1.5 rounded-lg border-none text-white cursor-pointer flex items-center gap-1" style={{ background: o.color, fontWeight: 600 }}
              onClick={() => showToast(`کد تخفیف ${o.code} کپی شد`)}>
              <i className="fa-solid fa-copy text-[8px]" /> کپی کد
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function EuMarketScreen() {
  const { setEuScreen } = useApp();
  const [tab, setTab] = useState('shops');
  const [cart, setCart] = useState<MktCartItem[]>([]);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const activeOrders = MKT_ORDERS.filter(o => o.status === 'preparing' || o.status === 'shipping').length;
  const marketTabs = MARKET_TABS.map(t => {
    if (t.id === 'orders') return { ...t, badge: cartCount + activeOrders > 0 ? cartCount + activeOrders : undefined };
    return t;
  });

  return (
    <div className="flex flex-col h-full relative">
      <AgentHeader title="مارکت" icon="fa-solid fa-store" color="#F59E0B" onBack={() => setEuScreen('euHomeScreen')}
        badge={cartCount > 0 ? (
          <button className="relative w-9 h-9 rounded-xl border border-[var(--aw-border)] bg-transparent text-[#F59E0B] cursor-pointer flex items-center justify-center"
            onClick={() => setTab('orders')}>
            <i className="fa-solid fa-shopping-cart text-[14px]" />
            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>{toFa(cartCount)}</span>
          </button>
        ) : undefined}
      />
      <AnimatePresence mode="wait">
        <motion.div key={tab} className="flex-1 flex flex-col min-h-0"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'shops' && <MarketShopsTab />}
          {tab === 'catalog' && <MarketCatalogTab cart={cart} setCart={setCart} />}
          {tab === 'orders' && <MarketOrdersTab cart={cart} setCart={setCart} />}
          {tab === 'chat' && <MarketChatTab />}
          {tab === 'deals' && <MarketDealsTab />}
          {tab === 'account' && <MarketAccountTab />}
        </motion.div>
      </AnimatePresence>

      {/* Floating cart bar */}
      <AnimatePresence>
        {cartCount > 0 && tab === 'catalog' && (
          <motion.div className="absolute bottom-14 left-4 right-4 z-20"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border-none text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}
              onClick={() => setTab('orders')}>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-shopping-cart" />
                <span className="text-[12px]" style={{ fontWeight: 600 }}>مشاهده سبد خرید</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 700 }}>{toFa(cartCount)} آیتم</span>
              </div>
              <span className="text-[13px]" style={{ fontWeight: 700 }}>{cart.reduce((s, c) => s + c.product.priceNum * c.qty, 0).toLocaleString('fa-IR')} ت</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AgentTabBar tabs={marketTabs} active={tab} onChange={setTab} />
    </div>
  );
}
