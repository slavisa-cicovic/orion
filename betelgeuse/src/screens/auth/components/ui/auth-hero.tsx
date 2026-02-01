import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AuthHero() {
  return (
    <View style={styles.heroWrap}>
      <Image source={require("assets/login-screen.png")} style={styles.hero} resizeMode="contain" />
      <LinearGradient
        colors={["rgba(245, 247, 255, 0)", "rgba(245, 247, 255, 1)"]}
        style={styles.heroFade}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(245, 247, 255, 1)", "rgba(245, 247, 255, 0)"]}
        style={styles.heroFadeTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(245, 247, 255, 1)", "rgba(245, 247, 255, 0)"]}
        style={styles.heroFadeLeft}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />
      <LinearGradient
        colors={["rgba(245, 247, 255, 0)", "rgba(245, 247, 255, 1)"]}
        style={styles.heroFadeRight}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: { width: "100%", height: 200, marginTop: 56, marginBottom: 8 },
  hero: { width: "100%", height: "100%" },
  heroFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  heroFadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 70,
  },
  heroFadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  heroFadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
});
