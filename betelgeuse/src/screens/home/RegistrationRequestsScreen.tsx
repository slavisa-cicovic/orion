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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getPendingRegistrationRequests,
  processRegistrationRequest,
  type RegistrationRequestItem,
} from "@src/api/registration-requests";
import AppBar from "@src/components/layout/app-bar";
import ApiFeedback from "@src/components/ui/api-feedback";
import { getApiErrorMessage } from "@src/utils/api-error";

const PAGE_SIZE = 50;

type RequestSection = {
  title: string;
  data: RegistrationRequestItem[];
};

function formatRequestedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString();
}

export default function RegistrationRequestsScreen() {
  const insets = useSafeAreaInsets();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RegistrationRequestItem[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (targetPage: number, append: boolean) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await getPendingRegistrationRequests({
        page: targetPage,
        pageSize: PAGE_SIZE,
        search: search.trim() || undefined,
      });

      setItems((prev) => (append ? [...prev, ...response.items] : response.items));
      setPage(response.page);
      setTotal(response.total);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load registration requests"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      void load(0, false);
    }, [load]),
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

  const onDecision = useCallback(async (requestId: number, approve: boolean, pilotUser = false) => {
    try {
      setProcessingId(requestId);
      setError(null);
      await processRegistrationRequest(requestId, { approve, pilotUser });
      setItems((prev) => prev.filter((item) => item.id !== requestId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to process request"));
    } finally {
      setProcessingId(null);
    }
  }, []);

  const sections = useMemo<RequestSection[]>(() => [{ title: `Pending (${total})`, data: items }], [items, total]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <AppBar title="Registration requests" />
      <SectionList
        sections={loading ? [] : sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => {
          const isBusy = processingId === item.id;
          const fullName = `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || "-";
          return (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.nameText}>{fullName}</Text>
                <Text style={styles.emailText}>{item.email}</Text>
                {item.phone ? <Text style={styles.phoneText}>{item.phone}</Text> : null}
                <Text style={styles.metaText}>Requested: {formatRequestedAt(item.requestedAt)}</Text>
              </View>

              <View style={styles.actionsWrap}>
                <Pressable
                  style={[styles.approveBtn, isBusy ? styles.btnDisabled : null]}
                  onPress={() => void onDecision(item.id, true, false)}
                  disabled={isBusy}
                >
                  <Text style={styles.approveBtnText}>Approve</Text>
                </Pressable>

                <Pressable
                  style={[styles.pilotBtn, isBusy ? styles.btnDisabled : null]}
                  onPress={() => void onDecision(item.id, true, true)}
                  disabled={isBusy}
                >
                  <Text style={styles.pilotBtnText}>Approve + Pilot</Text>
                </Pressable>

                <Pressable
                  style={[styles.rejectBtn, isBusy ? styles.btnDisabled : null]}
                  onPress={() => void onDecision(item.id, false)}
                  disabled={isBusy}
                >
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={
          <>
            <ApiFeedback message={error} />
            <View style={styles.searchWrap}>
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Search by name, email, phone"
                style={styles.searchInput}
                autoCapitalize="none"
              />
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
              style={[styles.loadMoreBtn, loadingMore ? styles.btnDisabled : null]}
              onPress={onLoadMore}
              disabled={loadingMore}
            >
              <Text style={styles.loadMoreBtnText}>{loadingMore ? "Loading..." : "Load more"}</Text>
            </Pressable>
          ) : (
            <View style={{ height: Math.max(20, insets.bottom) }} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centerWrap}>
              <Text style={styles.emptyText}>No pending requests.</Text>
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
  centerWrap: { paddingVertical: 20, alignItems: "center" },
  emptyText: { color: "#5f6f92" },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "700",
    color: "#24355a",
  },
  row: {
    borderWidth: 1,
    borderColor: "#e0e6f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    gap: 10,
  },
  rowInfo: { gap: 2 },
  nameText: { color: "#1f3152", fontWeight: "700" },
  emailText: { color: "#61739b", fontSize: 12 },
  phoneText: { color: "#61739b", fontSize: 12 },
  metaText: { color: "#7c8cb0", fontSize: 11, marginTop: 2 },
  actionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  approveBtn: {
    backgroundColor: "#1f8f52",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  approveBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  pilotBtn: {
    backgroundColor: "#2b4cff",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  pilotBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  rejectBtn: {
    backgroundColor: "#fff0f0",
    borderWidth: 1,
    borderColor: "#e5a7a7",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  rejectBtnText: { color: "#a53f3f", fontWeight: "700", fontSize: 12 },
  btnDisabled: { opacity: 0.6 },
  loadMoreBtn: {
    borderWidth: 1,
    borderColor: "#c9d2ef",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 6,
    marginBottom: 20,
  },
  loadMoreBtnText: { color: "#233355", fontWeight: "600" },
});
