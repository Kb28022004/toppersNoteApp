import React, { memo } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Loader from './Loader';
import { Theme } from '../theme/Theme';

const ScreenLoader = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Loader visible={true} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default memo(ScreenLoader);
