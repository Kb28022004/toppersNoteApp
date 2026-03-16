import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

// Static base styles for SkeletonBase (no theme needed — theme applied inline)
const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
        borderRadius: 8,
    },
});


const SkeletonBase = ({ style }) => {
    const { isDarkMode } = useTheme();
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };
        startAnimation();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    const shimmerColors = isDarkMode
        ? ['#1E293B', '#334155', '#1E293B']
        : ['#E2E8F0', '#F1F5F9', '#E2E8F0'];

    return (
        <Animated.View style={[styles.skeleton, style, { opacity, backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
            <LinearGradient
                colors={shimmerColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
            />
        </Animated.View>
    );
};

export const NoteSkeleton = ({ style }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={[styles.noteCard, style]}>
            <SkeletonBase style={styles.noteImage} />
            <View style={styles.noteDetails}>
                <SkeletonBase style={styles.titleLine} />
                <View style={styles.authorRow}>
                    <SkeletonBase style={styles.avatar} />
                    <SkeletonBase style={styles.nameLine} />
                </View>
                <View style={styles.priceRow}>
                    <SkeletonBase style={styles.priceLine} />
                    <SkeletonBase style={styles.button} />
                </View>
            </View>
        </View>
    );
};

export const TopperSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.topperCard}>
            <SkeletonBase style={styles.topperAvatar} />
            <SkeletonBase style={styles.topperName} />
            <SkeletonBase style={styles.topperBadge} />
        </View>
    );
};

const STORE_CARD_WIDTH = (width - 40) / 2 - 10;

export const StoreNoteSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={[styles.noteCard, { width: STORE_CARD_WIDTH }]}>
            <SkeletonBase style={styles.noteImage} />
            <View style={styles.noteDetails}>
                <SkeletonBase style={[styles.titleLine, { width: '40%', height: 10 }]} />
                <SkeletonBase style={[styles.titleLine, { width: '90%', height: 5, marginTop: 4 }]} />
                <SkeletonBase style={[styles.titleLine, { width: '70%', height: 5, marginTop: 4 }]} />
                <View style={[styles.priceRow, { marginTop: 12 }]}>
                    <SkeletonBase style={[styles.priceLine, { width: '50%' }]} />
                    <SkeletonBase style={styles.button} />
                </View>
            </View>
        </View>
    );
};

export const TopperListSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.topperListCard}>
            <View style={styles.cardHeader}>
                <SkeletonBase style={styles.listAvatar} />
                <View style={styles.headerInfo}>
                    <SkeletonBase style={[styles.titleLine, { width: '60%' }]} />
                    <SkeletonBase style={[styles.titleLine, { width: '40%', height: 10 }]} />
                </View>
            </View>
            <SkeletonBase style={[styles.titleLine, { width: '100%', height: 36, marginTop: 4 }]} />
            <View style={styles.statsRowSkeleton}>
                <SkeletonBase style={styles.statLine} />
                <View style={styles.divider} />
                <SkeletonBase style={styles.statLine} />
                <View style={styles.divider} />
                <SkeletonBase style={styles.statLine} />
            </View>
        </View>
    );
};

const LIB_CARD_WIDTH = (width - 60) / 2;

export const LibraryNoteSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.libCard}>
            <SkeletonBase style={styles.libCover} />
            <View style={styles.libInfo}>
                <SkeletonBase style={[styles.titleLine, { width: '40%', height: 10, marginBottom: 4 }]} />
                <SkeletonBase style={[styles.titleLine, { width: '90%', height: 14, marginBottom: 4 }]} />
                <SkeletonBase style={[styles.titleLine, { width: '60%', height: 10, marginBottom: 10 }]} />
                <View style={[styles.priceRow, { marginTop: 10 }]}>
                    <SkeletonBase style={{ width: 60, height: 24, borderRadius: 8 }} />
                </View>
            </View>
        </View>
    );
};

