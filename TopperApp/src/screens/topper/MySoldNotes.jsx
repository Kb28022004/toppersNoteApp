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
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import PageHeader from '../../components/PageHeader';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { useGetMySalesDetailsQuery } from '../../features/api/noteApi';
import useTheme from '../../hooks/useTheme';
import { SoldNoteSkeleton } from '../../components/skeletons/HomeSkeletons';

// ─── Note card ────────────────────────────────────────────────────────────────
const SoldNoteCard = React.memo(({ item }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const cardStyles = useMemo(() => ({
        card: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        cardTitle: { color: theme.colors.text, fontSize: 15, marginBottom: 4 },
        cardSub: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 10 },
        statText: { color: theme.colors.textSubtle, fontSize: 12 },
    }), [theme]);

    return (
        <TouchableOpacity
            style={cardStyles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TopperNoteDetails', { noteId: item.noteId })}
        >
            <View style={styles.iconBox}>
                <Ionicons name="cart-outline" size={22} color={theme.colors.success} />
            </View>
            <View style={styles.cardBody}>
                <AppText style={cardStyles.cardTitle} numberOfLines={1} weight="bold">
                    {item.chapterName || item.subject}
                </AppText>
                <AppText style={cardStyles.cardSub} numberOfLines={1}>
                    {item.subject} • Class {item.class}
                </AppText>
                <View style={styles.cardFooter}>
                    <View style={styles.footerStat}>
                        <Ionicons name="people-outline" size={14} color={theme.colors.textMuted} />
                        <AppText style={cardStyles.statText}>{item.totalSales || 0} Buyers</AppText>
                    </View>
                    <View style={styles.footerStat}>
                        <Ionicons name="wallet-outline" size={14} color={theme.colors.success} />
                        <AppText style={[cardStyles.statText, { color: theme.colors.success, fontWeight: 'bold' }]}>
                            ₹{item.revenue || 0}
                        </AppText>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
        </TouchableOpacity>
    );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MySoldNotes = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [sortBy, setSortBy] = useState('newest');
    const [timeRange, setTimeRange] = useState('all');
    const [page, setPage] = useState(1);
    const [isSortVisible, setIsSortVisible] = useState(false);

    useEffect(() => { setPage(1); }, [searchQuery, sortBy, timeRange]);

    const queryArgs = useMemo(() => ({
        search: searchQuery || undefined,
        sortBy,
        timeRange: timeRange || undefined,
        page,
        limit: 10,
    }), [searchQuery, sortBy, timeRange, page]);

    const { data, isFetching, refetch } = useGetMySalesDetailsQuery(queryArgs);

    const notes = data?.notes ?? [];
    const pagination = data?.pagination ?? {};
    const summary = data?.summary ?? {};

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        try { await refetch().unwrap(); } catch { /* ignore */ }
        finally { setRefreshing(false); }
    }, [refetch]);

    const handleLoadMore = () => {
        if (page < (pagination.totalPages || 1) && !isFetching) {
            setPage(p => p + 1);
        }
    };

    const isSortActive = sortBy !== 'newest';
    const isFiltering = isFetching && page === 1;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <PageHeader
                title="My Sold Notes"
                subtitle={`₹${summary.totalRevenue || 0} Total Revenue • ${summary.totalSales || 0} Sales`}
                onBackPress={() => navigation.goBack()}
            />

            <SearchBar
                value={localSearch}
                onChangeText={setLocalSearch}
                placeholder="Search sold notes..."
                onFilterPress={() => setIsSortVisible(true)}
                isFilterActive={isSortActive}
                style={styles.searchBar}
            />

            <View style={styles.listWrapper}>
                <FlatList
                    data={isFiltering ? [] : notes}
                    renderItem={({ item }) => <SoldNoteCard item={item} />}
                    keyExtractor={(item) => item.noteId}
                    contentContainerStyle={[
                        styles.listContent,
                        notes.length === 0 && styles.listEmpty,
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.success}
                            colors={[theme.colors.success]}
                            backgroundColor="transparent"
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        isFiltering ? (
                            <View>
                                {[...Array(6)].map((_, i) => (
                                    <SoldNoteSkeleton key={i} />
                                ))}
                            </View>
                        ) : (
                            <NoDataFound
                                message={
                                    searchQuery
                                        ? `No sold notes found for "${searchQuery}"`
                                        : "No notes sold yet. They'll appear here once purchased!"
                                }
                                icon="cart-outline"
                                containerStyle={{ alignSelf: 'center', marginTop: 40 }}
                            />
                        )
                    }
                    ListFooterComponent={
                        isFetching && page > 1
                            ? <ActivityIndicator color={theme.colors.primary} style={styles.footerLoader} />
                            : null
                    }
                />
            </View>

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

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchBar: { paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    listEmpty: { flex: 1 },
    listWrapper: { flex: 1 },
    footerLoader: { paddingVertical: 20 },
    iconBox: {
        width: 46, height: 46, borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    cardBody: { flex: 1 },
    cardFooter: { flexDirection: 'row', gap: 16 },
    footerStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

export default MySoldNotes;
