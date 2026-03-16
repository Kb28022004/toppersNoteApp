import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../hooks/useTheme';
import { useMemo } from 'react';

// Create Context
const AlertContext = createContext();

// Constants
const { width } = Dimensions.get('window');

/**
 * Custom Alert Component (Internal)
 */
const AlertModal = ({ config, onClose, onConfirm }) => {
    const { theme: appTheme } = useTheme();
    if (!config.visible) return null;

    // Define styles based on type
    const getTheme = () => {
        switch (config.type) {
            case 'success':
                return {
                    icon: 'check-circle',
                    color: '#10B981',
                    gradient: ['#10B981', '#059669'],
                    bg: 'rgba(16, 185, 129, 0.1)'
                };
            case 'error':
                return {
                    icon: 'alert-circle',
                    color: '#EF4444',
                    gradient: ['#EF4444', '#DC2626'],
                    bg: 'rgba(239, 68, 68, 0.1)'
                };
            case 'warning':
                return {
                    icon: 'alert-triangle',
                    color: '#F59E0B',
                    gradient: ['#F59E0B', '#D97706'],
                    bg: 'rgba(245, 158, 11, 0.1)'
                };
            case 'info':
            default:
                return {
                    icon: 'info',
                    color: '#3B82F6',
                    gradient: ['#3B82F6', '#2563EB'],
                    bg: 'rgba(59, 130, 246, 0.1)'
                };
        }
    };

    const theme = getTheme();

    return (
        <Modal
            transparent
            visible={config.visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.alertBox, { backgroundColor: appTheme.colors.card, borderColor: appTheme.colors.border }]}>

                    {/* Icon Header */}
                    <View style={[styles.iconContainer, { backgroundColor: theme.bg, borderColor: theme.color }]}>
                        <Feather name={theme.icon} size={32} color={theme.color} />
                    </View>

                    {/* Content */}
                    <Text style={[styles.title, { color: appTheme.colors.text }]}>{config.title}</Text>
                    <Text style={[styles.message, { color: appTheme.colors.textMuted }]}>{config.message}</Text>

                    {/* Actions */}
                    <View style={styles.actions}>
                        {config.showCancel && (
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.cancelBtn}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.cancelText, { color: appTheme.colors.textMuted }]}>{config.cancelText || "Cancel"}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onConfirm}
                            style={[styles.confirmBtnContainer, !config.showCancel && { flex: 1 }]}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={theme.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.confirmBtn}
                            >
                                <Text style={styles.confirmText}>{config.confirmText || "OK"}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

/**
 * Toast Notification (Internal)
 */
const ToastNotification = ({ config, hideToast }) => {
    const { theme: appTheme } = useTheme();
    const translateY = useRef(new Animated.Value(-150)).current;

    useEffect(() => {
        if (config.visible) {
            Animated.spring(translateY, {
                toValue: 50,
                useNativeDriver: true,
                speed: 12,
                bounciness: 8
            }).start();

            const timer = setTimeout(() => {
                hideToast();
            }, 3500);
            return () => clearTimeout(timer);
        } else {
            Animated.timing(translateY, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [config.visible]);

    if (!config.visible && translateY._value === -150) return null;

    return (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY }] }]}>
            <TouchableOpacity
                style={[styles.toastContent, { backgroundColor: appTheme.colors.card, borderColor: appTheme.colors.border }]}
                activeOpacity={0.8}
                onPress={() => {
                    if (config.onPress) config.onPress();
                    hideToast();
                }}
            >
                <View style={styles.toastIconBox}>
                    <Ionicons name="chatbubbles" size={20} color="white" />
                </View>
                <View style={styles.toastTextContainer}>
                    <Text style={[styles.toastTitle, { color: appTheme.colors.text }]} numberOfLines={1}>{config.title}</Text>
                    <Text style={[styles.toastMessage, { color: appTheme.colors.textMuted }]} numberOfLines={1}>{config.message}</Text>
                </View>
                <TouchableOpacity onPress={hideToast} style={{ padding: 5 }}>
                    <Ionicons name="close" size={20} color={appTheme.colors.textMuted} />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Provider Component
export const AlertProvider = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        showCancel: false,
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: null,
    });

    const [toastConfig, setToastConfig] = useState({
        visible: false,
        title: '',
        message: '',
        onPress: null,
    });

    const showAlert = useCallback((title, message, type = 'info', options = {}) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            showCancel: options.showCancel || false,
            confirmText: options.confirmText || 'OK',
            cancelText: options.cancelText || 'Cancel',
            onConfirm: options.onConfirm || null,
        });
    }, []);

    const hideAlert = useCallback(() => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
    }, []);

    const handleConfirm = () => {
        if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
        }
        hideAlert();
    };

    const showToast = useCallback((title, message, onPress = null) => {
        setToastConfig({ visible: true, title, message, onPress });
    }, []);

    const hideToast = useCallback(() => {
        setToastConfig((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert, showToast }}>
            {children}
            <AlertModal
                config={alertConfig}
                onClose={hideAlert}
                onConfirm={handleConfirm}
            />
            <ToastNotification
                config={toastConfig}
                hideToast={hideToast}
            />
        </AlertContext.Provider>
    );
};

// Custom Hook
export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlert must be used within an AlertProvider");
    }
    return context;
};

// Styles
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.75)', // Dark blur feel
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    alertBox: {
        width: Math.min(width * 0.85, 340),
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#334155'
    },
    iconContainer: {
        marginBottom: 20,
        padding: 16,
        borderRadius: 50,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'System' // Or app font
    },
    message: {
        color: '#94A3B8', // Slate-400
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 28,
        fontFamily: 'System'
    },
    actions: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: 12
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    confirmBtnContainer: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        /* Shadow for button */
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    cancelText: {
        color: '#94A3B8',
        fontSize: 15,
        fontWeight: '600'
    },
    confirmText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    toastIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    toastTextContainer: {
        flex: 1,
    },
    toastTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    toastMessage: {
        color: '#94A3B8',
        fontSize: 13,
    }
});
