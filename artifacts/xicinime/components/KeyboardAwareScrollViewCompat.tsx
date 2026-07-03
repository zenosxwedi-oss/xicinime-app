import { ScrollView, ScrollViewProps } from 'react-native';

type Props = ScrollViewProps & {
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
};

// KeyboardProvider dihapus dari root layout — komponen ini sekarang pakai
// ScrollView biasa agar tidak tergantung pada react-native-keyboard-controller
export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: Props) {
  return (
    <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
      {children}
    </ScrollView>
  );
}
