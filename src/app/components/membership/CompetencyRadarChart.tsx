import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { CompetencyProfile } from '@/types/membership';
import { COMPETENCY_LABELS } from '@/types/membership';

interface CompetencyRadarChartProps {
  competencies: CompetencyProfile;
  size?: number;
}

export function CompetencyRadarChart({ competencies, size = 300 }: CompetencyRadarChartProps) {
  const data = (Object.keys(competencies) as (keyof CompetencyProfile)[]).map((key) => ({
    subject: COMPETENCY_LABELS[key],
    value: competencies[key],
    fullMark: 10,
  }));

  return (
    <div style={{ width: '100%', maxWidth: size, margin: '0 auto' }}>
      <ResponsiveContainer width="100%" height={size}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Radar
            name="Kompetencje"
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
