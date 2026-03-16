import React, { useEffect, useRef, memo, useMemo } from 'react';
import { View, Animated, StyleSheet, Dimensions, StatusBar } from 'react-native';
import useTheme from '../hooks/useTheme';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// Base Skeleton block with shimmer animation
// ─────────────────────────────────────────────
export const Skeleton = memo(({ width: w = '100%', height = 16, borderRadius = 8, style }) => {
    const { isDarkMode } = useTheme();
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

    return (
        <Animated.View
            style={[
                {
                    width: w,
                    height,
                    borderRadius,
                    backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
                    opacity,
                },
                style,
            ]}
        />
    );
});

// ─────────────────────────────────────────────
// Skeleton for a single NoteCard (grid item)
// ─────────────────────────────────────────────
export const NoteCardSkeleton = memo(() => {
    const { theme } = useTheme();
    const styles = useMemo(() => getCardSkeletonStyles(theme), [theme]);
    return (
        <View style={styles.card}>
            <Skeleton height={130} borderRadius={0} />
            <View style={styles.body}>
                <Skeleton width={50} height={10} borderRadius={4} />
                <Skeleton height={12} borderRadius={4} style={{ marginTop: 8 }} />
                <Skeleton width="70%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
                <View style={styles.row}>
                    <Skeleton width={40} height={18} borderRadius={6} />
                    <Skeleton width={26} height={26} borderRadius={13} />
                </View>
            </View>
        </View>
    );
});

const getCardSkeletonStyles = (theme) => StyleSheet.create({
    card: {
        width: (width - 40) / 2 - 10,
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    body: { padding: 12, gap: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
});

// ─────────────────────────────────────────────
// Grid of NoteCard skeletons (for Store/Home)
// ─────────────────────────────────────────────
export const NoteCardGridSkeleton = memo(({ count = 6 }) => (
    <View style={gridStyles.grid}>
        {Array.from({ length: count }).map((_, i) => (
            <NoteCardSkeleton key={i} />
        ))}
    </View>
));

const gridStyles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        paddingTop: 16,
    },
});

// ─────────────────────────────────────────────
// Skeleton for Note Details screen
// ─────────────────────────────────────────────
export const NoteDetailsSkeleton = memo(() => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => getDetailStyles(theme), [theme]);
    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header bar */}
            <View style={styles.header}>
                <Skeleton width={36} height={36} borderRadius={18} />
                <Skeleton width={120} height={16} borderRadius={8} />
                <View style={styles.headerRight}>
                    <Skeleton width={36} height={36} borderRadius={18} />
                    <Skeleton width={36} height={36} borderRadius={18} />
                </View>
            </View>

            {/* Hero image */}
            <Skeleton height={260} borderRadius={0} />

            {/* Content body */}
            <View style={styles.body}>
                {/* Title */}
                <Skeleton height={22} borderRadius={8} style={{ marginBottom: 6 }} />
                <Skeleton width="65%" height={22} borderRadius={8} style={{ marginBottom: 16 }} />

                {/* Rating row */}
                <View style={styles.row}>
                    <Skeleton width={80} height={14} borderRadius={6} />
                    <Skeleton width={60} height={14} borderRadius={6} />
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Topper card */}
                <View style={styles.topperCard}>
                    <Skeleton width={52} height={52} borderRadius={26} />
                    <View style={{ flex: 1, gap: 8 }}>
                        <Skeleton width="60%" height={14} borderRadius={6} />
                        <Skeleton width="40%" height={12} borderRadius={6} />
                    </View>
                    <Skeleton width={70} height={30} borderRadius={15} />
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    {[0, 1, 2].map(i => (
                        <View key={i} style={styles.statBox}>
                            <Skeleton width={36} height={36} borderRadius={18} />
                            <Skeleton width={40} height={14} borderRadius={6} style={{ marginTop: 6 }} />
                            <Skeleton width={50} height={10} borderRadius={4} style={{ marginTop: 4 }} />
                        </View>
                    ))}
                </View>

                {/* Description */}
                <Skeleton width={100} height={16} borderRadius={6} style={{ marginBottom: 10 }} />
                {[0, 1, 2].map(i => (
                    <Skeleton key={i} width={i === 2 ? '70%' : '100%'} height={12} borderRadius={4} style={{ marginBottom: 6 }} />
                ))}

                {/* Reviews header */}
                <View style={[styles.row, { marginTop: 20 }]}>
                    <Skeleton width={140} height={16} borderRadius={6} />
                    <Skeleton width={80} height={14} borderRadius={6} />
                </View>

                {/* Review cards */}
                {[0, 1].map(i => (
                    <View key={i} style={styles.reviewCard}>
                        <View style={styles.row}>
                            <Skeleton width={36} height={36} borderRadius={18} />
                            <View style={{ flex: 1, gap: 6 }}>
                                <Skeleton width="40%" height={12} borderRadius={4} />
                                <Skeleton width="25%" height={10} borderRadius={4} />
                            </View>
                        </View>
                        <Skeleton height={12} borderRadius={4} style={{ marginTop: 8 }} />
                        <Skeleton width="80%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
                    </View>
                ))}
            </View>
        </View>
    );
});

