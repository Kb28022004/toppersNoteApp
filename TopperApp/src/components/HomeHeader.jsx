import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AppText from './AppText';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import { getTodayDate, getGreeting } from '../helpers/dateHelpers';

import { HeaderSkeleton } from './skeletons/HomeSkeletons';

const HomeHeader = ({
    userProfile,
    userType = 'student', // 'student' or 'topper'
    unreadCount = 0,
    unreadMessagesCount = 0,
    onProfilePress,
    onChatPress,
    onNotificationPress,
    isLoading = false
}) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const today = useMemo(() => getTodayDate(), []);
    const greeting = useMemo(() => getGreeting(), []);

    if (isLoading) return <HeaderSkeleton />;

    // Set fallback avatar based on userType
    const profileImage = userType === 'topper'
        ? (userProfile?.profilePhoto ? { uri: userProfile.profilePhoto } : require('../../assets/topper.avif'))
        : (userProfile?.profilePhoto ? { uri: userProfile.profilePhoto } : require('../../assets/student.avif'));

    const firstName = userType === 'topper'
        ? (userProfile?.firstName || 'Topper')
        : (userProfile?.fullName?.split(' ')[0] || 'Student');

    return (
        <View style={theme.header.container}>
            <View style={styles.headerLeft}>
                <TouchableOpacity
                    style={styles.profileCircle}
                    onPress={onProfilePress}
                >
                    <Image
                        source={profileImage}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
                <View style={styles.headerTextStack}>
                    <AppText style={styles.dateText}>{today}</AppText>
                    <AppText style={styles.greetingText} weight="bold">{greeting}, {firstName}</AppText>
                </View>
            </View>

            <View style={styles.headerRight}>
                <View style={styles.actionGroup}>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={toggleTheme}
                    >
                        <MaterialCommunityIcons
                            name={isDarkMode ? "weather-sunny" : "weather-night"}
                            size={theme.header.iconSize}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={onChatPress}
                    >
                        {unreadMessagesCount > 0 && (
                            <View style={styles.msgBadge}>
                                <AppText style={styles.msgBadgeText}>
                                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                                </AppText>
                            </View>
                        )}
                        <Ionicons name="chatbubble-ellipses-outline" size={theme.header.iconSize} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={onNotificationPress}
                    >
                        {unreadCount > 0 && <View style={styles.notifDot} />}
                        <Feather name="bell" size={theme.header.iconSize} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTextStack: {
        marginLeft: 12,
    },
    dateText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    greetingText: {
        fontSize: 20,
        marginTop: 2,
        color: theme.colors.text,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    actionIconButton: {
        paddingHorizontal: 8,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.danger,
        borderWidth: 2,
        borderColor: theme.colors.background,
        zIndex: 1,
    },
    msgBadge: {
        position: 'absolute',
        top: 2,
        right: 0,
        backgroundColor: theme.colors.primary,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: theme.colors.background,
    },
    msgBadgeText: {
        color: theme.colors.textInverse,
        fontSize: 9,
        fontWeight: 'bold',
    },
    profileCircle: {
        borderWidth: 2,
        borderRadius: 25,
        padding: 2,
        borderColor: theme.colors.primary,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
});

export default HomeHeader;
