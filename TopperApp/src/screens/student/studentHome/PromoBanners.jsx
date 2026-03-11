import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../../components/AppText';

const { width } = Dimensions.get('window');

const PromoBanners = ({ navigation }) => {
    const scrollRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const promoCount = 3;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => {
                const next = (prev + 1) % promoCount;
                scrollRef.current?.scrollTo({
                    x: next * (width - 40),
                    animated: true
                });
                return next;
            });
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    return (
        <View style={styles.promoContainer}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                onMomentumScrollEnd={(e) => {
                    const contentOffset = e.nativeEvent.contentOffset.x;
                    const viewSize = e.nativeEvent.layoutMeasurement.width;
                    const index = Math.round(contentOffset / viewSize);
                    setCurrentSlide(index);
                }}
            >
                {/* Slide 1 */}
                <TouchableOpacity style={styles.promoSlide} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#3B82F6', '#1D4ED8']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.promoGradient}
                    >
                        <View style={styles.promoTextGroup}>
                            <View style={styles.promoBadge}>
                                <AppText style={styles.promoBadgeText} weight="bold">LIMITED TIME</AppText>
                            </View>
                            <AppText style={styles.promoTitle} weight="bold">Exam Season{'\n'}Flash Sale</AppText>
                            <AppText style={styles.promoSubtitle}>Unlock all bundles at 40% OFF</AppText>
                        </View>
                        <MaterialCommunityIcons name="lightning-bolt" size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Slide 2 */}
                <TouchableOpacity style={styles.promoSlide} activeOpacity={0.9} onPress={() => navigation.navigate('Store')}>
                    <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.promoGradient}
                    >
                        <View style={styles.promoTextGroup}>
                            <View style={[styles.promoBadge, { backgroundColor: '#FBBF24' }]}>
                                <AppText style={[styles.promoBadgeText, { color: '#000' }]} weight="bold">VERIFIED</AppText>
                            </View>
                            <AppText style={styles.promoTitle} weight="bold">AIR 1 Hand-written{'\n'}Solved Notes</AppText>
                            <AppText style={styles.promoSubtitle}>Strictly based on 2024 Boards</AppText>
                        </View>
                        <MaterialCommunityIcons name="book-open-page-variant" size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Slide 3 */}
                <TouchableOpacity style={styles.promoSlide} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.promoGradient}
                    >
                        <View style={styles.promoTextGroup}>
                            <View style={[styles.promoBadge, { backgroundColor: '#fff' }]}>
                                <AppText style={[styles.promoBadgeText, { color: '#10B981' }]} weight="bold">FREEBIE</AppText>
                            </View>
                            <AppText style={styles.promoTitle} weight="bold">Free Sample{'\n'}Cheat Sheets</AppText>
                            <AppText style={styles.promoSubtitle}>Quick revision formulas for all</AppText>
                        </View>
                        <MaterialCommunityIcons name="fire" size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.dotsRow}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={[styles.dot, currentSlide === i && styles.activeDot]} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    promoContainer: {
        marginBottom: 35,
    },
    promoSlide: {
        width: width - 40,
        marginHorizontal: 10,
        borderRadius: 28,
        overflow: 'hidden',
    },
    promoGradient: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        height: 180,
    },
    promoTextGroup: {
        flex: 1,
    },
    promoBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    promoBadgeText: {
        fontSize: 10,
        color: 'white',
    },
    promoTitle: {
        fontSize: 24,
        color: 'white',
        lineHeight: 32,
        marginBottom: 8,
    },
    promoSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    promoIcon: {
        marginLeft: 10,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 15,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#334155',
    },
    activeDot: {
        width: 20,
        backgroundColor: '#00B1FC',
    },
});

export default PromoBanners;