export const FollowingSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.followingCard}>
            <View style={styles.followingLeft}>
                <SkeletonBase style={styles.followingAvatar} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <SkeletonBase style={[styles.titleLine, { width: '60%', marginBottom: 6 }]} />
                    <SkeletonBase style={[styles.titleLine, { width: '40%', height: 10 }]} />
                </View>
            </View>
            <SkeletonBase style={{ width: 20, height: 20, borderRadius: 4 }} />
        </View>
    );
};

export const TransactionSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.transactionCard}>
            <View style={styles.transHeader}>
                <SkeletonBase style={styles.transIcon} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <SkeletonBase style={[styles.titleLine, { width: '70%', marginBottom: 6 }]} />
                    <SkeletonBase style={[styles.titleLine, { width: '40%', height: 10 }]} />
                </View>
                <SkeletonBase style={{ width: 50, height: 18, borderRadius: 4 }} />
            </View>
            <View style={styles.transFooter}>
                <SkeletonBase style={{ width: 80, height: 20, borderRadius: 10 }} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <SkeletonBase style={{ width: 60, height: 15, borderRadius: 4 }} />
                    <SkeletonBase style={{ width: 60, height: 15, borderRadius: 4 }} />
                </View>
            </View>
        </View>
    );
};

export const StatCardSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.statCardSkeleton}>
            <SkeletonBase style={styles.statIconSkeleton} />
            <View style={{ flex: 1 }}>
                <SkeletonBase style={[styles.titleLine, { width: '60%', height: 16, marginBottom: 4 }]} />
                <SkeletonBase style={[styles.titleLine, { width: '40%', height: 10 }]} />
            </View>
        </View>
    );
};

export const NoteStripSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.stripCardSkeleton}>
            <View style={styles.rowBetweenSkeleton}>
                <SkeletonBase style={styles.stripIconSkeleton} />
                <SkeletonBase style={styles.stripBadgeSkeleton} />
            </View>
            <View style={{ marginTop: 12 }}>
                <SkeletonBase style={[styles.titleLine, { width: '90%', height: 14, marginBottom: 6 }]} />
                <SkeletonBase style={[styles.titleLine, { width: '60%', height: 10 }]} />
            </View>
            <View style={[styles.rowBetweenSkeleton, { marginTop: 15 }]}>
                <SkeletonBase style={{ width: 40, height: 14, borderRadius: 4 }} />
                <SkeletonBase style={{ width: 60, height: 20, borderRadius: 10 }} />
            </View>
        </View>
    );
};
export const RevenueCardSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.revenueCardSkeleton}>
            <View style={styles.rowBetweenSkeleton}>
                <View>
                    <SkeletonBase style={{ width: 100, height: 10, marginBottom: 12 }} />
                    <SkeletonBase style={{ width: 140, height: 36, borderRadius: 8 }} />
                </View>
                <SkeletonBase style={{ width: 60, height: 24, borderRadius: 10 }} />
            </View>
            <View style={[styles.divider, { width: '100%', marginVertical: 20 }]} />
            <View style={styles.rowBetweenSkeleton}>
                <View style={{ flex: 1 }}>
                    <SkeletonBase style={{ width: 80, height: 12, marginBottom: 6 }} />
                    <SkeletonBase style={{ width: 60, height: 18 }} />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <SkeletonBase style={{ width: 80, height: 12, marginBottom: 6 }} />
                    <SkeletonBase style={{ width: 60, height: 18 }} />
                </View>
            </View>
            <SkeletonBase style={{ width: '100%', height: 48, borderRadius: 16, marginTop: 25 }} />
        </View>
    );
};

export const ActionGridSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.actionGridSkeleton}>
            {[...Array(4)].map((_, i) => (
                <View key={i} style={styles.actionItemSkeleton}>
                    <SkeletonBase style={styles.actionIconSkeleton} />
                    <SkeletonBase style={{ width: 50, height: 10, borderRadius: 4 }} />
                </View>
            ))}
        </View>
    );
};

