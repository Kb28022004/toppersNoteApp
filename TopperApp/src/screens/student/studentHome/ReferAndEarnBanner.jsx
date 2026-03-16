import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AppText from '../../../components/AppText';
import useTheme from '../../../hooks/useTheme';

const ReferAndEarnBanner = ({ onRefresh, navigation }) => {
    const { theme, } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <TouchableOpacity
            style={styles.referBanner}
            onPress={() => navigation.navigate('ReferAndEarn')}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primary + 'cc']}
                style={styles.referGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.referContent}>
                    <View style={styles.referIconContainer}>
                        <MaterialCommunityIcons name="gift" size={30} color={theme.colors.textInverse} />
                    </View>
                    <View style={styles.referTextContainer}>
                        <AppText style={styles.referTitle} weight="bold">Refer & Earn CASH</AppText>
                        <AppText style={styles.referSubtitle}>Invite friends and get 10% commission on every purchase!</AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textInverse} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const createStyles = (theme) => StyleSheet.create({
    referBanner: {
        marginHorizontal: 20,
        marginTop: 25,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    referGradient: {
        padding: 20,
    },
    referContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    referIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.textInverse + '26',
        justifyContent: 'center',
        alignItems: 'center',
    },
    referTextContainer: {
        flex: 1,
    },
    referTitle: {
        color: theme.colors.textInverse,
        fontSize: 16,
    },
    referSubtitle: {
        color: theme.colors.textInverse + 'cc',
        fontSize: 11,
        marginTop: 2,
    },
});

export default ReferAndEarnBanner;
