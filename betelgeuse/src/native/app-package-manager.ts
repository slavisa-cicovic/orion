import { NativeModules, Platform } from "react-native";

type AppPackageManagerNativeModule = {
  isAppInstalled(packageName: string): Promise<boolean>;
};

const nativeModule = NativeModules.AppPackageManager as
  | AppPackageManagerNativeModule
  | undefined;

export async function isAndroidAppInstalled(
  packageName: string,
): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  if (!packageName || !nativeModule?.isAppInstalled) return false;

  try {
    const r = await nativeModule.isAppInstalled(packageName);
    return r;
  } catch {
    return false;
  }
}
