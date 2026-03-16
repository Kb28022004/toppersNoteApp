import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import AppText from '../../components/AppText';
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from '../../components/ReausableButton';
import { useGetProfileQuery } from '../../features/api/topperApi';
import { useFocusEffect } from '@react-navigation/native';
import useTheme from '../../hooks/useTheme';

const TopperApprovalPending = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { data: profileData, isLoading, refetch, isFetching } = useGetProfileQuery();

    useFocusEffect(
        React.useCallback(() => {
            refetch?.();
        }, [refetch])
    );

    const status = profileData?.data?.status || 'PENDING';
    const remark = profileData?.data?.adminRemark || "Your marksheet or details don't meet our topper criteria.";

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.warning} />
                </View>
            );
        }

        switch (status) {
            case 'APPROVED':
                return (
                    <>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '18' }]}>
                            <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
                        </View>
                        <AppText style={styles.title}>Account Approved!</AppText>
                        <AppText style={styles.subtitle}>
                            Congratulations! Your profile has been verified. You can now start uploading your notes and building your community.
                        </AppText>
                        <ReusableButton
                            title="Go to Dashboard"
                            onPress={() => navigation.reset({
                                index: 0,
                                routes: [{ name: 'Home' }],
                            })}
                            style={[styles.button, { backgroundColor: theme.colors.success }]}
                            icon="speedometer"
                        />
                    </>
                );

            case 'REJECTED':
                return (
                    <>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.danger + '18' }]}>
                            <Ionicons name="close-circle" size={80} color={theme.colors.danger} />
                        </View>
                        <AppText style={styles.title}>Verification Failed</AppText>
                        <AppText style={styles.subtitle}>
                            Unfortunately, your request could not be approved at this time.
                        </AppText>

                        <View style={[styles.reasonBox, { borderColor: theme.colors.danger + '40', backgroundColor: theme.colors.danger + '08' }]}>
                            <AppText style={[styles.reasonLabel, { color: theme.colors.danger }]}>Reason for Rejection:</AppText>
                            <AppText style={[styles.reasonText, { color: theme.colors.textMuted }]}>{remark}</AppText>
                        </View>

                        <ReusableButton
                            title="Update & Re-verify"
                            onPress={() => navigation.navigate('TopperVerification')}
                            style={[styles.button, { backgroundColor: theme.colors.danger }]}
                            icon="refresh"
                        />
                        <TouchableOpacity onPress={refetch} style={{ marginTop: 20 }}>
                            <AppText style={[styles.refreshText, { color: theme.colors.primary }]}>I've updated my profile</AppText>
                        </TouchableOpacity>
                    </>
                );

            default: // PENDING
                return (
                    <>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '18' }]}>
                            <Ionicons name="time" size={80} color={theme.colors.warning} />
                        </View>
                        <AppText style={styles.title}>Approval Pending</AppText>
                        <AppText style={styles.subtitle}>
                            Your profile is currently under review by our admin team.
                            This usually takes 24-48 hours.
                        </AppText>
                        <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '12' }]}>
                            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                            <AppText style={[styles.infoText, { color: theme.colors.primary }]}>
                                You will be notified once your profile is verified. Please check back later.
                            </AppText>
                        </View>
                        <ReusableButton
                            title="Check Status / Refresh"
                            loading={isFetching}
                            loadingText="Refreshing..."
                            onPress={refetch}
                            style={styles.button}
                            icon="sync"
                        />
                    </>
                );
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={styles.content}>
                {renderContent()}
            </View>
        </ScrollView>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 30,
        padding: 30,
        borderRadius: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        gap: 15,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: theme.colors.primary + '30',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    reasonBox: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 30,
    },
    reasonLabel: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
    reasonText: {
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        width: '100%',
        backgroundColor: theme.colors.warning,
    },
    refreshText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default TopperApprovalPending;
