import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import PageHeader from '../../components/PageHeader';
import AppText from '../../components/AppText';
import NoDataFound from '../../components/NoDataFound';
import { useGetTopperReviewsQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import useTheme from '../../hooks/useTheme';
import { ReviewSkeleton } from '../../components/skeletons/HomeSkeletons';

const TopperReviews = ({ route, navigation }) => {
    const { topperId } = route.params;
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch('', 500);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [ratingFilter, setRatingFilter] = useState(null);

    const {
        data: response,
        isLoading,
        isFetching,
        refetch
    } = useGetTopperReviewsQuery({
        topperId,
        page,
        search: searchQuery,
        sortBy,
        rating: ratingFilter
    });

    const { refreshing, onRefresh } = useRefresh(async () => {
        setPage(1);
        await refetch();
    });

    const handleLoadMore = () => {
        if (!isFetching && response?.page < response?.totalPages) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [searchQuery, sortBy, ratingFilter]);

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <Image
                    source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                    style={styles.studentAvatar}
                />
                <View style={styles.headerInfo}>
                    <AppText style={styles.studentName} weight="bold">{item.user}</AppText>
                    <View style={styles.metaRow}>
                        <AppText style={styles.timeAgo}>{item.daysAgo}</AppText>
                        {item.verifiedPurchase && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-seal" size={12} color={theme.colors.success} />
                                <AppText style={styles.verifiedText}>Bought this note</AppText>
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.ratingTag, { backgroundColor: item.rating >= 4 ? theme.colors.success + '18' : '#F59E0B18' }]}>
                    <Ionicons name="star" size={12} color={item.rating >= 4 ? theme.colors.success : '#F59E0B'} />
                    <AppText style={[styles.ratingVal, { color: item.rating >= 4 ? theme.colors.success : '#F59E0B' }]} weight="bold">{item.rating}</AppText>
                </View>
            </View>

            <AppText style={styles.commentText}>{item.comment || "No comment provided."}</AppText>

            {item.noteInfo && (
                <View style={styles.noteRefBox}>
                    <Feather name="book-open" size={12} color={theme.colors.textSubtle} />
                    <AppText style={styles.noteRefText} numberOfLines={1}>
                        Reviewed on: <AppText weight="bold" style={{ color: theme.colors.primary }}>{item.noteInfo.subject}</AppText> - {item.noteInfo.chapter}
                    </AppText>
                </View>
            )}
        </View>
    );

    const FilterChip = ({ label, active, onPress }) => (
        <TouchableOpacity
            style={[styles.chip, active && styles.activeChip]}
            onPress={onPress}
        >
            <AppText style={[styles.chipText, active && styles.activeChipText]} weight={active ? "bold" : "regular"}>
                {label}
            </AppText>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <PageHeader
                title="All Reviews"
                subtitle={`${response?.total || 0} Feedbacks Received`}
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.header}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Feather name="search" size={18} color={theme.colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search in comments..."
                            placeholderTextColor={theme.colors.textSubtle}
                            value={localSearch}
                            onChangeText={setLocalSearch}
                        />
                        {localSearch.length > 0 && (
                            <TouchableOpacity onPress={() => setLocalSearch('')}>
                                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filters */}
                <View style={styles.filterScroll}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={[
                            { label: 'All', value: null },
                            { label: '5 ★', value: 5 },
                            { label: '4 ★', value: 4 },
                            { label: '3 ★', value: 3 },
                            { label: '< 3 ★', value: 2 },
                        ]}
                        renderItem={({ item }) => (
                            <FilterChip
                                label={item.label}
                                active={ratingFilter === item.value}
                                onPress={() => setRatingFilter(item.value)}
                            />
                        )}
                        keyExtractor={item => item.label}
                        contentContainerStyle={styles.chipList}
                    />
                </View>

                {/* Sort Toggle */}
                <View style={styles.sortRow}>
                    <AppText style={styles.sortLabel}>Sorting by:</AppText>
                    <TouchableOpacity
                        style={styles.sortToggle}
                        onPress={() => setSortBy(sortBy === 'newest' ? 'rating_high' : sortBy === 'rating_high' ? 'rating_low' : 'newest')}
                    >
                        <MaterialCommunityIcons name="sort-variant" size={16} color={theme.colors.primary} />
                        <AppText style={styles.sortVal} weight="bold">
                            {sortBy === 'newest' ? 'Newest First' : sortBy === 'rating_high' ? 'Highest Rating' : 'Lowest Rating'}
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={(isLoading || (isFetching && page === 1)) ? [] : (response?.reviews || [])}
                keyExtractor={(item) => item.id || item._id}
                renderItem={renderReviewItem}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListFooterComponent={
                    isFetching ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                    ) : (response?.reviews?.length > 0 && page >= response?.totalPages) ? (
                        <AppText style={styles.endText}>You've reached the end of your reviews.</AppText>
                    ) : null
                }
                ListEmptyComponent={
                    (isLoading || (isFetching && page === 1)) ? (
                        <View>
                            {[...Array(4)].map((_, i) => (
                                <ReviewSkeleton key={i} />
                            ))}
                        </View>
                    ) : (
                        <NoDataFound
                            message={searchQuery ? "No reviews match your search." : "No reviews found for your profile yet."}
                            icon="star-half-outline"
                        />
                    )
                }
            />
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.card + '60',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
        marginLeft: 10,
    },
    filterScroll: {
        marginBottom: 15,
    },
    chipList: {
        paddingLeft: 20,
        paddingRight: 10,
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeChip: {
        backgroundColor: theme.colors.primary + '20',
        borderColor: theme.colors.primary,
    },
    chipText: {
        fontSize: 13,
        color: theme.colors.textMuted,
    },
    activeChipText: {
        color: theme.colors.primary,
    },
    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'flex-end',
        gap: 8,
    },
    sortLabel: {
        fontSize: 12,
        color: theme.colors.textSubtle,
    },
    sortToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: theme.colors.primary + '12',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    sortVal: {
        fontSize: 12,
        color: theme.colors.primary,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    reviewCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    studentAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    studentName: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    timeAgo: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verifiedText: {
        fontSize: 10,
        color: theme.colors.success,
        fontWeight: 'bold',
    },
    ratingTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingVal: {
        fontSize: 14,
    },
    commentText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        lineHeight: 22,
        marginBottom: 15,
    },
    noteRefBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.surface,
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    noteRefText: {
        fontSize: 11,
        color: theme.colors.textSubtle,
        flex: 1,
    },
    endText: {
        textAlign: 'center',
        color: theme.colors.textSubtle,
        fontSize: 12,
        marginTop: 10,
    },
});

export default TopperReviews;
