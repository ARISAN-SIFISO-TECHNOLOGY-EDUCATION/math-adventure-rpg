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
  return (
    <nav style={{ borderBottom: `1px solid ${borderColor}` }} className="bg-white py-5">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
        <div className="font-[Nunito] text-xl font-extrabold">
          <Link to="/" style={{ color: accentColor, textDecoration: 'none' }}>
            🗡️ Math Adventure RPG
          </Link>
          {breadcrumb && (
            <span className="text-gray-400 font-bold"> › {breadcrumb}</span>
          )}
        </div>
        <div className="flex gap-6 text-sm text-gray-500 font-semibold flex-wrap items-center">
          <Link to="/features"   className="hover:text-gray-800 no-underline text-gray-500">Features</Link>
          <Link to="/curriculum" className="hover:text-gray-800 no-underline text-gray-500">Curriculum</Link>
          <Link to="/parents"    className="hover:text-gray-800 no-underline text-gray-500">Parents</Link>
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
          <Link
            to="/play"
            style={{ background: accentColor }}
            className="text-white font-bold px-4 py-2 rounded-full hover:opacity-90 no-underline transition-opacity"
          >
            Play Now ▶
          </Link>
        </div>
      </div>
    </nav>
  );
}
