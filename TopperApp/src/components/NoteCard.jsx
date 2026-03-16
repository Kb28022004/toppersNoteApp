import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import useTheme from '../hooks/useTheme';

import { useToggleFavoriteNoteMutation } from '../features/api/noteApi';
import { useAlert } from '../context/AlertContext';

const { width } = Dimensions.get('window');

const NoteCard = memo(({ note, onPress }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [toggleFavorite] = useToggleFavoriteNoteMutation();
    const { showAlert } = useAlert();

    const handleToggleFavorite = useCallback(async () => {
        try {
            await toggleFavorite(note?._id || note?.id).unwrap();
        } catch (error) {
            console.error("Favorite Note Error:", error);
            showAlert("Error", "Failed to update favorite status", "error");
        }
    }, [toggleFavorite, note?._id, note?.id]);

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
            <View style={styles.imageWrapper}>
                <Image
                    source={note?.thumbnail ? { uri: note?.thumbnail } : require('../../assets/topper.avif')}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                />
                <LinearGradient
                    colors={['transparent', isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)']}
                    style={styles.gradient}
                />

                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleToggleFavorite}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={note?.isFavorite ? "heart" : "heart-outline"}
                        size={18}
                        color={note?.isFavorite ? "#F43F5E" : (isDarkMode ? "white" : theme.colors.text)}
                    />
                </TouchableOpacity>

                <View style={styles.ratingBox}>
                    <Ionicons name="star" size={10} color="#FBBF24" />
                    <AppText style={styles.ratingVal}>{note?.stats?.ratingAvg || '4.5'}</AppText>
                </View>

                <View style={styles.classTag}>
                    <AppText style={styles.classTagText}>CL-{note?.class}</AppText>
                </View>
            </View>

            <View style={styles.details}>
                <AppText style={styles.subjectText} weight="bold">{note?.subject?.toUpperCase()}</AppText>
                <AppText style={styles.titleText} numberOfLines={2} weight="medium">
                    {note?.title || note?.chapterName}
                </AppText>

                <View style={styles.footerRow}>
                    <AppText style={styles.priceText} weight="bold">₹{typeof note?.price === 'object' ? note.price.current : (note?.price || '0')}</AppText>
                    <View style={[styles.statusIndicator, { backgroundColor: note?.isPurchased ? '#10B98120' : theme.colors.primary + '20' }]}>
                        <Ionicons
                            name={note?.isPurchased ? "checkmark-circle" : "chevron-forward"}
                            size={14}
                            color={note?.isPurchased ? '#10B981' : theme.colors.primary}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const createStyles = (theme) => StyleSheet.create({
    card: {
        width: (width - 40) / 2 - 10,
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    imageWrapper: {
        height: 130,
        position: 'relative',
        backgroundColor: theme.colors.surface,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    ratingBox: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 3,
    },
    saveBtn: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    ratingVal: {
        color: 'white',
        fontSize: 9,
    },
    classTag: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    classTagText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    details: {
        padding: 12,
    },
    subjectText: {
        fontSize: 9,
        color: theme.colors.primary,
        letterSpacing: 1,
        marginBottom: 4,
    },
    titleText: {
        color: theme.colors.text,
        fontSize: 13,
        height: 36,
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    priceText: {
        color: theme.colors.text,
        fontSize: 15,
    },
    statusIndicator: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default NoteCard;
