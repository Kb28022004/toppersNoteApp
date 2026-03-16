import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import PageHeader from '../../components/PageHeader';
import useTheme from '../../hooks/useTheme';
import { useMemo } from 'react';
import { useAlert } from '../../context/AlertContext';
import { useDeleteAccountMutation } from '../../features/api/studentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';

const AccountSettings = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { showAlert } = useAlert();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

    const handleDeleteAccount = () => {
        showAlert(
            "Delete Account",
            "This action is permanent and cannot be undone. All your purchases and data will be lost.",
            "error",
            {
                showCancel: true,
                confirmText: "Delete Forever",
                onConfirm: async () => {
                    try {
                        await deleteAccount().unwrap();
                        await AsyncStorage.clear();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    } catch (error) {
                        showAlert("Error", "Failed to delete account. Please try again later.", "error");
                    }
                }
            }
        );
    };

    const settingSections = useMemo(() => [
        {
            title: "PROFILE SETTINGS",
            items: [
                {
                    id: 'academic',
                    title: "Academic Profile",
                    subtitle: "Update Class, Board & Stream",
                    icon: "school-outline",
                    color: theme.colors.primary,
                    onPress: () => navigation.navigate('EditAcademicProfile')
                },
            ]
        },
        {
            title: "SUPPORT",
            items: [
                {
                    id: 'help',
                    title: "Help & Support",
                    subtitle: "Contact us for any issues",
                    icon: "help-circle-outline",
                    color: theme.colors.warning
                },
                {
                    id: 'privacy',
                    title: "Privacy Policy",
                    subtitle: "How we handle your data",
                    icon: "shield-checkmark-outline",
                    color: theme.colors.primary
                },
            ]
        }
    ], [theme]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <Loader visible={isDeleting} />

            <PageHeader
                title="Account Settings"
                onBackPress={() => navigation.goBack()}
                iconName="chevron-back"
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {settingSections.map((section, sIndex) => (
                    <View key={sIndex} style={styles.section}>
                        <AppText style={styles.sectionTitle} weight="bold">{section.title}</AppText>
                        <View style={styles.card}>
                            {section.items.map((item, iIndex) => (
                                <TouchableOpacity
                                    key={iIndex}
                                    style={[styles.item, iIndex === section.items.length - 1 && { borderBottomWidth: 0 }]}
                                    onPress={item.onPress}
                                >
                                    <View style={styles.itemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                                            <Ionicons name={item.icon} size={22} color={item.color} />
                                        </View>
                                        <View>
                                            <AppText style={styles.itemTitle} weight="medium">{item.title}</AppText>
                                            <AppText style={styles.itemSubtitle}>{item.subtitle}</AppText>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Danger Zone */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">DANGER ZONE</AppText>
                    <TouchableOpacity style={styles.deleteCard} onPress={handleDeleteAccount}>
                        <View style={styles.itemLeft}>
                            <View style={styles.deleteIconContainer}>
                                <Feather name="trash-2" size={20} color={theme.colors.danger} />
                            </View>
                            <View>
                                <AppText style={styles.deleteTitle} weight="bold">Delete Account</AppText>
                                <AppText style={styles.deleteSubtitle}>Permanently remove all your data</AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <View style={styles.footer}>
                    <AppText style={styles.versionText}>TopperNotes Mobile • v1.0.0</AppText>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: theme.colors.textMuted,
        fontSize: 11,
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + '40',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        color: theme.colors.text,
        fontSize: 16,
    },
    itemSubtitle: {
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    deleteCard: {
        backgroundColor: theme.colors.danger + '10',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.danger + '30',
    },
    deleteIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.danger + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteTitle: {
        color: theme.colors.danger,
        fontSize: 16,
    },
    deleteSubtitle: {
        color: theme.colors.danger + '99',
        fontSize: 12,
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    versionText: {
        color: theme.colors.textSubtle,
        fontSize: 12,
    }
});

export default AccountSettings;
