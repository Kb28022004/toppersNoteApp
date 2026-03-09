import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Animated,
    PanResponder,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import { Theme } from '../theme/Theme';

const { height } = Dimensions.get('window');

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
    const panY = useRef(new Animated.Value(height)).current;

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

    const resetPositionAnim = Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
    });

    const closeAnim = Animated.timing(panY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponderCapture: (_, gestureState) => {
                return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 80 || gestureState.vy > 1.0) { // Lowered thresholds
                    closeAnim.start(() => {
                        onClose();
                    });
                } else {
                    resetPositionAnim.start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            resetPositionAnim.start();
        } else {
            panY.setValue(height);
        }
    }, [visible]);

    const handleClose = () => {
        closeAnim.start(() => {
            onClose();
        });
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        else handleClose();
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={handleClose}
                    disabled={isLoading}
                />
                <Animated.View {...panResponder.panHandlers} style={[styles.modalContent, { transform: [{ translateY: panY }] }]}>
                    <View style={styles.dragArea}>
                        <View style={styles.handle} />
                    </View>

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
                                    onPress={handleClose}
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
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        backgroundColor: Theme.colors.background,
        paddingTop: 12,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    dragArea: {
        width: '100%',
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#334155',
        borderRadius: 2,
    },
    contentContainer: {
        paddingHorizontal: 24,
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
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
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
