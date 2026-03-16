import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Image,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../components/AppText';
import { useGetProfileQuery } from '../../features/api/topperApi';
import { useGetMyNotesQuery } from '../../features/api/noteApi';
import useTheme from '../../hooks/useTheme';
import { RevenueCardSkeleton, ActionGridSkeleton, DashboardNoteSkeleton, HeaderSkeleton } from '../../components/skeletons/HomeSkeletons';

const { width } = Dimensions.get('window');

const TopperDashboard = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileQuery();
    const { data: notes, isLoading, isFetching, refetch: refetchNotes } = useGetMyNotesQuery();
    const [filter, setFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetchProfile?.().unwrap(), refetchNotes?.().unwrap()]);
        } catch (err) {
            console.log("Refresh Error:", err);
        } finally {
            setRefreshing(false);
        }
    }, [refetchProfile, refetchNotes]);

    const topperStats = profile?.data?.stats;
    const userData = profile?.data;

    const filteredNotes = useMemo(() => {
        const notesList = notes?.notes || [];
        if (filter === 'All') return notesList;
        return notesList.filter(n => n.status.toUpperCase() === filter.toUpperCase());
    }, [notes, filter]);

    const renderNoteItem = ({ item }) => {
        const isPublished = ['PUBLISHED', 'APPROVED'].includes(item.status?.toUpperCase());
        return (
            <TouchableOpacity
                style={styles.noteCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TopperNoteDetails', { noteId: item._id })}
            >
                <View style={styles.noteIconSection}>
                    <View style={[styles.iconBlur, { backgroundColor: isPublished ? '#10B98120' : '#F59E0B20' }]}>
                        <MaterialCommunityIcons
                            name="file-document-outline"
                            size={24}
                            color={isPublished ? '#10B981' : '#F59E0B'}
                        />
                    </View>
                </View>

                <View style={styles.noteContentSection}>
                    <AppText style={styles.noteTitle} weight="bold" numberOfLines={1}>
                        {item.subject} • {item.chapterName}
                    </AppText>
                    <View style={styles.noteBadges}>
                        <View style={styles.miniBadge}>
                            <AppText style={styles.miniBadgeText}>Class {item.class}</AppText>
                        </View>
                        <View style={[styles.statusTag, { backgroundColor: isPublished ? '#10B98120' : '#F59E0B20' }]}>
                            <View style={[styles.statusDot, { backgroundColor: isPublished ? '#10B981' : '#F59E0B' }]} />
                            <AppText style={[styles.statusText, { color: isPublished ? '#10B981' : '#F59E0B' }]}>
                                {isPublished ? 'Active' : 'Pending'}
                            </AppText>
                        </View>
                    </View>
                </View>

                <View style={styles.noteStatsSection}>
                    <AppText style={styles.notePrice} weight="bold">₹{item.price}</AppText>
                    <View style={styles.miniSales}>
                        <Feather name="trending-up" size={10} color={theme.colors.textMuted} />
                        <AppText style={styles.miniSalesText}>{item.salesCount || 0} sold</AppText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const QuickAction = ({ icon, label, color, onPress }) => (
        <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <AppText style={styles.actionLabel}>{label}</AppText>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00B1FC"
                        colors={["#00B1FC"]}
                        backgroundColor={theme.colors.background}
                    />
                }
            >
                {/* Modern Header */}
                {profileLoading ? (
                    <HeaderSkeleton style={{ paddingTop: 0, height: 70 }} />
                ) : (
                    <View style={styles.header}>
                        <View>
                            <AppText style={styles.greeting}>Hello, Topper! 👋</AppText>
                            <AppText style={styles.userName} weight="bold">{userData?.fullName || 'Professional'}</AppText>
                        </View>
                        <TouchableOpacity
                            style={styles.profileBtn}
                            onPress={() => navigation.navigate('TopperProfile')}
                        >
                            <Image
                                source={userData?.profilePhoto ? { uri: userData.profilePhoto } : require('../../../assets/topper.avif')}
                                style={styles.headerAvatar}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Main Earnings Card (Glassmorphism inspired) */}
                {profileLoading ? (
                    <RevenueCardSkeleton />
                ) : (
                    <LinearGradient
                        colors={[theme.colors.card, theme.colors.background]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.earningsCard}
                    >
                        <View style={styles.cardHeader}>
                            <View>
                                <AppText style={styles.cardLabel}>TOTAL REVENUE</AppText>
                                <AppText style={styles.cardMainValue} weight="bold">₹{topperStats?.totalEarnings || 0}</AppText>
                            </View>
                            <View style={styles.growthBadge}>
                                <Ionicons name="arrow-up" size={12} color="#10B981" />
                                <AppText style={styles.growthText}>12.5%</AppText>
                            </View>
                        </View>

                        <View style={styles.cardDivider} />

                        <View style={styles.cardStatsRow}>
                            <View style={styles.cardStatBox}>
                                <AppText style={styles.cardStatLabel}>This Month</AppText>
                                <AppText style={styles.cardStatValue} weight="bold">₹{topperStats?.thisMonthEarnings || 0}</AppText>
                            </View>
                            <View style={styles.cardStatDivider} />
                            <View style={styles.cardStatBox}>
                                <AppText style={styles.cardStatLabel}>Total Sales</AppText>
                                <AppText style={styles.cardStatValue} weight="bold">{topperStats?.totalSold || 0}</AppText>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.withdrawBtn}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('EarningsPayouts', { openSettings: true })}
                        >
                            <LinearGradient
                                colors={['#00B1FC', '#007FFF']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.withdrawGradient}
                            >
                                <AppText style={styles.withdrawText} weight="bold">Payout Settings</AppText>
                                <Ionicons name="chevron-forward" size={18} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                )}

                {/* Quick Actions Section */}
                <AppText style={styles.sectionTitle} weight="bold">Quick Actions</AppText>
                {profileLoading ? (
                    <ActionGridSkeleton />
                ) : (
                    <View style={styles.actionsGrid}>
                        <QuickAction icon="add-circle-outline" label="Add Note" color="#00B1FC" onPress={() => navigation.navigate('UploadNotes')} />
                        <QuickAction icon="people-outline" label="Followers" color="#A855F7" onPress={() => navigation.navigate('Followers', { userId: userData?.userId })} />
                        <QuickAction icon="star-outline" label="Reviews" color="#F59E0B" onPress={() => navigation.navigate('TopperReviews', { topperId: userData?.userId })} />
                        <QuickAction icon="wallet-outline" label="Earnings" color="#10B981" onPress={() => navigation.navigate('EarningsPayouts')} />
                    </View>
                )}

                {/* My Uploads with Improved Filters */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle} weight="bold">Recent Uploads</AppText>
                    <TouchableOpacity onPress={() => navigation.navigate('MyUploads')}>
                        <AppText style={styles.seeAllText}>See All</AppText>
                    </TouchableOpacity>
                </View>

                <View style={styles.filterBar}>
                    {['All', 'Published', 'Pending'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filter === f && styles.filterChipActive]}
                            onPress={() => setFilter(f)}
                        >
                            <AppText style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                                {f === 'Published' ? 'Approved' : f}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                {(isLoading || isFetching) ? (
                    <View style={{ marginTop: 10 }}>
                        {[...Array(5)].map((_, i) => (
                            <DashboardNoteSkeleton key={i} />
                        ))}
                    </View>
                ) : (
                    <View style={styles.notesList}>
                        {filteredNotes.slice(0, 5).map((item) => renderNoteItem({ item }))}
                        {filteredNotes.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={48} color={theme.colors.border} />
                                <AppText style={styles.emptyText}>No notes found</AppText>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingBottom: 100,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenPadding,
        marginBottom: 25,
    },
    greeting: {
        fontSize: 14,
        color: theme.colors.textMuted,
        marginBottom: 2,
    },
    userName: {
        fontSize: 24,
        color: theme.colors.text,
    },
    profileBtn: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 25,
        padding: 2,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    earningsCard: {
        marginHorizontal: 20,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 30,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    cardLabel: {
        fontSize: 10,
        color: theme.colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    cardMainValue: {
        fontSize: 36,
        color: theme.colors.text,
    },
    growthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B98115',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 2,
    },
    growthText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: 'bold',
    },
    cardDivider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: 20,
    },
    cardStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    cardStatBox: {
        flex: 1,
    },
    cardStatLabel: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginBottom: 4,
    },
    cardStatValue: {
        fontSize: 18,
        color: theme.colors.text,
    },
    cardStatDivider: {
        width: 1,
        height: 24,
        backgroundColor: theme.colors.border,
        marginHorizontal: 15,
    },
    withdrawBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    withdrawGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    withdrawText: {
        color: 'white',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenPadding,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        color: theme.colors.text,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    seeAllText: {
        color: '#00B1FC',
        fontSize: 14,
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        paddingHorizontal: theme.layout.screenPadding,
        justifyContent: 'space-between',
        marginBottom: 35,
    },
    actionItem: {
        alignItems: 'center',
        width: (width - 40) / 4.5,
    },
    actionIconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 11,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: theme.layout.screenPadding,
        marginBottom: 20,
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterChipActive: {
        backgroundColor: '#00B1FC15',
        borderColor: '#00B1FC',
    },
    filterChipText: {
        fontSize: 13,
        color: theme.colors.textMuted,
    },
    filterChipTextActive: {
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    notesList: {
        paddingHorizontal: theme.layout.screenPadding,
        gap: 12,
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 12,
    },
    noteIconSection: {
        marginRight: 15,
    },
    iconBlur: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteContentSection: {
        flex: 1,
    },
    noteTitle: {
        fontSize: 15,
        color: theme.colors.text,
        marginBottom: 6,
    },
    noteBadges: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    miniBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: theme.colors.background,
    },
    miniBadgeText: {
        fontSize: 10,
        color: theme.colors.textMuted,
        fontWeight: 'bold',
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 5,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    noteStatsSection: {
        alignItems: 'flex-end',
        paddingRight: 5,
    },
    notePrice: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 2,
    },
    miniSales: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    miniSalesText: {
        fontSize: 10,
        color: theme.colors.textMuted,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    emptyText: {
        color: theme.colors.textMuted,
        marginTop: 10,
    }
});

export default TopperDashboard;
