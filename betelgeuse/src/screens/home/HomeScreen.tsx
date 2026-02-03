import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { getHomeApps, type HomeAppCard } from "@src/api/home";
import ScrollScreen from "@src/components/layout/scroll-screen";
import ApiFeedback from "@src/components/ui/api-feedback";
import { API_BASE_URL } from "@src/constants/config";
import { isAndroidAppInstalled } from "@src/native/app-package-manager";
import { getApiErrorMessage } from "@src/utils/api-error";

type DownloadStatus = "NOT_DOWNLOADED" | "DOWNLOADING" | "DOWNLOADED" | "FAILED";

type DownloadEntry = {
  status: DownloadStatus;
  progress: number;
  localUri?: string;
};

function resolveUploadUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
  const normalized = path.replace(/^\/+/, "");
  return `${apiOrigin}/api/uploads/${normalized}`;
}

const DOWNLOAD_STATE_KEY = "betelgeuse.home.download-state";
const DOWNLOAD_DIR = `${FileSystem.documentDirectory ?? ""}downloads/`;

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<HomeAppCard[]>([]);
  const [downloadState, setDownloadState] = useState<Record<string, DownloadEntry>>({});
  const [installedPackages, setInstalledPackages] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const appsRef = useRef<HomeAppCard[]>([]);

  const versionKey = useCallback((app: HomeAppCard) => `${app.appId}:${app.versionName}`, []);

  const loadDownloadState = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(DOWNLOAD_STATE_KEY);
      if (!raw) {
        setDownloadState({});
        return;
      }
      setDownloadState(JSON.parse(raw) as Record<string, DownloadEntry>);
    } catch {
      setDownloadState({});
    }
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(DOWNLOAD_STATE_KEY, JSON.stringify(downloadState)).catch(() => undefined);
  }, [downloadState]);

  useEffect(() => {
    appsRef.current = apps;
  }, [apps]);

  const refreshInstalledPackages = useCallback(async (sourceApps: HomeAppCard[]) => {
    if (Platform.OS !== "android") {
      setInstalledPackages({});
      return;
    }

    if (!sourceApps.length) {
      setInstalledPackages({});
      return;
    }

    const checks = await Promise.all(
      sourceApps.map(async (app) => [app.appPackageName, await isAndroidAppInstalled(app.appPackageName)] as const),
    );
    setInstalledPackages(Object.fromEntries(checks));
  }, []);

  const loadApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHomeApps();
      setApps(data);
      await refreshInstalledPackages(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load apps"));
    } finally {
      setLoading(false);
    }
  }, [refreshInstalledPackages]);

  useFocusEffect(
    useCallback(() => {
      void loadDownloadState();
      void loadApps();

      const checkInstalled = () => {
        void refreshInstalledPackages(appsRef.current);
      };

      const intervalId = setInterval(checkInstalled, 10_000);
      const appStateSub = AppState.addEventListener("change", (state: AppStateStatus) => {
        if (state === "active") {
          checkInstalled();
        }
      });

      return () => {
        clearInterval(intervalId);
        appStateSub.remove();
      };
    }, [loadApps, loadDownloadState, refreshInstalledPackages]),
  );

  const ensureDownloadDir = useCallback(async () => {
    if (!FileSystem.documentDirectory) {
      throw new Error("App documents directory is unavailable");
    }
    const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
    }
  }, []);

  const setEntry = useCallback((key: string, entry: DownloadEntry) => {
    setDownloadState((prev) => ({ ...prev, [key]: entry }));
  }, []);

  const getEntry = useCallback(
    (app: HomeAppCard): DownloadEntry => downloadState[versionKey(app)] ?? { status: "NOT_DOWNLOADED", progress: 0 },
    [downloadState, versionKey],
  );

  const downloadApp = useCallback(async (app: HomeAppCard) => {
    const key = versionKey(app);
    const remoteUrl = resolveUploadUrl(app.downloadUrl);

    if (!remoteUrl) {
      Alert.alert("Download", "Download URL is not available.");
      return;
    }

    try {
      await ensureDownloadDir();
      setEntry(key, { status: "DOWNLOADING", progress: 0 });

      const extension = remoteUrl.toLowerCase().includes(".ipa") ? "ipa" : "apk";
      const safeVersion = app.versionName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const targetFile = `${DOWNLOAD_DIR}${app.appId}-${safeVersion}.${extension}`;

      const downloader = FileSystem.createDownloadResumable(
        remoteUrl,
        targetFile,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (!totalBytesExpectedToWrite) return;
          const progress = totalBytesWritten / totalBytesExpectedToWrite;
          setEntry(key, { status: "DOWNLOADING", progress });
        },
      );

      const result = await downloader.downloadAsync();
      if (!result?.uri) {
        setEntry(key, { status: "FAILED", progress: 0 });
        throw new Error("Download failed");
      }

      setEntry(key, { status: "DOWNLOADED", progress: 1, localUri: result.uri });
    } catch (err) {
      setEntry(key, { status: "FAILED", progress: 0 });
      setError(getApiErrorMessage(err, "Failed to download app"));
    }
  }, [ensureDownloadDir, setEntry, versionKey]);

  const installApp = useCallback(async (app: HomeAppCard) => {
    const entry = getEntry(app);
    if (!entry.localUri) {
      Alert.alert("Install", "Downloaded file is not available.");
      return;
    }

    if (Platform.OS === "android") {
      try {
        const contentUri = await FileSystem.getContentUriAsync(entry.localUri);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "application/vnd.android.package-archive",
        });
      } catch (err) {
        try {
          await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.MANAGE_UNKNOWN_APP_SOURCES,
          );
          Alert.alert(
            "Install permission required",
            "Enable install from unknown apps for Betelgeuse, then try Install again.",
          );
        } catch {
          setError(getApiErrorMessage(err, "Failed to start installer"));
        }
      }
      return;
    }

    Alert.alert("Install", "IPA install flow will be implemented separately for iOS.");
  }, [getEntry]);

  const onGetOrInstall = useCallback(async (app: HomeAppCard) => {
    if (installedPackages[app.appPackageName]) {
      return;
    }

    const entry = getEntry(app);
    if (entry.status === "DOWNLOADED") {
      await installApp(app);
      return;
    }
    await downloadApp(app);
  }, [downloadApp, getEntry, installApp, installedPackages]);

  const onOpenPublishUsers = useCallback((app: HomeAppCard) => {
    router.push({
      pathname: "/publish-users",
      params: {
        appId: String(app.appId),
        appName: app.appName,
      },
    });
  }, [router]);

  const appCards = useMemo(
    () =>
      apps.map((app) => {
        const entry = getEntry(app);
        const isInstalled = installedPackages[app.appPackageName] === true;
        const buttonLabel =
          isInstalled
            ? "Installed"
            : entry.status === "DOWNLOADING"
            ? `Downloading ${Math.floor(entry.progress * 100)}%`
            : entry.status === "DOWNLOADED"
              ? "Install"
              : "Get";
        const buttonDisabled = isInstalled || entry.status === "DOWNLOADING";

        return (
          <View key={app.appId} style={styles.card}>
            <View style={styles.cardHeader}>
              {app.appIconUrl ? (
                <Image source={{ uri: resolveUploadUrl(app.appIconUrl) }} style={styles.icon} />
              ) : (
                <View style={[styles.icon, styles.iconPlaceholder]}>
                  <Text style={styles.iconPlaceholderText}>{app.appName.slice(0, 1).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.headerTextWrap}>
                <Text style={styles.appName}>{app.appName}</Text>
                <Text style={styles.version}>Version: {app.versionName}</Text>
                <Text style={styles.status}>
                  Published users: {app.publishedToUsersCount}/{app.totalCompanyUsers}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{app.appDescription || "No description"}</Text>

            <View style={styles.actions}>
              <Pressable
                style={[styles.secondaryBtn, buttonDisabled ? styles.btnDisabled : null]}
                onPress={() => void onGetOrInstall(app)}
                disabled={buttonDisabled}
              >
                <Text style={styles.secondaryBtnText}>{buttonLabel}</Text>
              </Pressable>

              {app.canPublishToCompanyUsers ? (
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => onOpenPublishUsers(app)}
                >
                  <Text style={styles.primaryBtnText}>Publish to users</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      }),
    [apps, getEntry, installedPackages, onGetOrInstall, onOpenPublishUsers],
  );

  return (
    <ScrollScreen title="Home">
      <ApiFeedback message={error} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
        </View>
      ) : null}

      {!loading && apps.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No apps available.</Text>
        </View>
      ) : null}

      {!loading ? appCards : null}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { paddingVertical: 24, alignItems: "center" },
  emptyWrap: { paddingVertical: 20, alignItems: "center" },
  emptyText: { color: "#5a6b95", fontSize: 14 },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e6f3",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  iconPlaceholder: {
    backgroundColor: "#dbe4fb",
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlaceholderText: {
    color: "#304a92",
    fontWeight: "700",
  },
  headerTextWrap: { flex: 1 },
  appName: { fontSize: 16, fontWeight: "700", color: "#1f2a44" },
  version: { color: "#4f5f86", fontSize: 12, marginTop: 2 },
  status: { color: "#2f8f5b", fontSize: 12, marginTop: 2, fontWeight: "600" },
  description: { color: "#4f5f86", fontSize: 13, marginTop: 10, marginBottom: 10 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  secondaryBtn: {
    backgroundColor: "#f2f5fe",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d9e1f6",
  },
  secondaryBtnText: {
    color: "#334a85",
    fontWeight: "600",
    fontSize: 12,
  },
  primaryBtn: {
    backgroundColor: "#3b6fb6",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  btnDisabled: {
    opacity: 0.7,
  },
});
