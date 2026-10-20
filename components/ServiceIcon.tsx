import { BatteryCharging, Car, KeyRound, Paintbrush, Settings, Ship, Snowflake, Wrench, Zap, CircleDot } from 'lucide-react';

export default function ServiceIcon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  const Icon = /بطاري|batter/i.test(name) ? BatteryCharging
    : /تواير|بنشر|tyre|tire|puncture/i.test(name) ? CircleDot
    : /مفاتيح|keys|locks/i.test(name) ? KeyRound
    : /تكييف|مكيف|ac-repair/i.test(name) ? Snowflake
    : /طراريد|طراد|boat/i.test(name) ? Ship
    : /مولد|generator/i.test(name) ? Settings
    : /كهرب|electric/i.test(name) ? Zap
    : /دهان|صبغ|ديكور|body|paint/i.test(name) ? Paintbrush
    : /ميكانيك|تصليح|mechanic|repair/i.test(name) ? Wrench
    : Car;

  return <Icon className={className} strokeWidth={1.8} aria-hidden="true" />;
}
