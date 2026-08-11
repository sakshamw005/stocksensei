import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/learn', label: 'Learn' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/ipo', label: 'IPO' }
];

export default function TopNav() {
  return (
    <header className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <NavLink to="/analyze" className="font-heading font-bold text-ink text-xl tracking-tight lowercase">
          stocksensei
        </NavLink>
        <nav className="flex items-center gap-8">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `font-body text-sm font-medium pb-1 border-b-2 transition-colors ${
                  isActive ? 'text-ink border-mustard' : 'text-ink-soft border-transparent hover:text-ink'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}