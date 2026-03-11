import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../../components/AppText';
import NoDataFound from '../../../components/NoDataFound';

const { width } = Dimensions.get('window');

const HomeNoteCard = ({ item, onNavigate, onToggleFavorite }) => (
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
                colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
                style={styles.imageGradient}
            />
            <TouchableOpacity
                style={styles.saveBtnHome}
                onPress={() => onToggleFavorite(item._id)}
            >
                <Ionicons
                    name={item.isFavorite ? "heart" : "heart-outline"}
                    size={18}
                    color={item.isFavorite ? "#F43F5E" : "white"}
                />
            </TouchableOpacity>

            <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FBBF24" />
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
                <MaterialCommunityIcons name="check-decagram" size={14} color="#00B1FC" />
            </View>
            <View style={styles.priceRow}>
                <AppText style={styles.price} weight="bold">₹{typeof item.price === 'object' ? item.price.current : item.price}</AppText>
                <View style={[styles.addButton, { backgroundColor: item.isPurchased ? '#10B98120' : '#00B1FC20' }]}>
                    <Ionicons
                        name={item.isPurchased ? "checkmark-circle" : "arrow-forward"}
                        size={16}
                        color={item.isPurchased ? '#10B981' : '#00B1FC'}
                    />
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

import { NoteSkeleton } from '../../../components/skeletons/HomeSkeletons';

const TrendingNotes = ({ notes, loading, fetching, navigation, onToggleFavorite }) => {
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
                        <NoteSkeleton key={i} style={{ marginRight: 16 }} />
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

                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
        color: 'white',
    },
    sectionSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    seeAllText: {
        fontSize: 14,
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    notesList: {
        paddingLeft: 20,
        paddingRight: 10,
        paddingBottom: 10,
    },
    noteCard: {
        width: 220,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#334155',
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
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    saveBtnHome: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    ratingText: {
        color: 'white',
        fontSize: 11,
    },
    freeBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    freeText: {
        color: 'white',
        fontSize: 10,
    },
    noteDetails: {
        padding: 16,
    },
    noteTitle: {
        fontSize: 15,
        color: 'white',
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
        color: '#94A3B8',
        flexShrink: 1,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        color: 'white',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    updatingText: {
        fontSize: 10,
        color: '#00B1FC',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});

export default TrendingNotes;
