import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetTransactionHistoryQuery } from '../../features/api/paymentApi';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import PageHeader from '../../components/PageHeader';
import useTheme from '../../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { TransactionSkeleton } from '../../components/skeletons/HomeSkeletons';

const TransactionHistory = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(''); // '', 'SUCCESS', 'PENDING', 'FAILED'
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch('', 500);
    const [allTransactions, setAllTransactions] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const scrollRef = React.useRef(null);
    const { width } = Dimensions.get('window');

    const statusTabs = React.useMemo(() => [
        { label: 'All', value: '' },
        { label: 'Success', value: 'SUCCESS' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Failed', value: 'FAILED' }
    ], []);

    const handleTabPress = (tabValue) => {
        setStatusFilter(tabValue);
        const index = statusTabs.findIndex(t => t.value === tabValue);
        scrollRef.current?.scrollTo({ x: index * width, animated: true });
    };

    const handleScrollEnd = (e) => {
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / width);
        if (statusTabs[index] && statusTabs[index].value !== statusFilter) {
            setStatusFilter(statusTabs[index].value);
        }
    };

    const {
        data: history,
        isLoading,
        isFetching,
        isSuccess,
        refetch
    } = useGetTransactionHistoryQuery({
        search: searchQuery,
        status: statusFilter,
        page,
        limit: 10
    });

    // Reset list when search or filter changes
    useEffect(() => {
        setPage(1);
        setAllTransactions([]);
        setHasMore(true);
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        if (isSuccess && history) {
            if (page === 1) {
                setAllTransactions(history.transactions);
            } else {
                setAllTransactions(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = history.transactions.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
            }
            setHasMore(history.pagination.page < history.pagination.totalPages);
        }
    }, [isSuccess, history, page]);

    const { refreshing, onRefresh } = useRefresh(async () => {
        setPage(1);
        setHasMore(true);
        await refetch();
    });

    const handleLoadMore = () => {
        if (hasMore && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const renderTransactionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.transactionCard}
            onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.status === 'SUCCESS' ? theme.colors.success + '15' : theme.colors.danger + '15' }]}>
                    <MaterialCommunityIcons
                        name={item.status === 'SUCCESS' ? 'file-document-check-outline' : 'file-document-remove-outline'}
                        size={24}
                        color={item.status === 'SUCCESS' ? theme.colors.success : theme.colors.danger}
                    />
                </View>
                <View style={styles.transactionInfo}>
                    <AppText style={styles.noteTitle} weight="bold" numberOfLines={1}>{item.noteTitle}</AppText>
                    <AppText style={styles.transactionDate}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </AppText>
                </View>
                <AppText style={styles.amount} weight="bold">₹{item.amount}</AppText>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'SUCCESS' ? theme.colors.success + '15' : theme.colors.danger + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: item.status === 'SUCCESS' ? theme.colors.success : theme.colors.danger }]} />
                    <AppText style={[styles.statusText, { color: item.status === 'SUCCESS' ? theme.colors.success : theme.colors.danger }]}>
                        {item.status}
                    </AppText>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MaterialCommunityIcons name="receipt" size={14} color={theme.colors.primary} />
                        <AppText style={styles.actionText}>Receipt</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MaterialCommunityIcons name="download" size={14} color={theme.colors.primary} />
                        <AppText style={styles.actionText}>Invoice</AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const HeaderComponent = useMemo(() => (
        <View style={styles.headerComponent}>
            <View style={styles.statsContainer}>
                <LinearGradient
                    colors={isDarkMode ? [theme.colors.card, theme.colors.background] : [theme.colors.surface, theme.colors.background]}
                    style={styles.statsCard}
                >
                    <AppText style={styles.statsLabel}>Total Spent in {history?.currentMonthName || 'this month'}</AppText>
                    <View style={styles.amountRow}>
                        <AppText style={styles.totalAmount} weight="bold">₹{history?.totalSpentThisMonth || 0}</AppText>
                        <View style={styles.trendBadge}>
                            <Ionicons name="trending-up" size={12} color={theme.colors.success} />
                            <AppText style={styles.trendText}>12%</AppText>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <SearchBar
                value={localSearch}
                onChangeText={setLocalSearch}
                placeholder="Search transactions..."
                style={styles.searchBar}
            />

            <AppText style={styles.sectionTitle} weight="bold">RECENT TRANSACTIONS</AppText>
        </View>
    ), [history?.currentMonthName, history?.totalSpentThisMonth, localSearch]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <PageHeader
                title="Transaction History"
                onBackPress={() => navigation.goBack()}
                iconName="chevron-back"
            />

            <View style={[styles.filterTabs, { paddingHorizontal: 20, marginBottom: 10 }]}>
                {statusTabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.value}
                        style={[styles.tab, statusFilter === tab.value && styles.activeTab]}
                        onPress={() => handleTabPress(tab.value)}
                    >
                        <AppText style={[styles.tabText, statusFilter === tab.value && styles.activeTabText]} weight={statusFilter === tab.value ? "bold" : "regular"}>
                            {tab.label}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
            >
                {statusTabs.map((tab) => {
                    const dynamicCount = allTransactions?.length > 0 ? allTransactions.length : 6;
                    const showLoading = isFetching && page === 1 && statusFilter === tab.value;

                    return (
                        <View key={tab.value} style={{ width }}>
                            <FlatList
                                data={showLoading ? [] : (statusFilter === tab.value ? allTransactions : [])}
                                renderItem={renderTransactionItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.listContent}
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.5}
                                ListHeaderComponent={statusFilter === tab.value ? HeaderComponent : null}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                                }
                                ListFooterComponent={() => (
                                    isFetching && page > 1 && statusFilter === tab.value ? (
                                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                                    ) : <View style={{ height: 100 }} />
                                )}
                                ListEmptyComponent={() => (
                                    showLoading ? (
                                        <View>
                                            {[...Array(dynamicCount)].map((_, i) => (
                                                <TransactionSkeleton key={i} />
                                            ))}
                                        </View>
                                    ) : statusFilter === tab.value ? (
                                        <View style={styles.emptyState}>
                                            <MaterialCommunityIcons name="history" size={64} color={theme.colors.border} />
                                            <AppText style={styles.emptyText}>No transactions found</AppText>
                                        </View>
                                    ) : null
                                )}
                            />
                        </View>
                    );
                })}
            </ScrollView>

        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerComponent: {
        marginBottom: 10,
    },
    searchBar: {
        marginBottom: 15,
    },
    filterTabs: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeTab: {
        backgroundColor: theme.colors.primary + '20',
        borderColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textMuted,
        fontSize: 13,
    },
    activeTabText: {
        color: theme.colors.primary,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    statsContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    statsCard: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statsLabel: {
        color: theme.colors.textMuted,
        fontSize: 14,
        marginBottom: 8,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    totalAmount: {
        fontSize: 32,
        color: theme.colors.text,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    trendText: {
        color: theme.colors.success,
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionTitle: {
        color: theme.colors.textSubtle,
        fontSize: 12,
        letterSpacing: 1.2,
        marginTop: 15,
        marginBottom: 15,
    },
    transactionCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
        marginLeft: 15,
    },
    noteTitle: {
        color: theme.colors.text,
        fontSize: 15,
        marginBottom: 4,
    },
    transactionDate: {
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    amount: {
        color: theme.colors.text,
        fontSize: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border + '40',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        color: theme.colors.primary,
        fontSize: 11,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: theme.colors.textMuted,
        marginTop: 15,
        fontSize: 16,
    }
});

export default TransactionHistory;
