import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import useTheme from '../hooks/useTheme';

const NoDataFound = ({
    message = "No data found",
    icon = "alert-circle-outline",
    containerStyle,
    textStyle
}) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.iconWrapper}>
                <Ionicons name={icon} size={32} color={theme.colors.textMuted} />
            </View>
            <AppText style={[styles.message, textStyle]}>
                {message}
            </AppText>
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.card + '4D', // 0.3 alpha
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginVertical: 10,
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.background + '80', // 0.5 alpha
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    message: {
        color: theme.colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default NoDataFound;
