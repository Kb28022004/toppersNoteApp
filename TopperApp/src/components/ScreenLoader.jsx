import React, { memo } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Loader from './Loader';
import useTheme from '../hooks/useTheme';

const ScreenLoader = () => {
    const { theme, isDarkMode } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <Loader visible={true} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default memo(ScreenLoader);
