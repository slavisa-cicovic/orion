import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

type LinkButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export default function LinkButton({ label, onPress, style }: LinkButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 12 },
  text: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
});
