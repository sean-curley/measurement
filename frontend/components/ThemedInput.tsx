import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedInputProps = PaperTextInputProps & {
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
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <PaperTextInput
      mode="outlined"
      style={[
        { backgroundColor },
        type === 'default' ? styles.default : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    marginBottom: 16,
  },
});
