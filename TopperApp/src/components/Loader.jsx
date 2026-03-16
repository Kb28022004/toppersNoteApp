import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import AppText from './AppText';
import useTheme from '../hooks/useTheme';

const Loader = ({ visible = false }) => {
    const { theme, isDarkMode } = useTheme();
    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }]}>
                <View style={[styles.loaderContent, { backgroundColor: theme.colors.background }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <AppText style={[styles.text, { color: theme.colors.textMuted }]}>Loading...</AppText>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContent: {
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    text: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default memo(Loader);
