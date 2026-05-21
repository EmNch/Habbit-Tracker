'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import type { BudgetInsight } from '@/lib/types';

interface BudgetInsightsProps {
  insights: BudgetInsight[];
}

const SEVERITY_STYLES: Record<BudgetInsight['severity'], { bg: string; text: string; icon: string }> = {
  ok: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', icon: '✓' },
  caution: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', icon: '⚠' },
  warning: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', icon: '⚠' },
  critical: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', icon: '✗' },
};

export const BudgetInsights = React.memo(function BudgetInsights({ insights }: BudgetInsightsProps) {
  const alerts = insights.filter((i) => i.severity !== 'ok');

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Insights
      </h2>

      {alerts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-600 dark:text-green-400">
              Toate categoriile sunt în limite normale
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((insight) => {
            const style = SEVERITY_STYLES[insight.severity];
            return (
              <div
                key={insight.category_id}
                className={`rounded-xl border border-gray-200 dark:border-gray-700 p-3 ${style.bg}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">{insight.category_icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${style.text}`}>
                      {insight.category_name}
                    </p>
                    {insight.projected_overspend_cents > 0 ? (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Ritmul actual: vei depăși bugetul cu ~{formatCents(insight.projected_overspend_cents)} RON
                      </p>
                    ) : insight.days_until_limit !== null ? (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Bugetul se va epuza în ~{insight.days_until_limit} zile
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Buget depășit
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                    {insight.severity === 'caution' ? 'Atenție' :
                     insight.severity === 'warning' ? 'Risc' : 'Critic'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
