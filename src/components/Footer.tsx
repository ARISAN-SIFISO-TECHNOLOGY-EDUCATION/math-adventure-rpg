import { Link } from 'react-router-dom';

type FooterProps = {
  edition?: string;
  borderColor?: string;
};

export default function Footer({ edition, borderColor = '#E5E7EB' }: FooterProps) {
  return (
    <footer style={{ borderTop: `1px solid ${borderColor}` }} className="bg-white py-12 text-center">
      <div className="max-w-7xl mx-auto px-6">
        {/* Info pages only — matches the home footer. 'Curriculum' lives in the
            bottom bar as 'Learn', so it is not repeated here. */}
        <div className="flex justify-center gap-8 flex-wrap mb-6">
          {[
            { label: 'About', to: '/about', ariaLabel: undefined },
            { label: 'Parent Guide', to: '/parents', ariaLabel: undefined },
            { label: 'Privacy', to: '/privacy', ariaLabel: undefined },
            { label: 'Contact', to: '/contact', ariaLabel: undefined },
          ].map(link => (
            <Link key={link.label} to={link.to} aria-label={link.ariaLabel} className="text-gray-600 text-sm font-semibold hover:text-indigo-600 no-underline">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          © 2026 Math Adventure RPG{edition ? ` – ${edition}` : ''}. All rights reserved.<br />
          Built with ❤️ for kids who love math (and those who are learning to).
        </p>
        {/* Ecosystem attribution — links out to the umbrella platform. */}
        <p className="text-xs text-gray-400 mt-4">
          <a
            href="https://peoples-home-web.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hover:text-indigo-600"
          >
            ⌂ Part of The People's Home
          </a>
        </p>
      </div>
    </footer>
  );
}
