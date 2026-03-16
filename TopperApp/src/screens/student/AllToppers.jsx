import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGetAllToppersQuery } from '../../features/api/topperApi';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import ScreenLoader from '../../components/ScreenLoader';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import NoDataFound from '../../components/NoDataFound';
import TopperFilterModal from '../../components/TopperFilterModal';
import PageHeader from '../../components/PageHeader';
import useTheme from '../../hooks/useTheme';

import { TopperListSkeleton } from '../../components/skeletons/HomeSkeletons';

const { width } = Dimensions.get('window');

const AllToppers = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState(null);

    const {
        data: toppersResponse,
        isLoading,
        isFetching,
        isError,
        refetch
    } = useGetAllToppersQuery({
        search: searchQuery || undefined,
        sortBy: sortBy || undefined,
        page,
        class: selectedClass || undefined,
        board: selectedBoard || undefined,
        limit: 15
    });

    const allToppers = toppersResponse?.toppers || [];

    const showPrimaryLoading = (isLoading || isFetching) && page === 1;

    const { refreshing, onRefresh: originalRefresh } = useRefresh(refetch);

    const onRefresh = useCallback(() => {
        setPage(1);
        originalRefresh();
    }, [originalRefresh]);

    // Reset page on filter/search changes (RTK merge handles data)
    useEffect(() => {
        setPage(1);
    }, [searchQuery, sortBy, selectedClass, selectedBoard]);

    const handleTopperPress = (userId) => {
        navigation.navigate('PublicTopperProfile', { topperId: userId });
    };

    const loadMore = () => {
        const { page: currentPage, totalPages } = toppersResponse?.pagination || {};
        if (!isFetching && currentPage < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const renderTopperItem = ({ item }) => (
        <TouchableOpacity
            style={styles.topperCard}
            onPress={() => handleTopperPress(item.userId)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Image
                    source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                    style={styles.avatar}
                />
                <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                        <AppText style={styles.name} weight="bold">{item.name}</AppText>
                        <MaterialCommunityIcons name="check-decagram" size={16} color={theme.colors.primary} />
                    </View>
                    <AppText style={styles.expertise} numberOfLines={1}>Class {item.expertiseClass} • {item.stream || item.board || 'Topper'}</AppText>
                </View>
            </View>

            <AppText style={styles.bio} numberOfLines={2}>{item.bio}</AppText>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Ionicons name="star" size={14} color={theme.colors.warning} />
                    <AppText style={styles.statValue} weight="bold">{item.stats?.avgRating || '0.0'}</AppText>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                    <Ionicons name="documents-outline" size={14} color={theme.colors.primary} />
                    <AppText style={styles.statValue} weight="bold">{item.stats?.totalNotes || 0} Notes</AppText>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                    <Ionicons name="people-outline" size={14} color={theme.colors.success} />
                    <AppText style={styles.statValue} weight="bold">{item.stats?.totalSold || 0} Sold</AppText>
                </View>
            </View>

            <View style={styles.footer}>
                <AppText style={styles.viewProfile}>View Profile</AppText>
                <Feather name="arrow-right" size={14} color={theme.colors.primary} />
            </View>
        </TouchableOpacity>
    );

    const topperCount = allToppers?.length > 0 ? allToppers.length : 5;

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <PageHeader
                title="Verified Toppers"
                onBackPress={() => navigation.goBack()}
                iconName="chevron-back"
            />

            <View style={styles.searchSection}>
                <SearchBar
                    value={localSearch}
                    onChangeText={setLocalSearch}
                    placeholder="Search toppers by name or class..."
                    onFilterPress={() => setIsFilterVisible(true)}
                    isFilterActive={sortBy !== 'newest' || selectedClass !== null || selectedBoard !== null}
                />
            </View>

            <FlatList
                data={showPrimaryLoading ? [] : allToppers}
                renderItem={renderTopperItem}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} backgroundColor="transparent" />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !showPrimaryLoading && (
                        isError ? (
                            <NoDataFound message="Something went wrong while fetching toppers." icon="alert-circle-outline" />
                        ) : (
                            <NoDataFound message="No toppers found matching your selection." />
                        )
                    )
                }
                ListFooterComponent={
                    showPrimaryLoading ? (
                        <View>
                            {[...Array(topperCount)].map((_, i) => (
                                <TopperListSkeleton key={i} />
                            ))}
                        </View>
                    ) : isFetching ? (
                        <View style={{ paddingVertical: 40 }}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                    ) : null
                }
            />

            <TopperFilterModal
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedClass={selectedClass}
                onSelectClass={setSelectedClass}
                selectedBoard={selectedBoard}
                onSelectBoard={setSelectedBoard}
            />
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    searchSection: {
        paddingHorizontal: theme.layout.screenPadding,
        marginBottom: 10,
    },
    listContent: {
        paddingHorizontal: theme.layout.screenPadding,
        paddingTop: 10,
        paddingBottom: 40,
    },
    topperCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    name: {
        fontSize: 16,
        color: theme.colors.text,
    },
    expertise: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    bio: {
        fontSize: 13,
        color: theme.colors.text,
        lineHeight: 18,
        marginBottom: 15,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 15,
    },
    stat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 12,
        color: theme.colors.text,
    },
    divider: {
        width: 1,
        height: 15,
        backgroundColor: theme.colors.border,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },
    viewProfile: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});

export default AllToppers;
