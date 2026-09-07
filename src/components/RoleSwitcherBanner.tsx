import { User, Users, Shield, Store, Clock } from 'lucide-react';
import { User as UserType } from '../types';

interface RoleSwitcherBannerProps {
  currentUser: UserType;
  onSwitchUser: (userId: string) => void;
}

export default function RoleSwitcherBanner({
  currentUser,
  onSwitchUser
}: RoleSwitcherBannerProps) {
  const accounts = [
    {
      id: 'user-customer-1',
      name: 'Chioma Adebayo',
      roleLabel: 'Customer',
      tag: 'Customer',
      icon: User,
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'user-vendor-1',
      name: 'Emeka Nwosu (Gadget Express)',
      roleLabel: 'Approved Vendor',
      tag: 'Vendor',
      icon: Store,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'user-vendor-2',
      name: 'Babatunde (Alaba Sound)',
      roleLabel: 'Pending Vendor',
      tag: 'Pending',
      icon: Clock,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'user-admin-1',
      name: 'Kolawole Danjuma',
      roleLabel: 'Platform Admin',
      tag: 'Admin',
      icon: Shield,
      color: 'bg-purple-50 text-purple-800 border-purple-200'
    }
  ];

  return (
    <div id="role-switcher-container" className="bg-slate-900 text-slate-200 px-4 py-2 border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Users className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">MVP Role Simulation:</span>
          <span className="hidden md:inline text-slate-400">Switch user context instantly to test RBAC & workflows:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {accounts.map((acc) => {
            const isActive = currentUser.uid === acc.id;
            const Icon = acc.icon;
            return (
              <button
                key={acc.id}
                id={`switch-user-${acc.id}`}
                onClick={() => onSwitchUser(acc.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  isActive
                    ? 'bg-amber-400 text-purple-950 border-amber-300 shadow-xs ring-2 ring-amber-400/30 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
                }`}
                title={`Switch active demo session to ${acc.name} (${acc.roleLabel})`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{acc.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${isActive ? 'bg-purple-950/20 text-purple-950 font-bold' : 'text-slate-400'}`}>
                  {acc.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
