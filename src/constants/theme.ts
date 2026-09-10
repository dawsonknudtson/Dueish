import { Platform } from 'react-native';

export const colors = {
  ink: '#172C43', muted: '#697889', blue: '#B8DCFA', blueDark: '#275E89',
  pale: '#EFF7FE', border: '#E5ECF2', white: '#FFFFFF', error: '#A23E3E',
};
// System resolves to San Francisco on iOS without bundling licensed font files.
export const fontFamily = Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : 'System';