export const DashboardNoteSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.dashNoteSkeleton}>
            <SkeletonBase style={styles.dashNoteIcon} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <SkeletonBase style={{ width: '70%', height: 14, marginBottom: 8 }} />
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    <SkeletonBase style={{ width: 60, height: 18, borderRadius: 6 }} />
                    <SkeletonBase style={{ width: 80, height: 18, borderRadius: 6 }} />
                </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <SkeletonBase style={{ width: 40, height: 18, marginBottom: 4 }} />
                <SkeletonBase style={{ width: 50, height: 10 }} />
            </View>
        </View>
    );
};
export const ReviewSkeleton = ({ showNoteInfo = true }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.reviewSkeletonCard}>
            <View style={styles.reviewHeaderSkeleton}>
                <SkeletonBase style={styles.reviewAvatarSkeleton} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <SkeletonBase style={{ width: '40%', height: 16, marginBottom: 6 }} />
                    <SkeletonBase style={{ width: '60%', height: 10 }} />
                </View>
                <SkeletonBase style={styles.reviewRatingSkeleton} />
            </View>
            <SkeletonBase style={{ width: '90%', height: 12, marginBottom: 8 }} />
            <SkeletonBase style={{ width: '100%', height: 12, marginBottom: 8 }} />
            <SkeletonBase style={{ width: '40%', height: 12, marginBottom: showNoteInfo ? 15 : 0 }} />
            {showNoteInfo && <SkeletonBase style={styles.reviewNoteRefSkeleton} />}
        </View>
    );
};
export const BuyerSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.buyerSkeletonCard}>
            <SkeletonBase style={styles.buyerAvatarSkeleton} />
            <View style={styles.buyerInfoSkeleton}>
                <SkeletonBase style={{ width: '50%', height: 16, marginBottom: 6 }} />
                <SkeletonBase style={{ width: '70%', height: 12 }} />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <SkeletonBase style={{ width: 60, height: 10, marginBottom: 6 }} />
                <SkeletonBase style={{ width: 80, height: 18, borderRadius: 8 }} />
            </View>
        </View>
    );
};

export const NoteDetailsSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.detailsSkeleton}>
            <SkeletonBase style={styles.detailsStatusSkeleton} />
            <View style={styles.detailsStatsSkeleton}>
                <View style={styles.detailsStatItemSkeleton}>
                    <SkeletonBase style={{ width: 40, height: 20, marginBottom: 4 }} />
                    <SkeletonBase style={{ width: 60, height: 10 }} />
                </View>
                <View style={styles.detailsStatDivider} />
                <View style={styles.detailsStatItemSkeleton}>
                    <SkeletonBase style={{ width: 50, height: 20, marginBottom: 4 }} />
                    <SkeletonBase style={{ width: 60, height: 10 }} />
                </View>
                <View style={styles.detailsStatDivider} />
                <View style={styles.detailsStatItemSkeleton}>
                    <SkeletonBase style={{ width: 40, height: 20, marginBottom: 4 }} />
                    <SkeletonBase style={{ width: 60, height: 10 }} />
                </View>
            </View>
            <SkeletonBase style={styles.detailsPreviewSkeleton} />
            <View style={{ paddingHorizontal: 20 }}>
                <SkeletonBase style={{ width: '80%', height: 22, marginBottom: 8 }} />
                <SkeletonBase style={{ width: '60%', height: 14, marginBottom: 25 }} />
                <View style={styles.detailsMetaGridSkeleton}>
                    {[...Array(3)].map((_, i) => (
                        <SkeletonBase key={i} style={styles.detailsMetaItemSkeleton} />
                    ))}
                </View>
                <SkeletonBase style={{ width: 100, height: 18, marginBottom: 12, marginTop: 10 }} />
                <SkeletonBase style={{ width: '100%', height: 12, marginBottom: 8 }} />
                <SkeletonBase style={{ width: '100%', height: 12, marginBottom: 8 }} />
                <SkeletonBase style={{ width: '70%', height: 12, marginBottom: 30 }} />
            </View>
        </View>
    );
};

