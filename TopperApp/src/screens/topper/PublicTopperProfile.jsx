import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Linking,
    Share
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../components/AppText';
import Loader from '../../components/Loader';
import ScreenLoader from '../../components/ScreenLoader';
import PageHeader from '../../components/PageHeader';
import BottomSheet from '../../components/BottomSheet';
import { useGetPublicProfileQuery, useFollowTopperMutation } from '../../features/api/topperApi';
import { useToggleFavoriteNoteMutation } from '../../features/api/noteApi';
import { useInitializeChatMutation } from '../../features/api/chatApi';
import useRefresh from '../../hooks/useRefresh';
import { useAlert } from '../../context/AlertContext';
import useTheme from '../../hooks/useTheme';
import { useMemo } from 'react';
import { ProfileHeaderSkeleton, LibraryNoteSkeleton } from '../../components/skeletons/HomeSkeletons';

const { width } = Dimensions.get('window');

const PublicTopperProfile = ({ route, navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { showAlert } = useAlert();
    const { topperId, isPreview = false } = route.params;
    const { data: profile, isLoading, isError, refetch } = useGetPublicProfileQuery(topperId);
    const { refreshing, onRefresh } = useRefresh(refetch);
    const [followTopper, { isLoading: isFollowing }] = useFollowTopperMutation();
    const [initializeChat, { isLoading: isChatLoading }] = useInitializeChatMutation();

    const [activeTab, setActiveTab] = useState('All Notes');
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);

    // Use local state needed for immediate UI update on toggle
    const [following, setFollowing] = useState(false);
    const [toggleFavorite] = useToggleFavoriteNoteMutation();

    const scrollRef = React.useRef(null);
    const tabs = [`All Notes (${profile?.data?.stats?.totalNotes || 0})`, 'Bundles', `Free Material (${profile?.data?.stats?.freeNotes || 0})`];

    const handleTabPress = (tabName) => {
        setActiveTab(tabName);
        const index = tabs.indexOf(tabName);
        if (index > -1) {
            scrollRef.current?.scrollTo({ x: index * width, animated: true });
        }
    };

    const handleScrollEnd = (e) => {
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / width);
        if (tabs[index] && tabs[index] !== activeTab) {
            setActiveTab(tabs[index]);
        }
    };

    useEffect(() => {
        if (profile?.data) {
            setFollowing(profile.data.isFollowing);
            setActiveTab(`All Notes (${profile.data.stats?.totalNotes || 0})`);
        }
    }, [profile]);

    if (isError) return (
        <View style={styles.center}>
            <AppText style={{ color: theme.colors.danger }}>Profile not found {topperId}</AppText>
        </View>
    );

    const {
        fullName,
        profilePhoto,
        verified,
        achievements = [],
        stats = {},
        about,
        latestUploads = [],
        isFollowing: initialFollowing,
        expertiseClass,
        stream,
        board,
        yearOfPassing,
        coreSubjects = [],
        highlights = [],
        subjectMarks = [],
        marksheetUrl
    } = profile?.data || {};

    console.log("Stats", profile?.data?.marksheetUrl);


    const handleFollow = async () => {
        try {
            await followTopper(topperId).unwrap();
            setFollowing(!following);
        } catch (error) {
            console.log("Follow Error", error);
        }
    };

    const handleFavoriteToggle = async (noteId) => {
        try {
            await toggleFavorite(noteId).unwrap();
        } catch (error) {
            showAlert("Error", "Failed to update favourite status", "error");
        }
    };

    const handleMessage = async () => {
        if (!topperId) return;
        try {
            const res = await initializeChat(topperId).unwrap();
            if (res.success && res.data) {
                // Determine the other participant from the response data to pass to ChatDetails
                const otherUserId = Object.keys(res.data.participantData).find(id => id === topperId);
                const otherUser = res.data.participantData[otherUserId];

                navigation.navigate("ChatDetails", {
                    chatId: res.data.id,
                    otherUser
                });
            }
        } catch (error) {
            console.error("Chat initialization error:", error);
            showAlert("Error", "Failed to start chat session", "error");
        }
    };

    const handleShare = async () => {
        try {
            const classText = expertiseClass ? `Class ${expertiseClass}` : '';
            const streamText = stream ? ` ${stream}` : '';
            await Share.share({
                message: `Check out ${fullName}'s verified profile on TopperApp! They are a ${classText}${streamText} Topper. Download the app to check out their notes!`,
            });
        } catch (error) {
            console.log("Share error: ", error.message);
        }
    };

    const handleCopyLink = () => {
        setIsOptionsVisible(false);
        showAlert("Link Copied", "Profile link copied to your clipboard!", "success");
    };

    const handleReport = () => {
        setIsOptionsVisible(false);
        showAlert("Report Submitted", "Your report has been sent to our community team for review.", "success");
    };

    const renderNoteCard = ({ item }) => (
        <TouchableOpacity
            style={styles.noteCard}
            onPress={() => isPreview ? navigation.navigate('TopperNoteDetails', { noteId: item.id }) : navigation.navigate('StudentNoteDetails', { noteId: item.id })}
        >
            <View style={styles.noteThumbnail}>
                <Image source={item.coverImage ? { uri: item.coverImage } : require('../../../assets/topper.avif')} style={styles.thumbnailImg} resizeMode="cover" />

                {!isPreview && (
                    <TouchableOpacity
                        style={styles.saveBtnTopper}
                        onPress={() => handleFavoriteToggle(item.id)}
                    >
                        <Ionicons
                            name={item.isFavorite ? "heart" : "heart-outline"}
                            size={16}
                            color={item.isFavorite ? theme.colors.danger : "white"}
                        />
                    </TouchableOpacity>
                )}

                <View style={styles.pageBadge}>
                    <AppText style={styles.pageText}>{item.pageCount || 24} pgs</AppText>
                </View>
            </View>

            <View style={styles.noteInfo}>
                <View style={styles.noteHeader}>
                    <View style={styles.subjectTag}>
                        <AppText style={styles.subjectText}>{item.subject?.toUpperCase()}</AppText>
                    </View>
                    <View style={styles.ratingRow}>
                        <AppText style={styles.ratingText}>{item.rating !== undefined ? item.rating : 'N/A'}</AppText>
                        <Ionicons name="star" size={10} color={theme.colors.warning || "#FFD700"} />
                    </View>
                </View>

                <AppText style={styles.noteTitle} numberOfLines={2}>{item.title}</AppText>

                <View style={styles.noteFooter}>
                    <View>
                        {item.price ? <AppText style={styles.strikePrice}>₹{item.price * 2}</AppText> : null}
                        <AppText style={styles.price}>{item.price ? `₹${item.price}` : 'Free'}</AppText>
                    </View>
                    {/* <TouchableOpacity style={styles.cartBtn}>
                        <Ionicons name="cart-outline" size={18} color="white" />
                    </TouchableOpacity> */}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <PageHeader
                title="Profile"
                onBackPress={() => navigation.goBack()}
                rightComponent={
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsOptionsVisible(true)}>
                            <Ionicons name="ellipsis-vertical" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >

                {isLoading ? (
                    <ProfileHeaderSkeleton />
                ) : (
                    <>
                        {/* Profile Header */}
                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                <Image source={profilePhoto ? { uri: profilePhoto } : require('../../../assets/topper.avif')} style={styles.avatar} />
                                {verified && (
                                    <View style={styles.verifyBadge}>
                                        <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.primary} />
                                        {/* Using icon directly, white bg added via container style if needed, but icon usually enough */}
                                        <View style={{ position: 'absolute', backgroundColor: 'white', width: 10, height: 10, zIndex: -1, borderRadius: 5, top: 5, left: 5 }} />
                                    </View>
                                )}
                            </View>

                            <AppText style={styles.name} weight="bold">{fullName}</AppText>

                            {/* Credentials Pill */}
                            <View style={styles.credentialsPill}>
                                <Ionicons name="school" size={14} color={theme.colors.primary} />
                                <AppText style={styles.credentialsText}>
                                    {`Class ${expertiseClass || 'N/A'}`}
                                    {stream ? ` • ${stream}` : ''}
                                    {board ? ` • ${board}` : ''}
                                    {yearOfPassing ? ` (${yearOfPassing})` : ''}
                                </AppText>
                            </View>

                            {/* Highlights (if any) */}
                            {highlights && highlights.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 25 }}>
                                    {highlights.map((h, i) => (
                                        <View key={i} style={styles.highlightPill}>
                                            <Ionicons name="star" size={12} color={theme.colors.warning || "#F59E0B"} />
                                            <AppText style={styles.highlightText}>{h}</AppText>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Stats Row */}
                            <View style={styles.statsContainer}>
                                <View style={styles.statBox}>
                                    <AppText style={styles.statValue} weight="bold">{(stats?.totalSold || 0) > 1000 ? `${(stats.totalSold / 1000).toFixed(1)}k` : (stats?.totalSold || 0)}</AppText>
                                    <AppText style={styles.statLabel}>SOLD</AppText>
                                </View>
                                <View style={styles.statBox}>
                                    <View style={styles.row}>
                                        <AppText style={styles.statValue} weight="bold">{stats?.rating?.average !== undefined ? stats.rating.average : '0.0'}</AppText>
                                        <Ionicons name="star" size={12} color={theme.colors.warning || "#FFD700"} style={{ marginLeft: 3 }} />
                                    </View>
                                    <AppText style={styles.statLabel}>RATING</AppText>
                                </View>
                                <View style={styles.statBox}>
                                    <AppText style={styles.statValue} weight="bold">{(stats?.followers || 0) > 1000 ? `${(stats.followers / 1000).toFixed(1)}k` : (stats?.followers || 0)}</AppText>
                                    <AppText style={styles.statLabel}>FOLLOWERS</AppText>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            {!isPreview && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={[styles.followBtn, following && { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary }]} onPress={handleFollow} disabled={isFollowing}>
                                        <Ionicons name={following ? "checkmark" : "person-add"} size={18} color={following ? theme.colors.primary : "white"} />
                                        <AppText style={[styles.followText, following && { color: theme.colors.primary }]}>{following ? 'Following' : 'Follow'}</AppText>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.messageBtn} onPress={handleMessage} disabled={isChatLoading}>
                                        {isChatLoading ? (
                                            <ActivityIndicator size="small" color="#E2E8F0" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.textSubtle || "#E2E8F0"} />
                                                <AppText style={styles.messageText}>Message</AppText>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Subject Marks & Marksheet ALWAYS VISIBLE */}
                            {((subjectMarks && subjectMarks.length > 0) || marksheetUrl) && (
                                <View style={{ width: '100%', marginBottom: 25, backgroundColor: theme.colors.card + '60', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: theme.colors.border }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 }}>
                                        <Ionicons name="ribbon-outline" size={18} color={theme.colors.primary} />
                                        <AppText weight="bold" style={{ fontSize: 15, color: theme.colors.text }}>Academic Verification</AppText>
                                    </View>

                                    {subjectMarks && subjectMarks.map((mark, idx) => (
                                        <View key={idx} style={styles.marksRow}>
                                            <AppText style={styles.marksSubject}>{mark.subject}</AppText>
                                            <View style={styles.markBadge}>
                                                <AppText style={styles.markValue}>{mark.marks} / 100</AppText>
                                            </View>
                                        </View>
                                    ))}

                                    {marksheetUrl && (
                                        <TouchableOpacity
                                            style={styles.marksheetBtn}
                                            onPress={() => Linking.openURL(marksheetUrl)}
                                        >
                                            <Ionicons name="document-text" size={16} color="white" />
                                            <AppText style={styles.marksheetText} weight="bold">View Verified Marksheet</AppText>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* Accordion / Info */}
                            <TouchableOpacity style={styles.accordion} onPress={() => setIsBioExpanded(!isBioExpanded)}>
                                <View style={styles.row}>
                                    <Ionicons name="information-circle" size={18} color={theme.colors.textMuted} />
                                    <AppText style={styles.accordionTitle}>About Me & Background</AppText>
                                </View>
                                <Ionicons name={isBioExpanded ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                            {isBioExpanded && (
                                <View style={styles.bioContent}>
                                    <AppText weight="bold" style={[styles.bioText, { marginBottom: 4, color: 'white' }]}>Bio:</AppText>
                                    <AppText style={styles.bioText}>{about || "No bio available."}</AppText>

                                    {coreSubjects && coreSubjects.length > 0 && (
                                        <>
                                            <AppText weight="bold" style={[styles.bioText, { marginTop: 15, marginBottom: 4, color: 'white' }]}>Core Subjects:</AppText>
                                            <AppText style={styles.bioText}>{coreSubjects.join(', ')}</AppText>
                                        </>
                                    )}

                                    {achievements && achievements.length > 0 && (
                                        <>
                                            <AppText weight="bold" style={[styles.bioText, { marginTop: 15, marginBottom: 4, color: 'white' }]}>Achievements:</AppText>
                                            {achievements.map((ach, idx) => (
                                                <AppText key={idx} style={styles.bioText}>• {ach}</AppText>
                                            ))}
                                        </>
                                    )}

                                </View>
                            )}
                        </View>
                    </>
                )}

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => handleTabPress(tab)}
                        >
                            <AppText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Swipeable Tab Sections */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScrollEnd}
                >
                    {tabs.map((tab, idx) => {
                        const dynamicCount = stats.totalNotes > 0 ? stats.totalNotes : 4;
                        return (
                            <View key={tab} style={{ width }}>
                                <View style={styles.uploadsSection}>
                                    <View style={styles.rowBetween}>
                                        <AppText style={styles.sectionTitle} weight="bold">{idx === 1 ? 'Bundles' : (idx === 2 ? 'Free Uploads' : 'Latest Uploads')}</AppText>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (isPreview) {
                                                    navigation.navigate('MyUploads');
                                                } else {
                                                    navigation.navigate('Home', {
                                                        screen: 'Store',
                                                        params: {
                                                            topperId: topperId,
                                                            sortBy: idx === 2 ? 'price_low' : 'newest',
                                                        }
                                                    });
                                                }
                                            }}
                                        >
                                            <AppText style={styles.viewAllText}>View all</AppText>
                                        </TouchableOpacity>
                                    </View>

                                    {isLoading ? (
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginTop: 15 }}>
                                            {[...Array(dynamicCount)].map((_, i) => (
                                                <LibraryNoteSkeleton key={i} />
                                            ))}
                                        </View>
                                    ) : (
                                        idx === 0 ? (
                                            latestUploads.length > 0 ? (
                                                latestUploads.map(item => (
                                                    <View key={item.id} style={{ marginBottom: 15 }}>{renderNoteCard({ item })}</View>
                                                ))
                                            ) : (
                                                <View style={{ marginTop: 20, alignItems: 'center' }}>
                                                    <AppText style={{ color: theme.colors.textMuted }}>No notes available.</AppText>
                                                </View>
                                            )
                                        ) : idx === 1 ? (
                                            <View style={{ marginTop: 20, alignItems: 'center' }}>
                                                <AppText style={{ color: '#94A3B8' }}>No bundles found.</AppText>
                                            </View>
                                        ) : (
                                            <View style={{ marginTop: 20, alignItems: 'center' }}>
                                                <AppText style={{ color: theme.colors.textMuted }}>No free material available.</AppText>
                                            </View>
                                        )
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

            </ScrollView>

            <BottomSheet visible={isOptionsVisible} onClose={() => setIsOptionsVisible(false)}>
                <View style={[styles.modalHeader, { paddingBottom: 15 }]}>
                    <AppText style={styles.modalTitle} weight="bold">Profile Options</AppText>
                    <TouchableOpacity onPress={() => setIsOptionsVisible(false)}>
                        <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.optionBtn} onPress={handleShare}>
                    <View style={styles.optionIconContainer}>
                        <Ionicons name="share-social-outline" size={22} color="white" />
                    </View>
                    <AppText style={styles.optionText} weight="medium">Share Profile</AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionBtn} onPress={handleCopyLink}>
                    <View style={styles.optionIconContainer}>
                        <Ionicons name="link-outline" size={22} color="white" />
                    </View>
                    <AppText style={styles.optionText} weight="medium">Copy Profile Link</AppText>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.optionBtn, styles.deleteOptionBtn]} onPress={handleReport}>
                    <View style={[styles.optionIconContainer, { backgroundColor: theme.colors.danger + '20' }]}>
                        <Ionicons name="flag-outline" size={22} color={theme.colors.danger} />
                    </View>
                    <AppText style={[styles.optionText, { color: theme.colors.danger }]} weight="medium">Report Profile</AppText>
                </TouchableOpacity>
            </BottomSheet>
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 15,
    },
    iconBtn: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: theme.colors.card,
    },
    verifyBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
    },
    name: {
        color: theme.colors.text,
        fontSize: 22,
        marginBottom: 8,
    },
    credentialsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '20',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 10,
    },
    credentialsText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    highlightPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.warning + '10',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.warning + '20',
        gap: 4,
    },
    highlightText: {
        color: theme.colors.warning,
        fontSize: 11,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 25,
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: theme.colors.card,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statValue: {
        color: theme.colors.text,
        fontSize: 18,
        marginBottom: 4,
    },
    statLabel: {
        color: theme.colors.textSubtle,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    actionButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 15,
        marginBottom: 25,
    },
    followBtn: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    followText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    messageBtn: {
        flex: 1,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    messageText: {
        color: theme.colors.textSubtle,
        fontWeight: '600',
        fontSize: 16,
    },
    accordion: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    accordionTitle: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    bioContent: {
        width: '100%',
        backgroundColor: theme.colors.card,
        padding: 15,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        marginTop: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    bioText: {
        color: theme.colors.textSubtle,
        fontSize: 14,
        lineHeight: 20,
    },
    marksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.surface + '80',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: theme.colors.border + '40',
    },
    marksSubject: {
        color: theme.colors.text,
        fontSize: 13,
        fontWeight: '500',
    },
    markBadge: {
        backgroundColor: theme.colors.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    markValue: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    marksheetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
        gap: 8,
    },
    marksheetText: {
        color: 'white',
        fontSize: 14,
    },
    emptyText: {
        color: theme.colors.textMuted,
        fontSize: 14,
        marginTop: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        color: theme.colors.text,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + '20',
    },
    deleteOptionBtn: {
        borderBottomWidth: 0,
        marginTop: 5,
    },
    optionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    optionText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    tab: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textSubtle,
        fontSize: 12,
        fontWeight: '500',
    },
    activeTabText: {
        color: 'white',
        fontWeight: '600',
    },
    uploadsSection: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        color: theme.colors.text,
        fontSize: 18,
    },
    viewAllText: {
        color: theme.colors.primary,
        fontSize: 12,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    noteThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        position: 'relative',
        marginRight: 15,
    },
    thumbnailImg: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    pageBadge: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    pageText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    noteInfo: {
        flex: 1,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    subjectTag: {
        backgroundColor: theme.colors.warning + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    subjectText: {
        color: theme.colors.warning,
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: 'bold',
    },
    noteTitle: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        lineHeight: 20,
    },
    noteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    strikePrice: {
        color: theme.colors.textSubtle,
        fontSize: 10,
        textDecorationLine: 'line-through',
    },
    price: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnTopper: {
        position: 'absolute',
        top: 5,
        left: 5,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
});

export default PublicTopperProfile;
