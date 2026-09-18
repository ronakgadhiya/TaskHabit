import React from 'react';
import {
  Flame,
  Activity,
  BookOpen,
  Droplets,
  Coffee,
  Smile,
  Sun,
  Moon,
  Dumbbell,
  Brain,
  Code,
  Sparkles,
  Heart,
  Music,
  Target,
  Zap,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  Activity,
  BookOpen,
  Droplets,
  Coffee,
  Smile,
  Sun,
  Moon,
  Dumbbell,
  Brain,
  Code,
  Sparkles,
  Heart,
  Music,
  Target,
  Zap,
  CheckCircle2,
};

interface HabitIconProps {
  name?: string;
  className?: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name = 'Flame', className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
};
