import { StyleSheet, Button, type ButtonProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedButtonProps = ButtonProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default';
};

export function ThemedButton({
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedButtonProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <Button
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
