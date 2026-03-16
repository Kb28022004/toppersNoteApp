import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetFollowedToppersQuery } from '../../features/api/studentApi';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import AppText from '../../components/AppText';
import Loader from '../../components/Loader';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import PageHeader from '../../components/PageHeader';
import NoDataFound from '../../components/NoDataFound';
import useTheme from '../../hooks/useTheme';
import { useMemo } from 'react';
import { FollowingSkeleton } from '../../components/skeletons/HomeSkeletons';

const { width } = Dimensions.get('window');

const FollowingList = ({ navigation }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Class 10', 'Class 12', 'Science', 'Commerce', 'Arts'];

    const getQueryParams = () => {
        const params = {};
        if (searchQuery) params.search = searchQuery;

        if (activeFilter === 'Class 10') params.expertiseClass = '10';
        else if (activeFilter === 'Class 12') params.expertiseClass = '12';
        else if (['Science', 'Commerce', 'Arts'].includes(activeFilter)) {
            params.stream = activeFilter;
            params.expertiseClass = '12';
        }

        return params;
    };

    const {
        data: followedToppers,
        isLoading,
        refetch,
        isFetching
    } = useGetFollowedToppersQuery(getQueryParams());

    const { refreshing, onRefresh } = useRefresh(refetch);

    const renderTopperCard = ({ item }) => (
        <TouchableOpacity
            style={styles.topperCard}
            onPress={() => navigation.navigate('PublicTopperProfile', { topperId: item.topperId })}
        >
            <View style={styles.topperLeft}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                        style={styles.avatar}
                    />
                    <View style={styles.statusDot} />
                </View>
                <View style={styles.topperInfo}>
                    <AppText style={styles.topperName} weight="bold">{item.name}</AppText>
                    <AppText style={styles.topperExpertise}>{item.expertise}</AppText>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
        </TouchableOpacity>
    );

    const dynamicCount = followedToppers?.length > 0 ? followedToppers.length : 8;

    return (
        <View style={styles.container}>
            <PageHeader
                title="Following"
                onBackPress={() => navigation.goBack()}
                iconName="chevron-back"
            />

            {/* Search & Filters */}
            <View style={styles.searchContainer}>
                <SearchBar
                    placeholder="Search by name or bio..."
                    value={localSearch}
                    onChangeText={setLocalSearch}
                />
            </View>

            <FlatList
                data={(isLoading || (isFetching && !followedToppers)) ? [] : followedToppers}
                renderItem={renderTopperCard}
                keyExtractor={(item) => item.topperId}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                        backgroundColor="transparent"
                    />
                }
                ListEmptyComponent={
                    (isLoading || (isFetching && !followedToppers)) ? (
                        <View>
                            {[...Array(dynamicCount)].map((_, i) => (
                                <FollowingSkeleton key={i} />
                            ))}
                        </View>
                    ) : (
                        <NoDataFound
                            message={searchQuery || activeFilter !== 'All'
                                ? "No toppers found matching your criteria."
                                : "You haven't followed any toppers yet."}
                            containerStyle={{ marginTop: 60 }}
                        />
                    )
                }
                ListFooterComponent={
                    isFetching && followedToppers?.length > 0 ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                    ) : null
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
    searchContainer: {
        paddingHorizontal: theme.layout.screenPadding,
        marginTop: 10,
    },
    filterWrapper: {
        marginBottom: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: theme.layout.screenPadding,
        paddingBottom: 30,
        marginTop: 10,
    },
    topperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.card,
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    topperLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.success,
        borderWidth: 2,
        borderColor: theme.colors.card,
    },
    topperInfo: {
        flex: 1,
    },
    topperName: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 4,
    },
    topperExpertise: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
});

export default FollowingList;
