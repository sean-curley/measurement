import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default';
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <TextInput
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        style,
      ]}
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
