import React from 'react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Rating } from '../../components/ui/Rating';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Tabs } from '../../components/ui/Tabs';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export const BrandGuidePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-left text-slate-900 space-y-16">
      {/* Brand Header */}
      <div className="border-b border-slate-200 pb-8">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
          Design System & Brand Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-slate-950">
          Prajnadhara EDU Brand & Component Specification
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-3xl leading-relaxed">
          Inspired by the Sanskrit concept of uninterrupted wisdom (<em>Prajna</em> + <em>Dhara</em>), this design system establishes a quiet, confident, enterprise-grade aesthetic. It rejects AI slop, gradients, neon glows, and pill enclosures in favor of typographic rigor, hairline 1px borders, and disciplined functional color.
        </p>
      </div>

      {/* 1. Logo & Mark Concept */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display text-slate-950 border-b border-slate-200 pb-2">
          01. Logo Wordmark & Emblem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 border border-slate-200 rounded bg-white flex flex-col items-center justify-center gap-4">
            <Logo size="lg" />
            <span className="text-xs text-slate-500">Light Surface Wordmark</span>
          </div>
          <div className="p-8 border border-slate-800 rounded bg-slate-950 flex flex-col items-center justify-center gap-4">
            <Logo size="lg" inverted />
            <span className="text-xs text-slate-400">Dark Inverted Wordmark</span>
          </div>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          The emblem unites two universal symbols: an open codex/book at the base in rich timber brown (<code>#533316</code>) and a branching tree with lush foliage in forest emerald (<code>#0D5C3A</code> & <code>#188C5A</code>). It symbolizes knowledge rooted in disciplined craft flourishing into real-world capability.
        </div>
      </section>

      {/* 2. Color System */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display text-slate-950 border-b border-slate-200 pb-2">
          02. Restrained Flat Color Tokens (Zero Gradients)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="h-16 bg-slate-950" />
            <div className="p-2.5">
              <div className="font-bold">Slate 950</div>
              <div className="text-slate-400 text-[10px] font-mono">#020617</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Primary Body & Headings</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="h-16 bg-emerald-800" />
            <div className="p-2.5">
              <div className="font-bold">Emerald 800</div>
              <div className="text-slate-400 text-[10px] font-mono">#065F46</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Brand Accent & CTA</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="h-16 bg-amber-500" />
            <div className="p-2.5">
              <div className="font-bold">Amber 500</div>
              <div className="text-slate-400 text-[10px] font-mono">#F59E0B</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Star Ratings & Badges</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="h-16 bg-slate-100" />
            <div className="p-2.5">
              <div className="font-bold">Slate 100</div>
              <div className="text-slate-400 text-[10px] font-mono">#F1F5F9</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Surface Structural Fill</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="h-16 bg-slate-200" />
            <div className="p-2.5">
              <div className="font-bold">Slate 200</div>
              <div className="text-slate-400 text-[10px] font-mono">#E2E8F0</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Hairline 1px Borders</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="h-16 bg-rose-700" />
            <div className="p-2.5">
              <div className="font-bold">Rose 700</div>
              <div className="text-slate-400 text-[10px] font-mono">#BE123C</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Destructive States</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Typography Hierarchy */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display text-slate-950 border-b border-slate-200 pb-2">
          03. Typography Pairing
        </h2>
        <div className="space-y-4 text-left">
          <div className="p-4 border border-slate-200 rounded bg-white">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Display Headings Face: Outfit (Weights 600, 700)
            </div>
            <div className="text-3xl font-bold font-display text-slate-900">
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
          <div className="p-4 border border-slate-200 rounded bg-white">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Body & UI Prose Face: Plus Jakarta Sans (Weights 400, 500, 600)
            </div>
            <p className="text-sm text-slate-700 leading-relaxed max-w-2xl">
              Prajnadhara EDU pairs clean geometric proportions with humanistic nuances for prolonged reading comfort across technical syllabi, curriculum trees, and code breakdowns.
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded bg-white">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Tabular Numerals: font-variant-numeric: tabular-nums (JetBrains Mono fallback)
            </div>
            <div className="text-sm font-mono tabular-nums text-slate-900">
              ₹1,299.00 · ₹842,000.00 · 32.5h · 94% Distinction · INV-2026-09281
            </div>
          </div>
        </div>
      </section>

      {/* 4. Button Primitives */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display text-slate-950 border-b border-slate-200 pb-2">
          04. Interactive Buttons & Form Controls
        </h2>
        <div className="p-6 border border-slate-200 rounded bg-white space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="primary" size="md">Primary Button</Button>
            <Button variant="secondary" size="md">Secondary Button</Button>
            <Button variant="outline" size="md">Outline Button</Button>
            <Button variant="ghost" size="md">Ghost Button</Button>
            <Button variant="danger" size="md">Danger Button</Button>
            <Button variant="primary" size="md" isLoading>Loading State</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <Input label="Text Input" placeholder="Standard text field" />
            <Select label="Dropdown Select" options={[{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }]} />
            <div className="pt-6">
              <Checkbox label="Functional Checkbox" description="Clean unboxed checkbox control" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Badges & Metadata (Zero-Pill Discipline) */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display text-slate-950 border-b border-slate-200 pb-2">
          05. Badges & Zero-Pill Metadata Discipline
        </h2>
        <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
          <div className="text-xs text-slate-600 mb-2">
            Status Badges (Clean boxed rectangular tags, not oversized candy pills):
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="bestseller">Bestseller</Badge>
            <Badge variant="new">New</Badge>
            <Badge variant="highest-rated">Highest rated</Badge>
            <Badge variant="success">Published</Badge>
            <Badge variant="warning">In Review</Badge>
            <Badge variant="danger">Changes Requested</Badge>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-600 mb-2">
              Informational Metadata (Rendered as unboxed prose with typographic separators):
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Full-Stack Web</span>
              <span aria-hidden="true">·</span>
              <span>All Levels</span>
              <span aria-hidden="true">·</span>
              <span>32.5 Hours</span>
              <span aria-hidden="true">·</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
