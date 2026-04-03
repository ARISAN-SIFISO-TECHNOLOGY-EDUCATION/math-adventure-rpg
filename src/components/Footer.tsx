import { Link } from 'react-router-dom';

type FooterProps = {
  edition?: string;
  borderColor?: string;
};

export default function Footer({ edition, borderColor = '#E5E7EB' }: FooterProps) {
  return (
    <footer style={{ borderTop: `1px solid ${borderColor}` }} className="bg-white py-12 text-center">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center gap-8 flex-wrap mb-6">
          {[
            { label: 'Privacy Policy', to: '#' },
            { label: 'Parent Guide', to: '#' },
            { label: 'Curriculum Details', to: '#' },
            { label: 'Contact', to: '#' },
          ].map(link => (
            <Link key={link.label} to={link.to} className="text-gray-400 text-sm hover:text-indigo-600 no-underline">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-gray-300">
          © 2026 Math Adventure RPG{edition ? ` – ${edition}` : ''}. All rights reserved.<br />
          Built with ❤️ for kids who love math (and those who are learning to).
        </p>
      </div>
    </footer>
  );
}
