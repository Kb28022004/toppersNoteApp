import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import useTheme from '../hooks/useTheme';
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
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    // Type Config
    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'error': return { name: 'alert-circle', color: theme.colors.danger, bg: theme.colors.danger + '1A' };
            case 'warning': return { name: 'warning', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
            default: return { name: 'information-circle', color: theme.colors.primary, bg: theme.colors.primary + '1A' };
        }
    };

    const gradientColors = () => {
        switch (type) {
            case 'success': return ['#10B981', '#059669'];
            case 'error': return [theme.colors.danger, '#DC2626'];
            case 'warning': return ['#F59E0B', '#D97706'];
            default: return [theme.colors.primary, '#2563EB'];
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

const createStyles = (theme) => StyleSheet.create({
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
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 15,
        color: theme.colors.textMuted,
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
        backgroundColor: theme.colors.card,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelText: {
        color: theme.colors.textMuted,
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
