import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import PageHeader from '../../components/PageHeader';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { useGetMyNotesQuery } from '../../features/api/noteApi';
import useTheme from '../../hooks/useTheme';
import { UploadNoteSkeleton } from '../../components/skeletons/HomeSkeletons';


// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CATEGORIES = ['All', 'Approved', 'Pending', 'Rejected'];

const CATEGORY_TO_STATUS = {
    All: undefined,
    Approved: 'published',
    Pending: 'under_review',
    Rejected: 'rejected',
};

const STATUS_CONFIG = {
    PUBLISHED: { label: 'Approved', bg: 'rgba(16,185,129,0.18)', color: '#10B981' },
    APPROVED: { label: 'Approved', bg: 'rgba(16,185,129,0.18)', color: '#10B981' },
    REJECTED: { label: 'Rejected', bg: 'rgba(239,68,68,0.18)', color: '#EF4444' },
    UNDER_REVIEW: { label: 'Pending', bg: 'rgba(245,158,11,0.18)', color: '#F59E0B' },
};
const getStatus = (s) => STATUS_CONFIG[s?.toUpperCase()] ?? STATUS_CONFIG.UNDER_REVIEW;

// ─── Note card ────────────────────────────────────────────────────────────────
const NoteCard = React.memo(({ item }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const s = getStatus(item.status);
    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TopperNoteDetails', { noteId: item._id })}
        >
            <View style={styles.iconBox}>
                <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.cardBody}>
                <AppText style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1} weight="bold">
                    {item.chapterName || item.subject}
                </AppText>
                <AppText style={[styles.cardSub, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {item.subject} • Class {item.class} • {item.board}
                </AppText>
                <View style={styles.cardFooter}>
                    <AppText style={[styles.price, { color: theme.colors.primary }]}>₹{item.price}</AppText>
                    <AppText style={[styles.sales, { color: theme.colors.textMuted }]}>{item.salesCount || 0} Sales</AppText>
                </View>
            </View>
            <View style={[styles.badge, { backgroundColor: s.bg }]}>
                <AppText style={[styles.badgeText, { color: s.color }]}>{s.label}</AppText>
            </View>
        </TouchableOpacity>
    );
});


// ─── Main Screen ──────────────────────────────────────────────────────────────
const MyUploads = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();

    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [timeRange, setTimeRange] = useState('all');
    const [page, setPage] = useState(1);
    const [isSortVisible, setIsSortVisible] = useState(false);

    // Reset page on any filter change
    useEffect(() => { setPage(1); }, [searchQuery, activeCategory, sortBy, timeRange]);

    const queryArgs = useMemo(() => ({
        search: searchQuery || undefined,
        status: CATEGORY_TO_STATUS[activeCategory],
        sortBy,
        page,
        limit: 10,
    }), [searchQuery, activeCategory, sortBy, page]);

    const { data, isFetching, refetch } = useGetMyNotesQuery(queryArgs);

    const notes = data?.notes ?? [];
    const pagination = data?.pagination ?? {};
    const total = pagination.totalNotes ?? 0;

    // Pull-to-refresh
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        try { await refetch().unwrap(); } catch { /* ignore */ }
        finally { setRefreshing(false); }
    }, [refetch]);

    // Infinite scroll
    const handleLoadMore = () => {
        if (page < (pagination.totalPages || 1) && !isFetching) {
            setPage(p => p + 1);
        }
    };

    const isSortActive = sortBy !== 'newest' || timeRange !== 'all';
    // True when a filter/search change triggers a fresh page-1 fetch
    const isFiltering = isFetching && page === 1;

    return (
        <SafeAreaView style={[styles.container, { gap: 10, backgroundColor: theme.colors.background }]} edges={['bottom']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />


            {/* ── Header ── */}
            <PageHeader
                title="My Uploads"
                subtitle={`${total} note${total !== 1 ? 's' : ''} total`}
                onBackPress={() => navigation.goBack()}
            />

            {/* ── Search + Sort (reusable SearchBar with filter button) ── */}
            <SearchBar
                value={localSearch}
                onChangeText={setLocalSearch}
                placeholder="Search by subject or chapter..."
                onFilterPress={() => setIsSortVisible(true)}
                isFilterActive={isSortActive}
                style={styles.searchBar}
            />

            {/* ── Status filter chips (reusable CategoryFilters) ── */}
            <CategoryFilters
                categories={STATUS_CATEGORIES}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                style={styles.filters}
            />

            {/* ── Notes list ── */}
            <View style={styles.listWrapper}>
                <FlatList
                    data={isFiltering ? [] : notes}
                    renderItem={({ item }) => <NoteCard item={item} />}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={[
                        styles.listContent,
                        notes.length === 0 && styles.listEmpty,
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                            colors={[theme.colors.primary]}
                            backgroundColor="transparent"
                        />
                    }

                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        isFiltering ? (
                            <View>
                                {[...Array(6)].map((_, i) => (
                                    <UploadNoteSkeleton key={i} />
                                ))}
                            </View>
                        ) : (
                            <NoDataFound
                                message={
                                    searchQuery
                                        ? `No notes found for "${searchQuery}"`
                                        : 'No notes uploaded yet. Start sharing your knowledge!'
                                }
                                icon="document-text-outline"
                                containerStyle={{ alignSelf: 'center', marginTop: 40 }}
                            />
                        )
                    }
                    ListFooterComponent={
                        isFetching && page > 1
                            ? <ActivityIndicator color="#00B1FC" style={styles.footerLoader} />
                            : null
                    }
                />

            </View>

            {/* ── Sort Modal ── */}
            <SortModal
                visible={isSortVisible}
                onClose={() => setIsSortVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedTime={timeRange}
                onSelectTime={setTimeRange}
            />
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    searchBar: { paddingHorizontal: 20, marginTop: 14, marginBottom: 4 },
    filters: { paddingHorizontal: 20 },

    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    listEmpty: { flex: 1 },
    listWrapper: { flex: 1 },
    footerLoader: { paddingVertical: 20 },

    // Card (background/border set inline via theme)
    card: {
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    iconBox: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(0, 177, 252, 0.07)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    cardBody: { flex: 1 },
    cardTitle: { fontSize: 14, marginBottom: 3 },
    cardSub: { fontSize: 12, marginBottom: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    price: { fontSize: 13, fontWeight: 'bold' },
    sales: { fontSize: 12 },

    badge: {
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8, marginLeft: 10,
        alignSelf: 'flex-start',
    },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
});

export default MyUploads;