export const EarningsSummarySkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.summarySkeleton}>
            <View style={styles.mainStatSkeleton}>
                <View style={{ flex: 1 }}>
                    <SkeletonBase style={{ width: 120, height: 12, marginBottom: 8 }} />
                    <SkeletonBase style={{ width: 160, height: 32, borderRadius: 8 }} />
                </View>
                <SkeletonBase style={{ width: 110, height: 40, borderRadius: 14 }} />
            </View>
            <View style={styles.statsGridSkeleton}>
                {[...Array(4)].map((_, i) => (
                    <View key={i} style={styles.subStatSkeleton}>
                        <SkeletonBase style={{ width: 80, height: 10, marginBottom: 6 }} />
                        <SkeletonBase style={{ width: 60, height: 18, borderRadius: 4 }} />
                    </View>
                ))}
            </View>
            <View style={styles.settingsSkeleton}>
                <SkeletonBase style={styles.settingsIconSkeleton} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <SkeletonBase style={{ width: 120, height: 14, marginBottom: 6 }} />
                    <SkeletonBase style={{ width: 160, height: 10 }} />
                </View>
                <SkeletonBase style={{ width: 20, height: 20, borderRadius: 10 }} />
            </View>
        </View>
    );
};

export const EarningsTransactionSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.earningTransSkeleton}>
            <View style={styles.transHeaderSkeleton}>
                <SkeletonBase style={styles.transIconBoxSkeleton} />
                <View style={styles.transInfoSkeleton}>
                    <SkeletonBase style={{ width: '60%', height: 14, marginBottom: 6 }} />
                    <SkeletonBase style={{ width: '40%', height: 10 }} />
                </View>
                <SkeletonBase style={{ width: 60, height: 18, borderRadius: 4 }} />
            </View>
            <View style={styles.transFooterSkeleton}>
                <SkeletonBase style={{ width: 100, height: 12, borderRadius: 4 }} />
                <SkeletonBase style={{ width: 60, height: 20, borderRadius: 6 }} />
            </View>
        </View>
    );
};

export const FollowerSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.followerSkeletonCard}>
            <SkeletonBase style={styles.followerAvatarSkeleton} />
            <View style={styles.followerInfoSkeleton}>
                <SkeletonBase style={[styles.titleLine, { width: '50%', height: 16, marginBottom: 6 }]} />
                <SkeletonBase style={[styles.titleLine, { width: '70%', height: 12, marginBottom: 6 }]} />
                <SkeletonBase style={[styles.titleLine, { width: '30%', height: 10 }]} />
            </View>
            <SkeletonBase style={{ width: 14, height: 14, borderRadius: 7, marginLeft: 10 }} />
        </View>
    );
};

export const SoldNoteSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.soldNoteSkeleton}>
            <SkeletonBase style={styles.soldIconSkeleton} />
            <View style={{ flex: 1, marginLeft: 14 }}>
                <SkeletonBase style={{ width: '65%', height: 15, marginBottom: 6 }} />
                <SkeletonBase style={{ width: '40%', height: 10, marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <SkeletonBase style={{ width: 60, height: 12, borderRadius: 4 }} />
                    <SkeletonBase style={{ width: 50, height: 12, borderRadius: 4 }} />
                </View>
            </View>
            <SkeletonBase style={{ width: 14, height: 14, borderRadius: 7 }} />
        </View>
    );
};

export const UploadNoteSkeleton = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.uploadNoteSkeleton}>
            <SkeletonBase style={styles.uploadIconSkeleton} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <SkeletonBase style={{ width: '60%', height: 14, marginBottom: 6 }} />
                <SkeletonBase style={{ width: '80%', height: 10, marginBottom: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <SkeletonBase style={{ width: 40, height: 12 }} />
                    <SkeletonBase style={{ width: 50, height: 12 }} />
                </View>
            </View>
            <SkeletonBase style={styles.uploadBadgeSkeleton} />
        </View>
    );
};

