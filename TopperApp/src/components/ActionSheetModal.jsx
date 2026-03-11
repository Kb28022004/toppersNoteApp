import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import { Theme } from '../theme/Theme';
import BottomSheet from './BottomSheet';

const ActionSheetModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = "Confirm",
    cancelText = "Cancel",
    showCancel = true,
    isLoading = false,
}) => {
    // Type Config
    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'error': return { name: 'alert-circle', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'warning': return { name: 'warning', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
            default: return { name: 'information-circle', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
        }
    };

    const gradientColors = () => {
        switch (type) {
            case 'success': return ['#10B981', '#059669'];
            case 'error': return ['#EF4444', '#DC2626'];
            case 'warning': return ['#F59E0B', '#D97706'];
            default: return ['#3B82F6', '#2563EB'];
        }
    };

    const iconData = getIcon();

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        else onClose();
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            paddingHorizontal={24}
        >
            <View style={styles.contentContainer}>
                <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
                    <Ionicons name={iconData.name} size={36} color={iconData.color} />
                </View>

                <AppText style={styles.title} weight="bold">{title}</AppText>
                <AppText style={styles.message}>{message}</AppText>

                <View style={styles.actions}>
                    {showCancel && (
                        <TouchableOpacity
                            style={[styles.btn, styles.cancelBtn]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <AppText style={styles.cancelText} weight="medium">{cancelText}</AppText>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.btn, styles.confirmBtnContainer, !showCancel && { flex: 1 }]}
                        onPress={handleConfirm}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={gradientColors()}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBtn}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <AppText style={styles.confirmText} weight="bold">{confirmText}</AppText>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        color: 'white',
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 15,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    actions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    btn: {
        flex: 1,
        height: 52,
    },
    cancelBtn: {
        backgroundColor: Theme.colors.modalItem,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        color: '#94A3B8',
        fontSize: 16,
    },
    confirmBtnContainer: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    gradientBtn: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    confirmText: {
        color: 'white',
        fontSize: 16,
    },
});

export default ActionSheetModal;
