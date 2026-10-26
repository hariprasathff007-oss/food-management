import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Building2,
  HeartHandshake,
  Bike,
  ShieldCheck,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { VolunteerNotification } from '../types/foodRescue';

interface NavbarProps {
  currentRole: 'donor' | 'ngo' | 'volunteer' | 'compliance' | 'impact';
  onRoleChange: (role: 'donor' | 'ngo' | 'volunteer' | 'compliance' | 'impact') => void;
  notifications: VolunteerNotification[];
  onMarkNotificationRead: (id: string) => void;
  onSelectDonationFromNotification: (donationId: string) => void;
  activeRescueCount: number;
  totalMealsRescued: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  notifications,
  onMarkNotificationRead,
  onSelectDonationFromNotification,
  activeRescueCount,
  totalMealsRescued,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <UtensilsCrossed className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                  NourishLoop
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Surplus Food Rescue
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Connecting Donors, Verified NGOs & Certified Volunteer Couriers
              </p>
            </div>
          </div>

          {/* Role Navigation Pills */}
          <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            <button
              onClick={() => onRoleChange('donor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                currentRole === 'donor'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Food Donor</span>
            </button>

            <button
              onClick={() => onRoleChange('ngo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                currentRole === 'ngo'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Verified NGO</span>
            </button>

            <button
              onClick={() => onRoleChange('volunteer')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                currentRole === 'volunteer'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Volunteer Courier</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => onRoleChange('compliance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                currentRole === 'compliance'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety & Compliance</span>
            </button>

            <button
              onClick={() => onRoleChange('impact')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                currentRole === 'impact'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Impact</span>
            </button>
          </nav>

          {/* Notification Bell & Live Stats */}
          <div className="flex items-center gap-3">
            {/* Live Ticker */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {totalMealsRescued.toLocaleString()} Meals Rescued
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-amber-300 font-medium">
                <Clock className="w-3 h-3" />
                {activeRescueCount} Active In-Transit
              </span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                aria-label="View volunteer notifications"
                className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100">
                  <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      Volunteer Dispatch Alerts
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      {unreadCount} new alerts
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No active alerts at this moment.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 transition cursor-pointer hover:bg-slate-800/50 ${
                            !notif.read ? 'bg-slate-800/30' : ''
                          }`}
                          onClick={() => {
                            onMarkNotificationRead(notif.id);
                            onSelectDonationFromNotification(notif.donationId);
                            setShowNotifDropdown(false);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-xs text-white leading-snug">
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            {notif.donorName}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                            <span className="text-emerald-400 font-medium">{notif.servings} Meals</span>
                            <span>•</span>
                            <span>{notif.pickupWindow}</span>
                            <span>•</span>
                            <span>{notif.distanceKm} km away</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 bg-slate-950 border-t border-slate-800 text-center">
                    <button
                      onClick={() => {
                        onRoleChange('volunteer');
                        setShowNotifDropdown(false);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Open Volunteer Dispatch Board →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
