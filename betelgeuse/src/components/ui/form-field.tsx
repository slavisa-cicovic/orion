import { StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  secureTextEntry?: boolean;
  returnKeyType?: "next" | "done";
  inputRef?: React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  error?: string;
};

export default function FormField({
  label,
  value,
  onChange,
  iconName,
  placeholder,
  keyboardType,
  secureTextEntry,
  returnKeyType,
  inputRef,
  onSubmitEditing,
  error,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        {iconName ? <MaterialCommunityIcons name={iconName} size={18} color="#6b7aa6" /> : null}
        <View style={styles.inputBody}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            ref={inputRef}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="#a8b3d1"
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            autoCapitalize="none"
          />
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { width: "100%", marginBottom: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    shadowColor: "#1b2a4e",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputBody: { flex: 1 },
  label: { color: "#5a6b95", fontSize: 12, fontWeight: "600" },
  input: {
    paddingVertical: 4,
    color: "#2b3a67",
    fontSize: 15,
  },
  inputError: { borderColor: "#ef233c" },
  errorText: { color: "#ef233c", fontSize: 12, marginTop: 4 },
});
