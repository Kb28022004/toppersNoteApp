import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AppText from './AppText';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Theme } from '../theme/Theme';
import { getTodayDate, getGreeting } from '../helpers/dateHelpers';

const HomeHeader = ({
    userProfile,
    userType = 'student', // 'student' or 'topper'
    unreadCount = 0,
    unreadMessagesCount = 0,
    onProfilePress,
    onChatPress,
    onNotificationPress
}) => {
    const today = useMemo(() => getTodayDate(), []);
    const greeting = useMemo(() => getGreeting(), []);

    // Set fallback avatar based on userType
    const profileImage = userType === 'topper'
        ? (userProfile?.profilePhoto ? { uri: userProfile.profilePhoto } : require('../../assets/topper.avif'))
        : (userProfile?.profilePhoto ? { uri: userProfile.profilePhoto } : require('../../assets/student.avif'));

    const firstName = userType === 'topper'
        ? (userProfile?.firstName || 'Topper')
        : (userProfile?.fullName?.split(' ')[0] || 'Student');

    return (
        <View style={Theme.header.container}>
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
                        onPress={onChatPress}
                    >
                        {unreadMessagesCount > 0 && (
                            <View style={styles.msgBadge}>
                                <AppText style={styles.msgBadgeText}>
                                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                                </AppText>
                            </View>
                        )}
                        <Ionicons name="chatbubble-ellipses-outline" size={Theme.header.iconSize} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={onNotificationPress}
                    >
                        {unreadCount > 0 && <View style={styles.notifDot} />}
                        <Feather name="bell" size={Theme.header.iconSize} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    greetingText: {
        fontSize: 20, // standardized font size
        color: 'white',
        marginTop: 2,
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
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#1E293B',
        zIndex: 1,
    },
    msgBadge: {
        position: 'absolute',
        top: 2,
        right: 0,
        backgroundColor: '#3B82F6',
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#1E293B',
    },
    msgBadgeText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    },
    profileCircle: {
        borderWidth: 2,
        borderColor: '#10B981',
        borderRadius: 25,
        padding: 2,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
});

export default HomeHeader;
