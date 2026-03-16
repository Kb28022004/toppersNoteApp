import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import { useGetProfileQuery, useUpdateProfilePictureMutation } from '../../features/api/topperApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from '../../context/AlertContext';
import * as ImagePicker from 'expo-image-picker';
import Loader from '../../components/Loader';
import ProfilePictureViewer from '../../components/ProfilePictureViewer';
import useTheme from '../../hooks/useTheme';

const TopperProfile = ({ navigation }) => {
    const { showAlert } = useAlert();
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { data: profile, refetch: refetchProfile } = useGetProfileQuery();
    const [updateProfilePicture, { isLoading: isUpdating }] = useUpdateProfilePictureMutation();
    const [refreshing, setRefreshing] = React.useState(false);
    const [isImageViewerVisible, setIsImageViewerVisible] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refetchProfile().unwrap();
        } catch (err) {
            console.log("Refresh Error:", err);
        } finally {
            setRefreshing(false);
        }
    }, [refetchProfile]);

    const userData = profile?.data;

    const handleLogout = () => {
        showAlert(
            "Logout",
            "Are you sure you want to logout?",
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
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showAlert("Permission Denied", "We need camera roll permissions to change your profile picture.", "error");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                const formData = new FormData();

                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('photo', {
                    uri: imageUri,
                    name: filename,
                    type,
                });

                await updateProfilePicture(formData).unwrap();
                showAlert("Success", "Profile picture updated successfully", "success");
            }
        } catch (err) {
            console.error("Profile Photo Update Error:", err);
            showAlert("Error", "Failed to update profile picture. Please try again.", "error");
        }
    };

    const menuSections = [
        {
            title: 'Store Management',
            items: [
                { icon: 'document-text-outline', label: 'Manage Uploads', color: '#A855F7', onPress: () => navigation.navigate('MyUploads') },
                { icon: 'trending-up-outline', label: 'Sales Analytics', color: '#10B981', onPress: () => navigation.navigate('MySoldNotes') },
                { icon: 'star-outline', label: 'Reviews & Ratings', color: '#F59E0B', onPress: () => navigation.navigate('TopperReviews', { topperId: userData?.userId }) },
            ]
        },
        {
            title: 'Professional Profile',
            items: [
                { icon: 'person-outline', label: 'Personal Information', color: '#6366F1', onPress: () => navigation.navigate('EditAcademicProfile') },
                { icon: 'wallet-outline', label: 'Earnings & Payouts', color: '#10B981', onPress: () => navigation.navigate('EarningsPayouts') },
                { icon: 'gift-outline', label: 'Refer & Earn', color: '#F59E0B', onPress: () => navigation.navigate('ReferAndEarn') },
            ]
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Settings</AppText>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                    <Feather name="log-out" size={20} color={theme.colors.danger} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        backgroundColor="transparent"
                    />
                }
            >
                {/* Profile Card */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={() => setIsImageViewerVisible(true)} activeOpacity={0.8}>
                            <Image
                                source={userData?.profilePhoto ? { uri: userData.profilePhoto } : require('../../../assets/topper.avif')}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cameraBtn} onPress={handleUpdatePhoto}>
                            <Feather name="camera" size={14} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoArea}>
                        <View style={styles.nameRow}>
                            <AppText style={styles.userName} weight="bold">{userData?.firstName || 'Topper Name'}</AppText>
                            {userData?.verified && <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.primary} style={{ marginLeft: 6 }} />}
                        </View>
                        <AppText style={styles.userRole}>Class {userData?.expertiseClass} {userData?.stream} Topper</AppText>

                        <TouchableOpacity
                            style={styles.previewBtn}
                            onPress={() => navigation.navigate('PublicTopperProfile', { topperId: userData?.userId, isPreview: true })}
                        >
                            <Feather name="eye" size={14} color={theme.colors.primary} />
                            <AppText style={styles.previewText} weight="bold">View My Profile</AppText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats Banner */}
                <View style={styles.statsBanner}>
                    <TouchableOpacity
                        style={styles.bannerStat}
                        onPress={() => navigation.navigate('Followers', { userId: userData?.userId, name: userData?.fullName })}
                    >
                        <AppText style={styles.statVal} weight="bold">{userData?.stats?.followersCount || 0}</AppText>
                        <AppText style={styles.statLab}>Followers</AppText>
                    </TouchableOpacity>
                    <View style={styles.bannerDivider} />
                    <View style={styles.bannerStat}>
                        <AppText style={styles.statVal} weight="bold">₹{userData?.stats?.totalEarnings || 0}</AppText>
                        <AppText style={styles.statLab}>Revenue</AppText>
                    </View>
                    <View style={styles.bannerDivider} />
                    <View style={styles.bannerStat}>
                        <AppText style={styles.statVal} weight="bold">{userData?.stats?.rating?.average || '0.0'}</AppText>
                        <AppText style={styles.statLab}>Rating</AppText>
                    </View>
                </View>

                {/* Settings Menu Sections */}
                {menuSections.map((section, sIndex) => (
                    <View key={sIndex} style={styles.menuSection}>
                        <AppText style={styles.sectionLabel} weight="bold">{section.title}</AppText>
                        <View style={styles.menuGroup}>
                            {section.items.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.menuItem, index === section.items.length - 1 && { borderBottomWidth: 0 }]}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <AppText style={styles.menuLabel}>{item.label}</AppText>
                                    <Feather name="chevron-right" size={18} color={theme.colors.textSubtle} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Danger Zone */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <AppText style={styles.logoutText} weight="bold">Sign Out from Device</AppText>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <AppText style={styles.version}>TopperNotes Partner • v1.0.4</AppText>
                    <AppText style={styles.supportLink}>Read Terms & Privacy Policy</AppText>
                </View>
            </ScrollView>

            {isUpdating && <Loader message="Updating profile photo..." />}
            <ProfilePictureViewer
                visible={isImageViewerVisible}
                imageUrl={userData?.profilePhoto ? { uri: userData.profilePhoto } : require('../../../assets/topper.avif')}
                onClose={() => setIsImageViewerVisible(false)}
            />
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: 18,
        color: theme.colors.text,
    },
    logoutIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.danger + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 50,
    },
    profileSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: theme.colors.border,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
    infoArea: {
        marginLeft: 20,
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    userName: {
        fontSize: 20,
        color: theme.colors.text,
    },
    userRole: {
        fontSize: 13,
        color: theme.colors.textMuted,
        marginBottom: 10,
    },
    previewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: theme.colors.primary + '30',
        gap: 6,
    },
    previewText: {
        fontSize: 11,
        color: theme.colors.primary,
    },
    statsBanner: {
        flexDirection: 'row',
        backgroundColor: theme.colors.card,
        marginHorizontal: 20,
        borderRadius: 24,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 25,
    },
    bannerStat: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        fontSize: 18,
        color: theme.colors.text,
    },
    statLab: {
        fontSize: 11,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    bannerDivider: {
        width: 1,
        height: '60%',
        backgroundColor: theme.colors.border,
        alignSelf: 'center',
    },
    menuSection: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 12,
        color: theme.colors.textSubtle,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 24,
        marginBottom: 12,
    },
    menuGroup: {
        backgroundColor: theme.colors.card,
        marginHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
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
        color: theme.colors.text,
    },
    logoutBtn: {
        marginHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 20,
        backgroundColor: theme.colors.danger + '10',
        borderWidth: 1,
        borderColor: theme.colors.danger + '30',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    logoutText: {
        color: theme.colors.danger,
        fontSize: 15,
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
    },
    version: {
        fontSize: 11,
        color: theme.colors.textSubtle,
    },
    supportLink: {
        fontSize: 11,
        color: theme.colors.primary,
        marginTop: 8,
        fontWeight: 'bold',
    }
});

export default TopperProfile;