export const HeaderSkeleton = ({ style }) => (
    <View style={[styles.headerSkeleton, style]}>
        <View style={styles.headerLeftSkeleton}>
            <SkeletonBase style={styles.avatarSkeleton} />
            <View style={{ marginLeft: 12 }}>
                <SkeletonBase style={[styles.titleLine, { width: 80, height: 10, marginBottom: 6 }]} />
                <SkeletonBase style={[styles.titleLine, { width: 120, height: 16 }]} />
            </View>
        </View>
        <View style={styles.headerRightSkeleton}>
            <SkeletonBase style={styles.iconButtonSkeleton} />
            <SkeletonBase style={styles.iconButtonSkeleton} />
        </View>
    </View>
);

export const NotificationSkeleton = () => (
    <View style={styles.notificationSkeletonCard}>
        <SkeletonBase style={styles.notifIcon} />
        <View style={styles.notifContent}>
            <SkeletonBase style={[styles.titleLine, { width: '40%', height: 14, marginBottom: 8 }]} />
            <SkeletonBase style={[styles.titleLine, { width: '90%', height: 10, marginBottom: 6 }]} />
            <SkeletonBase style={[styles.titleLine, { width: '30%', height: 8 }]} />
        </View>
    </View>
);

export const ProfileHeaderSkeleton = () => (
    <View style={styles.profileHeader}>
        <SkeletonBase style={styles.largeAvatar} />
        <SkeletonBase style={[styles.titleLine, { width: '50%', height: 24, alignSelf: 'center', marginTop: 15 }]} />
        <SkeletonBase style={[styles.titleLine, { width: '70%', height: 32, alignSelf: 'center', marginTop: 10, borderRadius: 20 }]} />
        <View style={styles.statsRowProfile}>
            <SkeletonBase style={styles.statBoxSkeleton} />
            <SkeletonBase style={styles.statBoxSkeleton} />
            <SkeletonBase style={styles.statBoxSkeleton} />
        </View>
    </View>
);

