import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './AppText';
import { Theme } from '../theme/Theme';

const PageHeader = ({
    title,
    subtitle,
    paddingTop: customPaddingTop,
    paddingHorizontal,
    onBackPress,
    rightComponent,
    iconName = "arrow-back",
    style
}) => {
    const insets = useSafeAreaInsets();

    // Use custom padding if provided, otherwise use safe area top + small constant
    const finalPaddingTop = customPaddingTop !== undefined
        ? customPaddingTop
        : Math.max(insets.top, 20) + 10;

    return (
        <View style={[
            styles.header,
            { paddingTop: finalPaddingTop },
            paddingHorizontal !== undefined && { paddingHorizontal },
            style
        ]}>
            <View style={styles.leftContainer}>
                {onBackPress ? (
                    <TouchableOpacity style={styles.backBtn} onPress={onBackPress}>
                        <Ionicons name={iconName} size={22} color="white" />
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.titleContainer}>
                <AppText style={styles.headerTitle} weight="bold" numberOfLines={1}>
                    {title}
                </AppText>
                {subtitle ? (
                    <AppText style={styles.headerSub} numberOfLines={1}>
                        {subtitle}
                    </AppText>
                ) : null}
            </View>

            <View style={styles.rightContainer}>
                {rightComponent ? rightComponent : <View style={styles.placeholder} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: Theme.colors.background,
    },
    leftContainer: {
        width: 40,
        justifyContent: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Theme.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    titleContainer: {
        flex: 1,
        marginHorizontal: 15,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        color: 'white',
    },
    headerSub: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    placeholder: {
        width: 40,
    }
});

export default PageHeader;
