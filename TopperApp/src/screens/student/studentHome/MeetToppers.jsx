import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import AppText from '../../../components/AppText';
import useTheme from '../../../hooks/useTheme';
import { TopperSkeleton } from '../../../components/skeletons/HomeSkeletons';

const { width } = Dimensions.get('window');

const TopperCircle = ({ item, onNavigate, styles }) => (
    <TouchableOpacity
        style={styles.topperCard}
        activeOpacity={0.8}
        onPress={() => onNavigate('PublicTopperProfile', { topperId: item.userId })}
    >
        <View style={styles.topperAvatarWrapper}>
            <Image
                source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../../assets/topper.avif')}
                style={styles.topperAvatar}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
            />
            <View style={styles.topperStatusDot} />
        </View>
        <AppText style={styles.topperName} numberOfLines={1} weight="medium">
            {item.name?.split(' ')[0]}
        </AppText>
        <View style={styles.topperExpertiseBadge}>
            <AppText style={styles.topperExpertiseText}>{item.stream || item.board || 'Expert'}</AppText>
        </View>
    </TouchableOpacity>
);

const MeetToppers = ({ toppers, loading, fetching, navigation }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const showLoading = loading || fetching;
    const toppersCount = toppers?.length > 0 ? toppers.length : 5;

    return (
        <View style={styles.container}>
            <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                <View>
                    <AppText style={styles.sectionTitle} weight="bold">Meet Our Toppers</AppText>
                    <AppText style={styles.sectionSub}>Learn from the best in the country</AppText>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AllToppers')}>
                    <AppText style={styles.seeAllText}>View All</AppText>
                </TouchableOpacity>
            </View>

            {showLoading ? (
                <View style={[styles.toppersList, { flexDirection: 'row' }]}>
                    {[...Array(toppersCount)].map((_, i) => (
                        <TopperSkeleton key={i} />
                    ))}
                </View>
            ) : (
                <FlatList
                    data={toppers}
                    renderItem={({ item }) => <TopperCircle item={item} onNavigate={navigation.navigate} styles={styles} />}
                    keyExtractor={(item) => item.userId}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toppersList}
                    initialNumToRender={6}
                    windowSize={5}
                    removeClippedSubviews={true}
                    ListEmptyComponent={null}
                />
            )}
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: 10,
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
    toppersList: {
        paddingLeft: 20,
        paddingRight: 10,
        paddingBottom: 10,
    },
    topperCard: {
        width: 90,
        alignItems: 'center',
        marginRight: 20,
    },
    topperAvatarWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    topperAvatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    topperStatusDot: {
        position: 'absolute',
        bottom: 2,
        right: 6,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.success,
        borderWidth: 3,
        borderColor: theme.colors.background,
    },
    topperName: {
        fontSize: 13,
        color: theme.colors.text,
        marginBottom: 4,
    },
    topperExpertiseBadge: {
        backgroundColor: theme.colors.card,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    topperExpertiseText: {
        fontSize: 9,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
});

export default MeetToppers;
