import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import PageHeader from '../../components/PageHeader';
import useTheme from '../../hooks/useTheme';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const TransactionDetails = ({ route, navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { transaction } = route.params;

    const DetailRow = ({ label, value, icon, color = theme.colors.textSubtle }) => (
        <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
                <MaterialCommunityIcons name={icon} size={18} color={color} />
                <AppText style={styles.detailLabel}>{label}</AppText>
            </View>
            <AppText style={styles.detailValue} weight="medium">{value}</AppText>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <PageHeader
                title="Transaction Details"
                onBackPress={() => navigation.goBack()}
                iconName="chevron-back"
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Status Card */}
                <LinearGradient
                    colors={transaction.status === 'SUCCESS' ? [theme.colors.success, theme.colors.success + 'ee'] : [theme.colors.danger, theme.colors.danger + 'ee']}
                    style={styles.statusCard}
                >
                    <View style={styles.statusIconContainer}>
                        <MaterialCommunityIcons
                            name={transaction.status === 'SUCCESS' ? 'check-circle' : 'close-circle'}
                            size={48}
                            color={theme.colors.textInverse}
                        />
                    </View>
                    <AppText style={styles.statusTitle} weight="bold">
                        Payment {transaction.status === 'SUCCESS' ? 'Successful' : 'Failed'}
                    </AppText>
                    <AppText style={styles.statusAmount} weight="bold">₹{transaction.amount}</AppText>
                    <AppText style={styles.statusDate}>
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </AppText>
                </LinearGradient>

                {/* Order Information */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">ORDER INFORMATION</AppText>
                    <View style={styles.card}>
                        <DetailRow
                            label="Note Title"
                            value={transaction.noteTitle}
                            icon="book-open-page-variant"
                            color={theme.colors.primary}
                        />
                        <DetailRow
                            label="Subject"
                            value={transaction.subject}
                            icon="book-outline"
                        />
                        <DetailRow
                            label="Chapter"
                            value={transaction.chapterName}
                            icon="file-document-outline"
                        />
                    </View>
                </View>

                {/* Payment Breakdown */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">PAYMENT DETAILS</AppText>
                    <View style={styles.card}>
                        <DetailRow
                            label="Order ID"
                            value={transaction.razorpayOrderId}
                            icon="identifier"
                        />
                        <DetailRow
                            label="Payment ID"
                            value={transaction.razorpayPaymentId}
                            icon="credit-card-outline"
                        />
                        <View style={styles.divider} />
                        <View style={styles.totalRow}>
                            <AppText style={styles.totalLabel} weight="bold">Total Amount</AppText>
                            <AppText style={styles.totalValue} weight="bold">₹{transaction.amount}</AppText>
                        </View>
                    </View>
                </View>

                {/* Help Section */}
                <TouchableOpacity style={styles.helpBtn}>
                    <MaterialCommunityIcons name="help-circle-outline" size={20} color={theme.colors.textSubtle} />
                    <AppText style={styles.helpText}>Need help with this transaction?</AppText>
                </TouchableOpacity>

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
    statusCard: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 30,
    },
    statusIconContainer: {
        marginBottom: 15,
    },
    statusTitle: {
        color: theme.colors.textInverse,
        fontSize: 20,
        marginBottom: 10,
    },
    statusAmount: {
        color: theme.colors.textInverse,
        fontSize: 36,
        marginBottom: 10,
    },
    statusDate: {
        color: theme.colors.textInverse + 'b3',
        fontSize: 13,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: theme.colors.textMuted,
        fontSize: 12,
        letterSpacing: 1.2,
        marginBottom: 12,
        marginLeft: 5,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    detailRow: {
        marginBottom: 18,
    },
    detailLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    detailLabel: {
        color: theme.colors.textMuted,
        fontSize: 13,
    },
    detailValue: {
        color: theme.colors.text,
        fontSize: 15,
        marginLeft: 26,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border + '40',
        marginVertical: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: theme.colors.text,
        fontSize: 16,
    },
    totalValue: {
        color: theme.colors.primary,
        fontSize: 20,
    },
    helpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    helpText: {
        color: theme.colors.textMuted,
        fontSize: 14,
    },
});

export default TransactionDetails;
