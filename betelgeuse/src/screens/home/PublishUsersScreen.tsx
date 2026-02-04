import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getPublishUsers,
  publishToSelectedUsers,
  type HomeAppCard,
  type PublishUser,
} from "@src/api/home";
import AppBar from "@src/components/layout/app-bar";
import ApiFeedback from "@src/components/ui/api-feedback";
import { getApiErrorMessage } from "@src/utils/api-error";

const PAGE_SIZE = 50;

type UserSection = {
  title: string;
  data: PublishUser[];
};

export default function PublishUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ appId?: string; appName?: string }>();

  const appId = Number(params.appId ?? 0);
  const appName = params.appName ?? "Application";

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PublishUser[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const load = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!appId || Number.isNaN(appId)) {
        setError("Invalid app id.");
        setLoading(false);
        return;
      }

      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await getPublishUsers(appId, {
          page: targetPage,
          pageSize: PAGE_SIZE,
          search: search.trim() || undefined,
        });

        setItems((prev) => (append ? [...prev, ...response.items] : response.items));
        setPage(response.page);
        setTotal(response.total);

        if (!append) {
          setSelectedIds(new Set());
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load users"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [appId, search],
  );

  useFocusEffect(
    useCallback(() => {
      void load(0, false);
    }, [load, search]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const canLoadMore = items.length < total;

  const onLoadMore = useCallback(() => {
    if (loadingMore || !canLoadMore) return;
    void load(page + 1, true);
  }, [canLoadMore, load, loadingMore, page]);

  const onToggle = useCallback((user: PublishUser) => {
    if (user.published) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(user.userId)) {
        next.delete(user.userId);
      } else {
        next.add(user.userId);
      }
      return next;
    });
  }, []);

  const onSelectAllVisible = useCallback(() => {
    const selectableIds = items.filter((item) => !item.published).map((item) => item.userId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selectableIds.forEach((id) => next.add(id));
      return next;
    });
  }, [items]);

  const onPublish = useCallback(async () => {
    const targetIds = items
      .filter((item) => selectedIds.has(item.userId) && !item.published)
      .map((item) => item.userId);

    if (!targetIds.length) return;

    try {
      setPublishing(true);
      setError(null);
      const updated: HomeAppCard = await publishToSelectedUsers(appId, targetIds);
      if (updated.appId > 0) {
        router.back();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to publish to selected users"));
    } finally {
      setPublishing(false);
    }
  }, [appId, items, load, router, selectedIds]);

  const sections = useMemo<UserSection[]>(() => {
    const pilots = items.filter((item) => item.pilotUser);
    const others = items.filter((item) => !item.pilotUser);

    const output: UserSection[] = [];
    if (pilots.length) {
      output.push({ title: `Pilot users (${pilots.length})`, data: pilots });
    }
    if (others.length) {
      output.push({ title: `Company users (${others.length})`, data: others });
    }
    return output;
  }, [items]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <AppBar title={`Publish users - ${appName}`} />
      <SectionList
        sections={loading ? [] : sections}
        keyExtractor={(item) => String(item.userId)}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => {
          const checked = selectedIds.has(item.userId);
          return (
            <Pressable
              style={[styles.row, item.published ? styles.rowPublished : null]}
              onPress={() => onToggle(item)}
              disabled={item.published}
            >
              {!item.published ? <Text style={styles.checkbox}>{checked ? "[x]" : "[ ]"}</Text> : null}
              <View style={styles.rowTextWrap}>
                <Text style={styles.nameText}>{`${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || "-"}</Text>
                <Text style={styles.emailText}>{item.email}</Text>
                <Text style={styles.metaText}>
                  Latest published version: {item.latestPublishedVersionName ?? "-"}
                </Text>
                <Text style={styles.metaText}>
                  Installed: {item.installed == null ? "Unknown" : item.installed ? "Yes" : "No"}
                </Text>
              </View>
              {item.published ? <Text style={styles.publishedTag}>Published</Text> : null}
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <>
            <ApiFeedback message={error} />
            <View style={styles.searchWrap}>
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Search by name or email"
                style={styles.searchInput}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryBtn} onPress={onSelectAllVisible}>
                <Text style={styles.secondaryBtnText}>Select all loaded</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, (selectedCount === 0 || publishing) ? styles.btnDisabled : null]}
                onPress={() => void onPublish()}
                disabled={selectedCount === 0 || publishing}
              >
                <Text style={styles.primaryBtnText}>
                  {publishing ? "Publishing..." : `Publish selected (${selectedCount})`}
                </Text>
              </Pressable>
            </View>
            {loading ? (
              <View style={styles.centerWrap}>
                <ActivityIndicator />
              </View>
            ) : null}
          </>
        }
        ListFooterComponent={
          canLoadMore ? (
            <Pressable
              style={[styles.secondaryBtn, styles.loadMoreBtn, loadingMore ? styles.btnDisabled : null]}
              onPress={onLoadMore}
              disabled={loadingMore}
            >
              <Text style={styles.secondaryBtnText}>{loadingMore ? "Loading..." : "Load more"}</Text>
            </Pressable>
          ) : (
            <View style={{ height: Math.max(20, insets.bottom) }} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centerWrap}>
              <Text style={styles.emptyText}>No users found.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f7ff" },
  listContent: { padding: 20, paddingBottom: 32 },
  searchWrap: { marginBottom: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d6ddef",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#2b4cff",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#c9d2ef",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryBtnText: { color: "#233355", fontWeight: "600" },
  btnDisabled: { opacity: 0.6 },
  centerWrap: { paddingVertical: 20, alignItems: "center" },
  emptyText: { color: "#5f6f92" },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "700",
    color: "#24355a",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e6f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  rowPublished: {
    opacity: 0.75,
  },
  checkbox: {
    width: 34,
    color: "#20345a",
    fontWeight: "700",
  },
  rowTextWrap: { flex: 1 },
  nameText: { color: "#1f3152", fontWeight: "600" },
  emailText: { color: "#61739b", marginTop: 2, fontSize: 12 },
  metaText: { color: "#61739b", marginTop: 1, fontSize: 11 },
  publishedTag: {
    color: "#0c7f32",
    fontSize: 12,
    fontWeight: "700",
  },
  loadMoreBtn: {
    marginTop: 6,
    marginBottom: 20,
  },
});
