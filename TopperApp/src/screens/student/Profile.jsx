import React, { useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
    StatusBar,
    Switch
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGetProfileQuery, useUpdateProfilePictureMutation } from '../../features/api/studentApi';
import useRefresh from '../../hooks/useRefresh';
import * as ImagePicker from 'expo-image-picker';
import AppText from '../../components/AppText';
import Loader from '../../components/Loader';
import ScreenLoader from '../../components/ScreenLoader';
import PageHeader from '../../components/PageHeader';
import { Theme } from '../../theme/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from '../../context/AlertContext';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import ProfilePictureViewer from '../../components/ProfilePictureViewer';
import { ProfileHeaderSkeleton } from '../../components/skeletons/HomeSkeletons';

const { width } = Dimensions.get('window');

const Profile = ({ navigation }) => {
    const { showAlert } = useAlert();
    const { data: profile, isLoading, refetch } = useGetProfileQuery();
    const { refreshing, onRefresh } = useRefresh(refetch);
    const { sessionSeconds } = useSelector(state => state.usage);
    const [updatePhoto, { isLoading: isUpdatingPhoto }] = useUpdateProfilePictureMutation();
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

    const formatRealTime = (baseHours, extraSeconds) => {
        const totalSeconds = Math.round((baseHours || 0) * 3600) + extraSeconds;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);

        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const handleLogout = () => {
        showAlert(
            "Sign Out",
            "Are you sure you want to exit your session?",
            "warning",
            {
                showCancel: true,
                confirmText: "Logout",
                onConfirm: async () => {
                    await AsyncStorage.clear();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                    });
                }
            }
        );
    };

    const handleUpdatePhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                const selectedImage = result.assets[0];
                const formData = new FormData();
                const filename = selectedImage.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append("photo", {
                    uri: selectedImage.uri,
                    name: filename,
                    type
                });

                await updatePhoto(formData).unwrap();
                showAlert("Success", "Photo updated!", "success");
            }
        } catch (error) {
            showAlert("Error", "Failed to update photo", "error");
        }
    };

    const sections = [
        {
            title: 'Learning Journey',
            items: [
                { title: 'My Library', icon: 'library-outline', screen: 'MyLibrary', params: { initialTab: 'Purchases' }, color: '#00B1FC' },
                { title: 'My Following', icon: 'people-outline', screen: 'FollowingList', color: '#A855F7' },
                { title: 'Favourite Notes', icon: 'heart-outline', screen: 'MyLibrary', params: { initialTab: 'Favorites' }, color: '#F43F5E' },
                { title: 'Refer & Earn', icon: 'gift-outline', screen: 'ReferAndEarn', color: '#F59E0B' },
            ]
        },
        {
            title: 'Payments & History',
            items: [
                { title: 'Transaction History', icon: 'receipt-outline', screen: 'TransactionHistory', color: '#10B981' },
                { title: 'Purchase Methods', icon: 'card-outline', color: '#F43F5E' },
            ]
        },
        {
            title: 'Personal Info',
            items: [
                { title: 'Edit Profile', icon: 'person-outline', screen: 'AccountSettings', color: '#6366F1' },
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <PageHeader
                title="Settings"
                onBackPress={() => navigation.goBack()}
                iconName="chevron-back"
                rightComponent={
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <Feather name="log-out" size={18} color="#EF4444" />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B1FC" />
                }
            >
                {isLoading ? (
                    <ProfileHeaderSkeleton />
                ) : (
                    <>
                        {/* Profile Hero Section */}
                        <View style={styles.heroSection}>
                            <View style={styles.avatarWrapper}>
                                <TouchableOpacity onPress={() => setIsImageViewerVisible(true)} activeOpacity={0.8}>
                                    <Image
                                        source={profile?.profilePhoto ? { uri: profile.profilePhoto } : require('../../../assets/student.avif')}
                                        style={styles.avatar}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.editBadge} onPress={handleUpdatePhoto}>
                                    <Feather name="camera" size={12} color="white" />
                                </TouchableOpacity>
                            </View>

                            <AppText style={styles.userName} weight="bold">{profile?.fullName || 'Student Name'}</AppText>
                            <View style={styles.classInfo}>
                                <AppText style={styles.classText} weight="bold">Class {profile?.class}</AppText>
                                <View style={styles.dot} />
                                <AppText style={styles.boardText}>{profile?.board} Board</AppText>
                            </View>
                        </View>

                        {/* Achievement Stats Row */}
                        <View style={styles.statsRow}>
                            <LinearGradient
                                colors={['#1E293B', '#111827']}
                                style={styles.statCard}
                            >
                                <View style={styles.statIconBox}>
                                    <Ionicons name="documents" size={20} color="#00B1FC" />
                                </View>
                                <AppText style={styles.statValue} weight="bold">{profile?.stats?.notesPurchased || 0}</AppText>
                                <AppText style={styles.statLabel}>Purchased</AppText>
                            </LinearGradient>

                            <LinearGradient
                                colors={['#1E293B', '#111827']}
                                style={styles.statCard}
                            >
                                <View style={[styles.statIconBox, { backgroundColor: '#10B98115' }]}>
                                    <Ionicons name="time" size={20} color="#10B981" />
                                </View>
                                <AppText style={styles.statValue} weight="bold">{formatRealTime(profile?.stats?.hoursStudied || 0, sessionSeconds)}</AppText>
                                <AppText style={styles.statLabel}>Studied</AppText>
                            </LinearGradient>

                            <LinearGradient
                                colors={['#1E293B', '#111827']}
                                style={styles.statCard}
                            >
                                <View style={[styles.statIconBox, { backgroundColor: '#F59E0B15' }]}>
                                    <Ionicons name="people" size={20} color="#F59E0B" />
                                </View>
                                <AppText style={styles.statValue} weight="bold">{profile?.stats?.followingCount || 0}</AppText>
                                <AppText style={styles.statLabel}>Following</AppText>
                            </LinearGradient>
                        </View>
                    </>
                )}

                {/* Learning Streak Banner */}
                <View style={styles.streakBanner}>
                    <View style={styles.streakIcon}>
                        <MaterialCommunityIcons name="fire" size={20} color={profile?.stats?.streakCount > 0 ? "#EF4444" : "#94A3B8"} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <AppText style={styles.streakTitle} weight="bold">
                            {profile?.stats?.streakCount > 0
                                ? `${profile.stats.streakCount} Day Learning Streak!`
                                : "Start your learning streak today!"}
                        </AppText>
                        <View style={styles.streakProgressBg}>
                            <View
                                style={[
                                    styles.streakProgressFill,
                                    {
                                        width: `${profile?.stats?.streakCount > 0
                                            ? Math.min((((profile.stats.streakCount - 1) % 7) + 1) / 7 * 100, 100)
                                            : 0
                                            }%`
                                    }
                                ]}
                            />
                        </View>
                        {profile?.stats?.streakCount > 0 && (
                            <AppText style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                                {profile.stats.streakCount % 7 === 0
                                    ? "🔥 Weekly Milestone Reached!"
                                    : `${7 - (profile.stats.streakCount % 7)} more days to a 7-day milestone!`}
                            </AppText>
                        )}
                    </View>
                </View>

                {/* Settings Menu Sections */}
                {sections.map((section, idx) => (
                    <View key={idx} style={styles.menuSection}>
                        <AppText style={styles.sectionLabel} weight="bold">{section.title}</AppText>
                        <View style={styles.menuGroup}>
                            {section.items.map((item, iIdx) => (
                                <TouchableOpacity
                                    key={iIdx}
                                    style={[styles.menuItem, iIdx === section.items.length - 1 && { borderBottomWidth: 0 }]}
                                    onPress={() => item.screen && navigation.navigate(item.screen, item.params)}
                                >
                                    <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <AppText style={styles.menuLabel} weight="medium">{item.title}</AppText>
                                    <Feather name="chevron-right" size={18} color="#475569" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* App Links */}
                <TouchableOpacity style={styles.dangerBtn} onPress={handleLogout}>
                    <AppText style={styles.dangerText} weight="bold">Log out from account</AppText>
                </TouchableOpacity>

            </ScrollView>
            <Loader visible={isUpdatingPhoto} />
            <ProfilePictureViewer
                visible={isImageViewerVisible}
                imageUrl={profile?.profilePhoto ? { uri: profile.profilePhoto } : require('../../../assets/student.avif')}
                onClose={() => setIsImageViewerVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    logoutBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#EF444415',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 60,
    },
    heroSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#1E293B',
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#00B1FC',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0F172A',
    },
    userName: {
        fontSize: 24,
        color: 'white',
        marginBottom: 6,
    },
    classInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    classText: {
        color: '#00B1FC',
        fontSize: 13,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#475569',
        marginHorizontal: 10,
    },
    boardText: {
        color: '#94A3B8',
        fontSize: 13,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        marginVertical: 25,
    },
    statCard: {
        width: (width - 60) / 3,
        padding: 15,
        borderRadius: 22,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#33415550',
    },
    statIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#00B1FC15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        color: 'white',
    },
    statLabel: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
    },
    streakBanner: {
        marginHorizontal: 20,
        backgroundColor: '#EF444410',
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF444420',
        marginBottom: 30,
    },
    streakIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EF444420',
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakTitle: {
        fontSize: 14,
        color: 'white',
        marginBottom: 8,
    },
    streakProgressBg: {
        height: 4,
        backgroundColor: '#EF444420',
        borderRadius: 2,
        overflow: 'hidden',
    },
    streakProgressFill: {
        height: '100%',
        backgroundColor: '#EF4444',
    },
    menuSection: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 12,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 24,
        marginBottom: 12,
    },
    menuGroup: {
        backgroundColor: '#1E293B',
        marginHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#33415540',
    },
    menuIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        color: 'white',
    },
    dangerBtn: {
        marginHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 22,
        backgroundColor: '#EF444410',
        borderWidth: 1,
        borderColor: '#EF444430',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 35,
    },
    dangerText: {
        color: '#EF4444',
        fontSize: 15,
    },
});

export default Profile;
