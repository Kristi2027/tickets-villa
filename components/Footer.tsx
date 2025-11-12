import React from 'react';
import { User } from '../types.ts';

interface FooterProps {
    user: User | null;
    onNavigate: (view: string, mode?: string) => void;
    onCreateEvent: () => void;
}

const Footer: React.FC<FooterProps> = ({ user, onNavigate, onCreateEvent }) => {
  // Define which permissions fall under which category
  const organizerPermissions = ['create_event', 'manage_events', 'box_office'];
  const adminPermissions = ['manage_payouts', 'manage_theatres'];

  const FooterLink: React.FC<{ onClick: () => void; children: React.ReactNode; }> = ({ onClick, children }) => (
    <li>
        <button onClick={onClick} className="hover:text-red-600 transition-colors text-left w-full">
            {children}
        </button>
    </li>
  );

  return (
    <footer className="bg-zinc-900/50 border-t border-slate-800 mt-20 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-slate-400">
        <div>
          <h3 className="text-xl font-bold text-slate-100 mb-4">Tickets <span className="text-red-600">Villa</span></h3>
          <p className="text-sm">Discover and create unforgettable experiences. Your one-stop platform for events across India.</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-100 mb-4">For Partners</h4>
          <ul className="space-y-2 text-sm">
            {user?.role === 'organizer' && user.permissions?.includes('create_event') && <FooterLink onClick={onCreateEvent}>Create Event</FooterLink>}
            {user?.role === 'organizer' && user.permissions?.includes('manage_events') && <FooterLink onClick={() => onNavigate('admin', 'events')}>Manage My Events</FooterLink>}
            {user?.role === 'theatre_manager' && <FooterLink onClick={() => onNavigate('theatre_manager')}>Manager Dashboard</FooterLink>}
          </ul>
        </div>
        
        <div>
          {user?.role === 'admin' && (
            <>
              <h4 className="font-semibold text-slate-100 mb-4">For Admins</h4>
              <ul className="space-y-2 text-sm">
                <FooterLink onClick={() => onNavigate('admin', 'events')}>Manage Events</FooterLink>
                <FooterLink onClick={() => onNavigate('admin', 'theatres')}>Manage Theatres</FooterLink>
                <FooterLink onClick={() => onNavigate('admin', 'mobileTheatres')}>Manage Mobile Theatre</FooterLink>
                <FooterLink onClick={() => onNavigate('admin', 'payouts')}>Manage Payouts</FooterLink>
                <FooterLink onClick={() => onNavigate('admin', 'boxoffice')}>Global Box Office</FooterLink>
              </ul>
            </>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-slate-100 mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <p className="text-sm">Social media links coming soon.</p>
          </div>
        </div>
      </div>
       <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Tickets Villa. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;