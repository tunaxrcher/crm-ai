"use client";

import { Stat } from "../types";
import { ReactNode } from "react";

interface StatDisplayProps {
  stats: Stat;
  getStatIcon: (stat: string) => ReactNode;
}

export default function StatDisplay({ stats, getStatIcon }: StatDisplayProps) {
  return (
    <div className="stats-container">
      {Object.entries(stats).map(([stat, value]) => (
        <div key={stat} className="stat-item">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-1 relative">
            {getStatIcon(stat)}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-card flex items-center justify-center text-xs font-semibold border border-border">
              {value}
            </div>
          </div>
          <span className="text-xs font-medium">{stat}</span>
        </div>
      ))}
    </div>
  );
}