const createStyles = (theme) => StyleSheet.create({
    skeleton: {
        borderRadius: 4,
        overflow: 'hidden',
    },
    noteCard: {
        width: 220,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        marginBottom: 20,
        height: 220
    },
    noteImage: {
        width: '100%',
        height: 140,
    },
    noteDetails: {
        padding: 16,
    },
    titleLine: {
        height: 15,
        width: '80%',
        borderRadius: 4,
        marginBottom: 10,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    nameLine: {
        height: 12,
        width: '40%',
        borderRadius: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLine: {
        height: 20,
        width: '30%',
        borderRadius: 4,
    },
    button: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    topperCard: {
        width: 90,
        alignItems: 'center',
        marginRight: 20,
    },
    topperAvatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        marginBottom: 10,
    },
    topperName: {
        width: '60%',
        height: 12,
        borderRadius: 4,
        marginBottom: 6,
    },
    topperBadge: {
        width: '80%',
        height: 14,
        borderRadius: 8,
    },
    topperListCard: {
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
    listAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    statsRowSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginTop: 15,
    },
    statLine: {
        flex: 1,
        height: 12,
        marginHorizontal: 10,
        borderRadius: 4,
    },
    divider: {
        width: 1,
        height: 15,
        backgroundColor: theme.colors.border,
    },
    libCard: {
        width: LIB_CARD_WIDTH,
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        margin: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    libCover: {
        width: '100%',
        height: 160,
    },
    libInfo: {
        padding: 12,
    },
    followingCard: {
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
    followingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    followingAvatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
    },
    transactionCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    transHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    transIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    transFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border + '50',
    },
    profileHeader: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 20,
    },
    largeAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    statsRowProfile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 25,
        gap: 12,
    },
    statBoxSkeleton: {
        flex: 1,
        height: 70,
        borderRadius: 12,
    },
    notificationSkeletonCard: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        alignItems: 'center',
    },
    notifIcon: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 15,
    },
    notifContent: {
        flex: 1,
    },
    revenueCardSkeleton: {
        marginHorizontal: 20,
        backgroundColor: theme.colors.card,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 30,
    },
    actionGridSkeleton: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        marginBottom: 35,
    },
    actionItemSkeleton: {
        alignItems: 'center',
        width: (width - 40) / 4.5,
    },
    actionIconSkeleton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        marginBottom: 8,
    },
    dashNoteSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 12,
        marginHorizontal: 20,
    },
    dashNoteIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
    },
    uploadNoteSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    uploadIconSkeleton: {
        width: 44,
        height: 44,
        borderRadius: 12,
    },
    uploadBadgeSkeleton: {
        width: 60,
        height: 20,
        borderRadius: 8,
        marginLeft: 10,
    },
    soldNoteSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    soldIconSkeleton: {
        width: 46,
        height: 46,
        borderRadius: 12,
    },
    followerSkeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 14,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    followerAvatarSkeleton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 14,
    },
    followerInfoSkeleton: {
        flex: 1,
    },
    reviewSkeletonCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    reviewHeaderSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    reviewAvatarSkeleton: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    reviewRatingSkeleton: {
        width: 40,
        height: 24,
        borderRadius: 8,
    },
    reviewNoteRefSkeleton: {
        width: '100%',
        height: 36,
        borderRadius: 12,
    },
    headerSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 100,
        paddingTop: 50, // Match Theme.header.container
    },
    headerLeftSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarSkeleton: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    headerRightSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButtonSkeleton: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    statCardSkeleton: {
        width: '48%',
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statIconSkeleton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        marginRight: 12,
    },
    stripCardSkeleton: {
        width: 160,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 180,
    },
    rowBetweenSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stripIconSkeleton: {
        width: 38,
        height: 38,
        borderRadius: 10,
    },
    stripBadgeSkeleton: {
        width: 50,
        height: 16,
        borderRadius: 6,
    },
    summarySkeleton: {
        padding: 20,
    },
    mainStatSkeleton: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statsGridSkeleton: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        marginBottom: 25,
    },
    subStatSkeleton: {
        width: (width - 55) / 2,
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    settingsSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card + '60',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 20,
    },
    settingsIconSkeleton: {
        width: 44,
        height: 44,
        borderRadius: 14,
    },
    earningTransSkeleton: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginHorizontal: 0,
    },
    transHeaderSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    transIconBoxSkeleton: {
        width: 40,
        height: 40,
        borderRadius: 12,
    },
    transInfoSkeleton: {
        flex: 1,
        marginLeft: 12,
    },
    transFooterSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    detailsSkeleton: {
        flex: 1,
    },
    detailsStatusSkeleton: {
        height: 50,
        margin: 20,
        borderRadius: 16,
    },
    detailsStatsSkeleton: {
        flexDirection: 'row',
        backgroundColor: theme.colors.card,
        marginHorizontal: 20,
        marginBottom: 25,
        borderRadius: 20,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    detailsStatItemSkeleton: {
        flex: 1,
        alignItems: 'center',
    },
    detailsStatDivider: {
        width: 1,
        height: '60%',
        backgroundColor: theme.colors.border,
        alignSelf: 'center',
    },
    detailsPreviewSkeleton: {
        height: 380,
        width: width - 40,
        marginHorizontal: 20,
        borderRadius: 20,
        marginBottom: 25,
    },
    detailsMetaGridSkeleton: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        marginBottom: 25,
    },
    detailsMetaItemSkeleton: {
        width: 120,
        height: 40,
        borderRadius: 12,
    },
    buyerSkeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buyerAvatarSkeleton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    buyerInfoSkeleton: {
        flex: 1,
    },
});

export default SkeletonBase;
