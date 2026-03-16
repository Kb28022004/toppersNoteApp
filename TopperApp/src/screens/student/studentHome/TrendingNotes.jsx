import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../../components/AppText';
import NoDataFound from '../../../components/NoDataFound';
import useTheme from '../../../hooks/useTheme';
import { NoteSkeleton } from '../../../components/skeletons/HomeSkeletons';

const { width } = Dimensions.get('window');

const HomeNoteCard = ({ item, onNavigate, onToggleFavorite, theme, styles, isDarkMode }) => (
    <TouchableOpacity
        activeOpacity={0.9}
        style={styles.noteCard}
        onPress={() => onNavigate('StudentNoteDetails', { noteId: item._id })}
    >
        <View style={styles.imageContainer}>
            <Image
                source={item.thumbnail ? { uri: item.thumbnail } : require('../../../../assets/topper.avif')}
                style={styles.noteImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
            />
            <LinearGradient
                colors={['transparent', theme.colors.overlay]}
                style={styles.imageGradient}
            />
            <TouchableOpacity
                style={styles.saveBtnHome}
                onPress={() => onToggleFavorite(item._id)}
            >
                <Ionicons
                    name={item.isFavorite ? "heart" : "heart-outline"}
                    size={18}
                    color={item.isFavorite ? theme.colors.danger : theme.colors.textInverse}
                />
            </TouchableOpacity>

            <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color={theme.colors.warning} />
                <AppText style={styles.ratingText}>{item.stats?.ratingAvg || '4.8'}</AppText>
            </View>
            {item.price === 0 && (
                <View style={styles.freeBadge}>
                    <AppText style={styles.freeText} weight="bold">FREE</AppText>
                </View>
            )}
        </View>

        <View style={styles.noteDetails}>
            <AppText style={styles.noteTitle} weight="bold" numberOfLines={1}>{item.subject} • {item.chapterName}</AppText>
            <View style={styles.authorRow}>
                <Image
                    source={item.topperId?.profilePhoto ? { uri: item.topperId.profilePhoto } : require('../../../../assets/topper.avif')}
                    style={styles.authorAvatar}
                />
                <AppText style={styles.authorName} numberOfLines={1}>{item.topperId?.fullName || 'Topper'}</AppText>
                <MaterialCommunityIcons name="check-decagram" size={14} color={theme.colors.primary} />
            </View>
            <View style={styles.priceRow}>
                <AppText style={styles.price} weight="bold">₹{typeof item.price === 'object' ? item.price.current : item.price}</AppText>
                <View style={[styles.addButton, { backgroundColor: item.isPurchased ? theme.colors.success + '20' : theme.colors.primary + '20' }]}>
                    <Ionicons
                        name={item.isPurchased ? "checkmark-circle" : "arrow-forward"}
                        size={16}
                        color={item.isPurchased ? theme.colors.success : theme.colors.primary}
                    />
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const TrendingNotes = ({ notes, loading, fetching, navigation, onToggleFavorite }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const showLoading = loading || fetching;
    const notesCount = notes?.length > 0 ? notes.length : 3;

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <View>
                    <AppText style={styles.sectionTitle} weight="bold">Trending Notes For You</AppText>
                    <AppText style={styles.sectionSub}>Based on your class & board</AppText>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Store')}>
                    <AppText style={styles.seeAllText}>See All</AppText>
                </TouchableOpacity>
            </View>

            {showLoading ? (
                <View style={[styles.notesList, { flexDirection: 'row' }]}>
                    {[...Array(notesCount)].map((_, i) => (
                        <NoteSkeleton key={i} />
                    ))}
                </View>
            ) : (
                <FlatList
                    data={notes}
                    renderItem={({ item }) => (
                        <HomeNoteCard
                            item={item}
                            onNavigate={navigation.navigate}
                            onToggleFavorite={onToggleFavorite}
                            theme={theme}
                            styles={styles}
                            isDarkMode={isDarkMode}
                        />
                    )}
                    keyExtractor={(item) => item._id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.notesList}
                    initialNumToRender={5}
                    windowSize={5}
                    maxToRenderPerBatch={5}
                    removeClippedSubviews={true}
                    ListEmptyComponent={
                        <NoDataFound
                            message="No notes matching your filters."
                            icon="document-text-outline"
                            containerStyle={{ width: width - 40 }}
                        />
                    }
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
    notesList: {
        paddingLeft: 20,
        paddingRight: 10,
        paddingBottom: 10,
    },
    noteCard: {
        width: 220,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        marginRight: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 140,
        position: 'relative',
    },
    noteImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.overlay,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    saveBtnHome: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: theme.colors.overlay,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    ratingText: {
        color: theme.colors.textInverse,
        fontSize: 11,
    },
    freeBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: theme.colors.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    freeText: {
        color: theme.colors.textInverse,
        fontSize: 10,
    },
    noteDetails: {
        padding: 16,
    },
    noteTitle: {
        fontSize: 15,
        color: theme.colors.text,
        marginBottom: 10,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    authorAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    authorName: {
        fontSize: 12,
        color: theme.colors.textMuted,
        flexShrink: 1,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        color: theme.colors.text,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default TrendingNotes;
