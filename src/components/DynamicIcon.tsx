import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function DynamicIcon({ name, className, size = 20 }: DynamicIconProps) {
  // Safe lookup for the icon component
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Fallback icon in case of invalid name
    const Fallback = Icons.HelpCircle;
    return <Fallback className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
}
