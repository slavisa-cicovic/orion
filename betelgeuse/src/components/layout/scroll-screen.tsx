import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import AppBar from "@src/components/layout/app-bar";

type ScrollScreenProps = {
  title: string;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
  keyboardOffset?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  action?: {
    icon: string;
    onPress: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
  };
};

const CONTENT_PADDING_BOTTOM = 32;

export default function ScrollScreen({
  title,
  children,
  contentContainerStyle,
  keyboardAvoiding = false,
  keyboardOffset = 0,
  refreshing = false,
  onRefresh,
  action,
}: ScrollScreenProps) {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomPadding = CONTENT_PADDING_BOTTOM + tabBarHeight + insets.bottom;

  const scrollContent = (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle, { paddingBottom: bottomPadding }]}
      scrollIndicatorInsets={{ bottom: bottomPadding }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppBar title={title} action={action} />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={keyboardOffset}
        >
          {scrollContent}
        </KeyboardAvoidingView>
      ) : (
        scrollContent
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 20, paddingBottom: CONTENT_PADDING_BOTTOM },
  keyboardContainer: { flex: 1 },
});
