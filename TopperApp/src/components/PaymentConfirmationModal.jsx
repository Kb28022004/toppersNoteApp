import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import { Theme } from '../theme/Theme';
import BottomSheet from './BottomSheet';

const PaymentConfirmationModal = ({
    visible,
    onClose,
    onConfirm,
    itemName,
    price,
    topperName,
}) => {
    const convenienceFee = 5; // Example fee
    const totalAmount = parseFloat(price) + convenienceFee;

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            paddingHorizontal={24}
        >
            <View style={styles.header}>
                <AppText style={styles.headerTitle} weight="bold">Confirm Payment</AppText>
                <AppText style={styles.headerSub}>Verify your order before proceeding</AppText>
            </View>

            <View style={styles.orderCard}>
                <View style={styles.itemRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="document-text" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.itemDetails}>
                        <AppText style={styles.itemName} weight="bold" numberOfLines={1}>{itemName}</AppText>
                        <AppText style={styles.topperName}>By {topperName || 'Verified Topper'}</AppText>
                    </View>
                    <AppText style={styles.itemPrice} weight="bold">₹{price}</AppText>
                </View>
            </View>

            <View style={styles.billingSection}>
                <View style={styles.billRow}>
                    <AppText style={styles.billLabel}>Subtotal</AppText>
                    <AppText style={styles.billValue}>₹{price}</AppText>
                </View>
                <View style={styles.billRow}>
                    <AppText style={styles.billLabel}>Convenience Fee</AppText>
                    <AppText style={styles.billValue}>₹{convenienceFee}</AppText>
                </View>
                <View style={styles.divider} />
                <View style={styles.billRow}>
                    <AppText style={styles.totalLabel} weight="bold">Total Amount</AppText>
                    <AppText style={styles.totalValue} weight="bold">₹{totalAmount}</AppText>
                </View>
            </View>

            <View style={styles.securityInfo}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <AppText style={styles.securityText}>Secure payment powered by Paynimo</AppText>
            </View>

            <TouchableOpacity onPress={onConfirm} activeOpacity={0.8} style={styles.actionButton}>
                <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <AppText style={styles.buttonText} weight="bold">Proceed to Pay ₹{totalAmount}</AppText>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <AppText style={styles.cancelText}>Cancel Transaction</AppText>
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
        color: 'white',
    },
    headerSub: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 4,
    },
    orderCard: {
        backgroundColor: Theme.colors.modalItem,
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
        color: 'white',
    },
    topperName: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 18,
        color: 'white',
    },
    billingSection: {
        marginTop: 24,
        backgroundColor: Theme.colors.modalItem,
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
        color: '#94A3B8',
    },
    billValue: {
        fontSize: 14,
        color: 'white',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        color: 'white',
    },
    totalValue: {
        fontSize: 20,
        color: Theme.colors.primary || '#3B82F6',
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
        color: '#10B981',
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
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    }
});

export default PaymentConfirmationModal;

