import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Dimensions,
    RefreshControl,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import useRefresh from '../../hooks/useRefresh';
import AppText from '../../components/AppText';
import { useGetNotesQuery, useToggleFavoriteNoteMutation } from '../../features/api/noteApi';
import { useGetProfileQuery } from '../../features/api/studentApi';
import { useGetAllToppersQuery } from '../../features/api/topperApi';
import { useGetNotificationsQuery } from '../../features/api/notificationApi';
import { useGetChatsQuery } from '../../features/api/chatApi';
import { capitalize } from '../../helpers/capitalize';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import HomeHeader from '../../components/HomeHeader';
import { useAlert } from '../../context/AlertContext';
import useTheme from '../../hooks/useTheme';

import PromoBanners from './studentHome/PromoBanners';
import TrendingNotes from './studentHome/TrendingNotes';
import ReferAndEarnBanner from './studentHome/ReferAndEarnBanner';
import MeetToppers from './studentHome/MeetToppers';
import ProTipCard from './studentHome/ProTipCard';

const { width } = Dimensions.get('window');

const StudentHome = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { showAlert } = useAlert();
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [timeRange, setTimeRange] = useState('all');
    const [isSortModalVisible, setIsSortModalVisible] = useState(false);
    const [toggleFavorite] = useToggleFavoriteNoteMutation();
    const handleFavoriteToggle = async (noteId) => {
        try {
            await toggleFavorite(noteId).unwrap();
        } catch (error) {
            showAlert("Error", "Failed to update favourite status", "error");
        }
    };

    // Fetch detailed profile
    const { data: studentProfile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileQuery();

    const categories = ['All', 'Class 12', 'Class 10', 'CBSE'];

    const subjects = useMemo(() => {
        return studentProfile?.subjects?.map(s => capitalize(s)) || [];
    }, [studentProfile]);

    const { data: notesData, isLoading: notesLoading, isFetching: notesFetching, refetch: refetchNotes } = useGetNotesQuery({
        class: activeCategory === 'Class 12' ? '12' : activeCategory === 'Class 10' ? '10' : undefined,
        board: activeCategory === 'CBSE' ? 'CBSE' : undefined,
        subject: selectedSubject || undefined,
        search: searchQuery || undefined,
        sortBy: sortBy,
        timeRange: timeRange,
    });

    const displayNotes = useMemo(() => {
        if (notesLoading && !refreshing) return [];
        return notesData?.notes || [];
    }, [notesData, notesLoading, refreshing]);

    const { data: toppersData, isLoading: toppersLoading, isFetching: toppersFetching, refetch: refetchToppers } = useGetAllToppersQuery(undefined);

    const displayToppers = useMemo(() => {
        if (toppersFetching && !refreshing) return [];
        return toppersData?.toppers || [];
    }, [toppersData, toppersFetching, refreshing]);

    const { data: notificationsData } = useGetNotificationsQuery({ page: 1, limit: 1 });
    const notificationUnreadCount = notificationsData?.data?.unreadCount || 0;

    const { data: chatData } = useGetChatsQuery({ limit: 50 }, { skip: !studentProfile });
    const unreadMessagesCount = useMemo(() => {
        if (!chatData?.data) return 0;
        return chatData.data.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
    }, [chatData]);

    const isInitialMount = useRef(true);

    // Removed redirect to Store to keep search/filters in-place on Home
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        }
    }, []);

    const handleRefreshAction = useCallback(async () => {
        try {
            await Promise.all([
                refetchProfile?.().unwrap(),
                refetchToppers?.().unwrap(),
                refetchNotes?.().unwrap()
            ]);
        } catch (error) {
            console.error("Refresh Error:", error);
        }
    }, [refetchProfile, refetchToppers, refetchNotes]);

    const { refreshing, onRefresh } = useRefresh(handleRefreshAction);

    useFocusEffect(
        useCallback(() => {
            // Reset filters on Home so we can trigger redirect again on next interaction
            isInitialMount.current = true;
            setLocalSearch('');
            setActiveCategory('All');
            setSelectedSubject(null);
            setSortBy('newest');
            setTimeRange('all');

            refetchProfile?.();
            refetchToppers?.();
            refetchNotes?.();
        }, [])
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header */}
            <HomeHeader
                userProfile={studentProfile}
                userType="student"
                unreadCount={notificationUnreadCount}
                unreadMessagesCount={unreadMessagesCount}
                onProfilePress={() => navigation.navigate('Profile')}
                onChatPress={() => navigation.navigate('ChatList')}
                onNotificationPress={() => navigation.navigate('Notifications')}
                isLoading={profileLoading}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                        backgroundColor="transparent"
                    />
                }
            >
                {/* Search Bar Area */}
                <View style={styles.searchSection}>
                    <SearchBar
                        value={localSearch}
                        onChangeText={setLocalSearch}
                        placeholder={`Find notes for ${studentProfile?.subjects?.[0] || 'your subjects'}...`}
                        onFilterPress={() => setIsSortModalVisible(true)}
                        isFilterActive={sortBy !== 'newest' || timeRange !== 'all'}
                    />
                </View>

                {/* Categories */}
                <CategoryFilters
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    style={styles.categoryBar}
                />

                {/* Promo Banners Carousel */}
                <PromoBanners navigation={navigation} />

                {/* Trending Notes Section */}
                <TrendingNotes
                    notes={displayNotes}
                    loading={notesLoading}
                    fetching={notesFetching}
                    navigation={navigation}
                    onToggleFavorite={handleFavoriteToggle}
                />
                {/* Popular Toppers */}
                <MeetToppers
                    toppers={displayToppers}
                    loading={toppersLoading}
                    fetching={toppersFetching}
                    navigation={navigation}
                />

                {/* Refer and Earn Banner */}
                <ReferAndEarnBanner navigation={navigation} />

                {/* Pro Tip Card */}
                <ProTipCard />

                <View style={{ height: 100 }} />
            </ScrollView>

            <SortModal
                visible={isSortModalVisible}
                onClose={() => setIsSortModalVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedTime={timeRange}
                onSelectTime={setTimeRange}
                selectedSubject={selectedSubject}
                onSelectSubject={setSelectedSubject}
                subjects={subjects}
            />
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingTop: 10,
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    categoryBar: {
        marginBottom: 25,
        paddingLeft: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 18,
        color: theme.colors.text,
    },
    sectionSub: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    seeAllText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});

export default StudentHome;
