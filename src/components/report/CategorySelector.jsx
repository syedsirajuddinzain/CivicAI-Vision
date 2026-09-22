import React from 'react';
import { Construction, Lightbulb, Droplets, Trash2, HelpCircle } from 'lucide-react';

export const CATEGORIES = [
  {
    id: 'Pothole / Road Damage',
    label: 'Pothole / Road Damage',
    icon: Construction,
    desc: 'Craters, road cracks, collapsed asphalt, speed breaker issues',
  },
  {
    id: 'Streetlight / Electrical Issue',
    label: 'Streetlight / Electrical Issue',
    icon: Lightbulb,
    desc: 'Broken lamps, exposed wiring, dark intersections, flickering posts',
  },
  {
    id: 'Drainage / Wastewater Issue',
    label: 'Drainage / Wastewater Issue',
    icon: Droplets,
    desc: 'Sewage overflow, blocked storm drains, street waterlogging',
  },
  {
    id: 'Garbage / Sanitation Issue',
    label: 'Garbage / Sanitation Issue',
    icon: Trash2,
    desc: 'Uncollected trash piles, overflowing bins, illegal dumping',
  },
  {
    id: 'Other / Unknown',
    label: 'Other / Unknown',
    icon: HelpCircle,
    desc: 'General public infrastructure damage, fallen trees, park repairs',
  },
];

export default function CategorySelector({ selectedCategory, onSelectCategory, isOverrideMode = false }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span>{isOverrideMode ? 'Select Correct Category Manually' : 'Issue Category'}</span>
          {isOverrideMode && (
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md">
              Manual Override
            </span>
          )}
        </label>
        <span className="text-[11px] text-slate-500">5 Supported Types</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/20 text-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">{cat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
