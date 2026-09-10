import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../constants/theme';

export type IconName = 'arrow' | 'back' | 'plus' | 'close' | 'check' | 'bell' | 'list' | 'clock';
export function Icon({ name, size = 22, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {name === 'arrow' && <Path d="M4 12h15m-6-6 6 6-6 6" />}
    {name === 'back' && <Path d="m14 6-6 6 6 6" />}
    {name === 'plus' && <Path d="M12 5v14M5 12h14" />}
    {name === 'close' && <Path d="m7 7 10 10M17 7 7 17" />}
    {name === 'check' && <Path d="m5 12 4.5 4.5L19 7" />}
    {name === 'bell' && <><Path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /><Path d="M12 2V1" /></>}
    {name === 'list' && <><Rect x="4" y="3" width="16" height="18" rx="4" /><Path d="m7 9 1 1 2-2m-3 7 1 1 2-2M13 9h4m-4 6h4" /></>}
    {name === 'clock' && <><Circle cx="12" cy="12" r="9" /><Path d="M12 7v5l3 2" /></>}
  </Svg>;
}
