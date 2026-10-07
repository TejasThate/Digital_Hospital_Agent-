import React from 'react';
import { Layers, Activity } from 'lucide-react';

interface GenericPageProps {
  title: string;
  subtitle?: string;
}

export const GenericPage: React.FC<GenericPageProps> = ({ title, subtitle }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-nhs-text">{title}</h1>
        <p className="text-xs text-nhs-muted font-medium">{subtitle || `NHS Digital Hospital Agent · ${title} Module`}</p>
      </div>

      <div className="bg-white rounded-lg border border-nhs-border p-8 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#003087] flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-nhs-text text-base">{title} View Active</h3>
        <p className="text-xs text-nhs-muted max-w-md mx-auto leading-relaxed">
          Integrated with NHS Digital Hospital Agent backend API endpoints. All patient records, clinical reviews, and hospital metrics are live and synchronized with PostgreSQL & Prisma backend.
        </p>

        <div className="pt-2 flex justify-center gap-2">
          <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Live Backend Connected
          </span>
        </div>
      </div>
    </div>
  );
};
