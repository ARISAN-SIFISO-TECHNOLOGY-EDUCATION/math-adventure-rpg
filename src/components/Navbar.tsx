import { Link } from 'react-router-dom';

type NavbarProps = {
  breadcrumb?: string;
  accentColor?: string;
  borderColor?: string;
  prevLink?: { href: string; label: string };
  nextLink?: { href: string; label: string };
};

export default function Navbar({
  breadcrumb,
  accentColor = '#4F46E5',
  borderColor = '#E5E7EB',
  prevLink,
  nextLink,
}: NavbarProps) {
  // On desktop the SideNav is the global navigation, so the marketing top bar is
  // hidden — EXCEPT when it carries page-specific context (a breadcrumb or a
  // prev/next pager), which the sidebar doesn't provide. In that case a slim
  // desktop bar shows just that context.
  const hasDesktopContent = !!(breadcrumb || prevLink || nextLink);

  return (
    <nav
      style={{ borderBottom: `1px solid ${borderColor}` }}
      className={`bg-white py-5 ${hasDesktopContent ? '' : 'lg:hidden'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
        <div className="font-[Nunito] text-xl font-extrabold">
          {/* Brand: mobile only (the SideNav carries it on desktop). */}
          <Link to="/" className="lg:hidden" style={{ color: accentColor, textDecoration: 'none' }}>
            🗡️ Math Adventure RPG
          </Link>
          {breadcrumb && (
            <span className="text-gray-500 font-bold">
              <span className="lg:hidden text-gray-400"> › </span>{breadcrumb}
            </span>
          )}
        </div>
        <div className="flex gap-6 text-sm text-gray-500 font-semibold flex-wrap items-center">
          {/* Global links: mobile only (duplicated by the SideNav on desktop). */}
          <Link to="/features"   className="lg:hidden hover:text-gray-800 no-underline text-gray-500">Features</Link>
          <Link to="/curriculum" className="lg:hidden hover:text-gray-800 no-underline text-gray-500">Curriculum</Link>
          <Link to="/parents"    className="lg:hidden hover:text-gray-800 no-underline text-gray-500">Parents</Link>
          {/* Pager: page-specific, shown on every breakpoint. */}
          {prevLink && (
            <Link to={prevLink.href} className="hover:text-gray-800 no-underline text-gray-500">
              ← {prevLink.label}
            </Link>
          )}
          {nextLink && (
            <Link to={nextLink.href} className="hover:text-gray-800 no-underline text-gray-500">
              {nextLink.label} →
            </Link>
          )}
          {/* Start CTA: mobile only (the SideNav has Start on desktop). */}
          <Link
            to="/"
            style={{ background: accentColor }}
            className="lg:hidden text-white font-bold px-4 py-2 rounded-full hover:opacity-90 no-underline transition-opacity"
          >
            Start ▶
          </Link>
        </div>
      </div>
    </nav>
  );
}
