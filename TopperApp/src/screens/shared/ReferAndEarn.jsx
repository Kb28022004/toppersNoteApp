import React, { useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Share,
    Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

import AppText from '../../components/AppText';
import ScreenLoader from '../../components/ScreenLoader';
import useTheme from '../../hooks/useTheme';
import { useGetReferralStatsQuery, useGetReferralHistoryQuery } from '../../features/api/referralApi';

const { width } = Dimensions.get('window');

const ReferAndEarn = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);

    const { data: stats, isLoading: isStatsLoading } = useGetReferralStatsQuery();
    const { data: history, isLoading: isHistoryLoading } = useGetReferralHistoryQuery();

    const statsData = stats?.data || {};
    const referralCode = statsData.referralCode || '-------';
    const walletBalance = statsData.walletBalance || 0;
    const totalReferrals = statsData.totalReferrals || 0;

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(referralCode);
        Alert.alert("Success", "Referral code copied to clipboard!");
    };

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: `Hey! Join TopperNotes and get access to premium study material. Use my referral code: ${referralCode} to get started!`,
            });
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    if (isStatsLoading) return <ScreenLoader />;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primary + 'cc']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.navRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.textInverse} />
                    </TouchableOpacity>
                    <AppText style={styles.headerTitle} weight="bold">Refer & Earn</AppText>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="gift-outline" size={60} color={theme.colors.textInverse} />
                    </View>
                    <AppText style={styles.earnText} weight="bold">Earn Passive Income</AppText>
                    <AppText style={styles.subEarnText}>Invite friends and get 10% commission on every purchase they make!</AppText>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <AppText style={styles.statVal} weight="bold">{totalReferrals}</AppText>
                        <AppText style={styles.statLabel}>Total Referrals</AppText>
                    </View>
                    <View style={styles.statBox}>
                        <AppText style={styles.statVal} weight="bold">₹{walletBalance}</AppText>
                        <AppText style={styles.statLabel}>Total Earned</AppText>
                    </View>
                </View>

                {/* Referral Code Section */}
                <View style={styles.codeCard}>
                    <AppText style={styles.codeLabel} weight="medium">Your Referral Code</AppText>
                    <View style={styles.codeRow}>
                        <View style={styles.codeContainer}>
                            <AppText style={styles.codeText} weight="bold">{referralCode}</AppText>
                        </View>
                        <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
                            <Ionicons name="copy-outline" size={20} color={theme.colors.textInverse} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
                        <AppText style={styles.shareBtnText} weight="bold">Share with Friends</AppText>
                        <Ionicons name="share-social-outline" size={20} color={theme.colors.textInverse} />
                    </TouchableOpacity>
                </View>

                {/* How it works */}
                <View style={styles.infoSection}>
                    <AppText style={styles.sectionTitle} weight="bold">How it Works</AppText>

                    <View style={styles.stepRow}>
                        <View style={[styles.stepIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.stepTextContent}>
                            <AppText style={styles.stepTitle} weight="bold">Share Code</AppText>
                            <AppText style={styles.stepDesc}>Share your unique code with your friends via WhatsApp or SMS.</AppText>
                        </View>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={[styles.stepIcon, { backgroundColor: theme.colors.success + '20' }]}>
                            <Ionicons name="person-add-outline" size={20} color={theme.colors.success} />
                        </View>
                        <View style={styles.stepTextContent}>
                            <AppText style={styles.stepTitle} weight="bold">They Register</AppText>
                            <AppText style={styles.stepDesc}>When they sign up using your code, you both get registered rewards.</AppText>
                        </View>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={[styles.stepIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                            <Ionicons name="cash-outline" size={20} color={theme.colors.warning} />
                        </View>
                        <View style={styles.stepTextContent}>
                            <AppText style={styles.stepTitle} weight="bold">Earn Commission</AppText>
                            <AppText style={styles.stepDesc}>Get 10% commission instantly every time your referral buys any notes.</AppText>
                        </View>
                    </View>
                </View>

                {/* Recent Rewards */}
                <View style={styles.historySection}>
                    <AppText style={styles.sectionTitle} weight="bold">Recent Rewards</AppText>
                    {isHistoryLoading ? (
                        <View style={{ height: 100, justifyContent: 'center' }}>
                            <ScreenLoader />
                        </View>
                    ) : (history?.data && history.data.length > 0) ? (
                        history.data.slice(0, 5).map((item, index) => (
                            <View key={index} style={styles.historyItem}>
                                <View style={styles.historyLeft}>
                                    <View style={[styles.hIcon, { backgroundColor: item.type === 'PURCHASE' ? theme.colors.success + '20' : theme.colors.primary + '20' }]}>
                                        <Ionicons
                                            name={item.type === 'PURCHASE' ? "cart-outline" : "person-outline"}
                                            size={18}
                                            color={item.type === 'PURCHASE' ? theme.colors.success : theme.colors.primary}
                                        />
                                    </View>
                                    <View>
                                        <AppText style={styles.hTitle} weight="bold">
                                            {item.type === 'PURCHASE' ? 'Purchase Reward' : 'Sign-up Reward'}
                                        </AppText>
                                        <AppText style={styles.hDate}>{new Date(item.createdAt).toDateString()}</AppText>
                                    </View>
                                </View>
                                <AppText style={[styles.hAmount, { color: theme.colors.success }]} weight="bold">+ ₹{item.pointsEarned}</AppText>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noHistory}>
                            <AppText style={styles.noHistoryText}>No rewards yet. Start sharing!</AppText>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: theme.colors.textInverse,
        fontSize: 18,
    },
    headerContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    earnText: {
        color: theme.colors.textInverse,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 10,
    },
    subEarnText: {
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontSize: 14,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    statBox: {
        flex: 1,
        backgroundColor: theme.colors.card,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    statVal: {
        color: theme.colors.text,
        fontSize: 20,
        marginBottom: 5,
    },
    statLabel: {
        color: theme.colors.textSubtle,
        fontSize: 12,
    },
    codeCard: {
        backgroundColor: theme.colors.card,
        padding: 25,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    codeLabel: {
        color: theme.colors.textSubtle,
        fontSize: 14,
        marginBottom: 15,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    codeContainer: {
        backgroundColor: isDarkMode ? theme.colors.background : theme.colors.inputBackground,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 15,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    codeText: {
        color: theme.colors.primary,
        fontSize: 22,
        letterSpacing: 2,
    },
    copyBtn: {
        backgroundColor: theme.colors.primary,
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareBtn: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        paddingVertical: 15,
        borderRadius: 15,
    },
    shareBtnText: {
        color: theme.colors.textInverse,
        fontSize: 16,
    },
    infoSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: theme.colors.text,
        fontSize: 18,
        marginBottom: 20,
    },
    stepRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepTextContent: {
        flex: 1,
    },
    stepTitle: {
        color: theme.colors.text,
        fontSize: 15,
        marginBottom: 2,
    },
    stepDesc: {
        color: theme.colors.textSubtle,
        fontSize: 13,
        lineHeight: 18,
    },
    historySection: {
        backgroundColor: theme.colors.card,
        padding: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + '80', // Slightly transparent border for list items
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    hIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hTitle: {
        color: theme.colors.text,
        fontSize: 14,
    },
    hDate: {
        color: theme.colors.textSubtle,
        fontSize: 11,
    },
    hAmount: {
        fontSize: 14,
    },
    noHistory: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    noHistoryText: {
        color: theme.colors.textSubtle,
        fontSize: 13,
    }
});

export default ReferAndEarn;
