// src/components/shop/ShopFilters.tsx
'use client';

import { useState } from 'react';

import { PriceFilter } from './PriceFilter';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { Checkbox } from '@/ui/checkbox';

type Cat = { name: string; subs?: string[] };

const CATS: Cat[] = [
  { name: 'Engine Parts', subs: ['Spark Plugs', 'Air Filters', 'Belts'] },
  { name: 'Brake & Suspension', subs: ['Brake Pads', 'Rotors', 'Shocks'] },
  { name: 'Batteries & Electrical', subs: ['Battery', 'Alternator', 'Lights'] },
  { name: 'Oils & Fluids', subs: ['Engine Oil', 'Brake Fluid'] },
  { name: 'Exhaust & Emissions', subs: ['Catalytic Converter', 'Muffler'] },
  { name: 'Interior Accessories', subs: ['Floor Mats', 'Covers'] },
  { name: 'Tires & Wheels', subs: ['Tires', 'Rims'] },
  { name: 'Cooling & Heating', subs: ['Radiator', 'Thermostat'] },
  { name: 'Tools & Equipments', subs: ['Wrenches', 'Jacks'] },
];

export function ShopFilters() {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggleSelected = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const toggleOpen = (name: string) => setOpen(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div
      role="group"
      aria-label="Filter groups"
      className="border-border/60 bg-card space-y-6 rounded-xl border p-4"
    >
      <div>
        <h2 className="text-foreground text-base font-semibold">Categories</h2>
        <ul className="mt-3 space-y-2">
          {CATS.map(cat => {
            const isOpen = !!open[cat.name];
            const catId = `cat-${cat.name.replace(/\s+/g, '-').toLowerCase()}`;
            const panelId = `${catId}-subs`;
            return (
              <li
                key={cat.name}
                className="rounded-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={catId}
                      checked={selected.includes(cat.name)}
                      onCheckedChange={() => toggleSelected(cat.name)}
                    />
                    <label
                      htmlFor={catId}
                      className="cursor-pointer text-sm"
                    >
                      {cat.name}
                    </label>
                  </div>

                  {cat.subs?.length ? (
                    <button
                      type="button"
                      aria-label={`Toggle ${cat.name} subcategories`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleOpen(cat.name)}
                      className="hover:bg-muted/60 grid h-7 w-7 place-items-center rounded-md"
                      title={`Toggle ${cat.name}`}
                    >
                      <ChevronDown
                        className={`text-foreground/60 h-4 w-4 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                    </button>
                  ) : (
                    <span
                      className="h-7 w-7"
                      aria-hidden
                      role="presentation"
                    />
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && cat.subs && (
                    <motion.ul
                      id={panelId}
                      role="group"
                      aria-label={`${cat.name} subcategories`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 ml-6 space-y-2 overflow-hidden"
                    >
                      {cat.subs.map(sub => {
                        const sid = `${catId}--${sub.replace(/\s+/g, '-').toLowerCase()}`;
                        const val = `${cat.name} › ${sub}`;
                        return (
                          <li
                            key={sid}
                            className="flex items-center"
                          >
                            <Checkbox
                              id={sid}
                              checked={selected.includes(val)}
                              onCheckedChange={() => toggleSelected(val)}
                            />
                            <label
                              htmlFor={sid}
                              className="text-foreground/80 ml-2 cursor-pointer text-sm"
                            >
                              {sub}
                            </label>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      <PriceFilter />
    </div>
  );
}