const getDetailStyles = (theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 55,
        paddingBottom: 14,
        backgroundColor: theme.colors.background,
    },
    headerRight: { flexDirection: 'row', gap: 10 },
    body: { padding: 20 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 18 },
    topperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
    },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
    statBox: { alignItems: 'center' },
    reviewCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
    },
});

// ─────────────────────────────────────────────
// Generic horizontal list item skeleton
// (for Library, Orders, etc.)
// ─────────────────────────────────────────────
export const ListItemSkeleton = memo(({ count = 5 }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => getListStyles(theme), [theme]);
    return (
        <View style={styles.wrapper}>
            {Array.from({ length: count }).map((_, i) => (
                <View key={i} style={styles.item}>
                    <Skeleton width={80} height={90} borderRadius={12} />
                    <View style={styles.info}>
                        <Skeleton width={50} height={10} borderRadius={4} />
                        <Skeleton height={13} borderRadius={6} style={{ marginTop: 8 }} />
                        <Skeleton width="60%" height={13} borderRadius={6} style={{ marginTop: 4 }} />
                        <Skeleton width={80} height={10} borderRadius={4} style={{ marginTop: 8 }} />
                    </View>
                </View>
            ))}
        </View>
    );
});

const getListStyles = (theme) => StyleSheet.create({
    wrapper: { paddingHorizontal: 20, paddingTop: 16 },
    item: {
        flexDirection: 'row',
        gap: 14,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    info: { flex: 1, gap: 2 },
});

// ─────────────────────────────────────────────
// Profile page skeleton
// ─────────────────────────────────────────────
export const ProfileSkeleton = memo(() => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => getProfileStyles(theme), [theme]);
    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header banner */}
            <Skeleton height={200} borderRadius={0} />

            {/* Avatar + name */}
            <View style={styles.avatarSection}>
                <Skeleton width={90} height={90} borderRadius={45} style={{ marginTop: -45 }} />
                <Skeleton width={140} height={18} borderRadius={8} style={{ marginTop: 12 }} />
                <Skeleton width={90} height={12} borderRadius={6} style={{ marginTop: 6 }} />
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={styles.statBox}>
                        <Skeleton width={40} height={20} borderRadius={6} />
                        <Skeleton width={55} height={10} borderRadius={4} style={{ marginTop: 6 }} />
                    </View>
                ))}
            </View>

            {/* Menu items */}
            <View style={styles.menuSection}>
                {[0, 1, 2, 3, 4].map(i => (
                    <View key={i} style={styles.menuItem}>
                        <Skeleton width={40} height={40} borderRadius={20} />
                        <Skeleton width="55%" height={14} borderRadius={6} />
                        <Skeleton width={20} height={20} borderRadius={10} />
                    </View>
                ))}
            </View>
        </View>
    );
});

const getProfileStyles = (theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    avatarSection: { alignItems: 'center', paddingBottom: 16 },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    statBox: { alignItems: 'center' },
    menuSection: { paddingHorizontal: 20, gap: 14 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: theme.colors.card,
        borderRadius: 14,
        padding: 14,
    },
});
