import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import useTheme from '../hooks/useTheme';
import BottomSheet from './BottomSheet';

const PaymentConfirmationModal = ({
    visible,
    onClose,
    onConfirm,
    itemName,
    price,
    topperName,
}) => {
    const { theme } = useTheme();
    const convenienceFee = 5; // Example fee
    const totalAmount = parseFloat(price) + convenienceFee;

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            paddingHorizontal={24}
        >
            <View style={styles.header}>
                <AppText style={[styles.headerTitle, { color: theme.colors.text }]} weight="bold">Confirm Payment</AppText>
                <AppText style={[styles.headerSub, { color: theme.colors.textMuted }]}>Verify your order before proceeding</AppText>
            </View>

            <View style={[styles.orderCard, { backgroundColor: theme.colors.modalItem || theme.colors.card }]}>
                <View style={styles.itemRow}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                        <Ionicons name="document-text" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.itemDetails}>
                        <AppText style={[styles.itemName, { color: theme.colors.text }]} weight="bold" numberOfLines={1}>{itemName}</AppText>
                        <AppText style={[styles.topperName, { color: theme.colors.textSubtle }]}>By {topperName || 'Verified Topper'}</AppText>
                    </View>
                    <AppText style={[styles.itemPrice, { color: theme.colors.text }]} weight="bold">₹{price}</AppText>
                </View>
            </View>

            <View style={[styles.billingSection, { backgroundColor: theme.colors.modalItem || theme.colors.card }]}>
                <View style={styles.billRow}>
                    <AppText style={[styles.billLabel, { color: theme.colors.textMuted }]}>Subtotal</AppText>
                    <AppText style={[styles.billValue, { color: theme.colors.text }]}>₹{price}</AppText>
                </View>
                <View style={styles.billRow}>
                    <AppText style={[styles.billLabel, { color: theme.colors.textMuted }]}>Convenience Fee</AppText>
                    <AppText style={[styles.billValue, { color: theme.colors.text }]}>₹{convenienceFee}</AppText>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.billRow}>
                    <AppText style={[styles.totalLabel, { color: theme.colors.text }]} weight="bold">Total Amount</AppText>
                    <AppText style={[styles.totalValue, { color: theme.colors.primary }]} weight="bold">₹{totalAmount}</AppText>
                </View>
            </View>

            <View style={styles.securityInfo}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
                <AppText style={[styles.securityText, { color: theme.colors.success }]}>Secure payment powered by Paynimo</AppText>
            </View>

            <TouchableOpacity onPress={onConfirm} activeOpacity={0.8} style={styles.actionButton}>
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primary + 'CC']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <AppText style={styles.buttonText} weight="bold">Proceed to Pay ₹{totalAmount}</AppText>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <AppText style={[styles.cancelText, { color: theme.colors.textMuted }]}>Cancel Transaction</AppText>
            </TouchableOpacity>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginVertical: 15,
    },
    headerTitle: {
        fontSize: 22,
    },
    headerSub: {
        fontSize: 14,
        marginTop: 4,
    },
    orderCard: {
        borderRadius: 20,
        padding: 16,
        marginTop: 10,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 16,
    },
    itemName: {
        fontSize: 16,
    },
    topperName: {
        fontSize: 12,
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 18,
    },
    billingSection: {
        marginTop: 24,
        borderRadius: 20,
        padding: 20,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 6,
    },
    billLabel: {
        fontSize: 14,
    },
    billValue: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
    },
    totalValue: {
        fontSize: 20,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        marginBottom: 30,
    },
    securityText: {
        fontSize: 12,
    },
    actionButton: {
        width: '100%',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        borderRadius: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    cancelButton: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
    }
});

export default PaymentConfirmationModal;

