import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import { useGetPublicProfileQuery } from '../../features/api/studentApi';
import ScreenLoader from '../../components/ScreenLoader';
import NoDataFound from '../../components/NoDataFound';
import useTheme from '../../hooks/useTheme';

const StudentProfileDetail = ({ route, navigation }) => {
    const { studentId } = route.params;
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { data: profile, isLoading, isError, refetch } = useGetPublicProfileQuery(studentId);

    if (isLoading) return <ScreenLoader />;

    if (isError || !profile) return (
        <View style={styles.center}>
            <NoDataFound
                message="Failed to load student profile."
                icon="person-outline"
            />
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
                <AppText style={styles.retryText}>Retry</AppText>
            </TouchableOpacity>
        </View>
    );

    const renderStat = (icon, label, value, color) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${color}20` }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View>
                <AppText style={styles.statVal} weight="bold">{value}</AppText>
                <AppText style={styles.statLab}>{label}</AppText>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header / Banner Area */}
                <View style={styles.headerBanner}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileInfoContainer}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={profile.profilePhoto ? { uri: profile.profilePhoto } : require('../../../assets/topper.avif')}
                            style={styles.avatar}
                        />
                    </View>

                    <AppText style={styles.studentName} weight="bold">{profile.fullName}</AppText>
                    <View style={styles.badgeRow}>
                        <View style={styles.classBadge}>
                            <AppText style={styles.badgeText}>Class {profile.class}</AppText>
                        </View>
                        <View style={[styles.classBadge, { backgroundColor: theme.colors.primary + '18' }]}>
                            <AppText style={[styles.badgeText, { color: theme.colors.primary }]}>{profile.board}</AppText>
                        </View>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">Learning Activity</AppText>
                    <View style={styles.statsGrid}>
                        {renderStat('notebook-check-outline', 'Notes Bought', profile.stats?.notesPurchased || 0, theme.colors.success)}
                        {renderStat('clock-outline', 'Last Active', profile.stats?.lastActive ? new Date(profile.stats.lastActive).toLocaleDateString() : 'Active Now', theme.colors.primary)}
                    </View>
                </View>

                {/* Academic Details */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">Academic Details</AppText>
                    <View style={styles.detailCard}>
                        <View style={styles.detailItem}>
                            <AppText style={styles.detailLabel}>Stream</AppText>
                            <AppText style={styles.detailVal}>{profile.stream || 'General'}</AppText>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailItem}>
                            <AppText style={styles.detailLabel}>Medium</AppText>
                            <AppText style={styles.detailVal}>{profile.medium || 'English'}</AppText>
                        </View>
                    </View>
                </View>

                {/* Subjects */}
                {profile.subjects?.length > 0 && (
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle} weight="bold">Subjects Studying</AppText>
                        <View style={styles.subjectsContainer}>
                            {profile.subjects.map((subject, index) => (
                                <View key={index} style={styles.subjectChip}>
                                    <AppText style={styles.subjectText}>{subject}</AppText>
                                </View>
                            ))}
                        </View>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    retryBtn: {
        marginTop: 16,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 10,
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerBanner: {
        height: 120,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfoContainer: {
        alignItems: 'center',
        marginTop: -50,
        marginBottom: 30,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: theme.colors.background,
        overflow: 'hidden',
        backgroundColor: theme.colors.card,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    studentName: {
        fontSize: 22,
        color: theme.colors.text,
        marginTop: 15,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    classBadge: {
        backgroundColor: theme.colors.success + '18',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        color: theme.colors.success,
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 15,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.card,
        padding: 15,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statVal: {
        fontSize: 14,
        color: theme.colors.text,
    },
    statLab: {
        fontSize: 10,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    detailCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    detailLabel: {
        color: theme.colors.textMuted,
        fontSize: 14,
    },
    detailVal: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 5,
    },
    subjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    subjectChip: {
        backgroundColor: theme.colors.card,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    subjectText: {
        color: theme.colors.text,
        fontSize: 13,
    },
});

export default StudentProfileDetail;
