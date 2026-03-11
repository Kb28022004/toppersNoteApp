import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AppText from '../../../components/AppText';
import { Theme } from '../../../theme/Theme';

const ReferAndEarnBanner = ({ onRefresh, navigation }) => {
    return (
        <TouchableOpacity
            style={styles.referBanner}
            onPress={() => navigation.navigate('ReferAndEarn')}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={Theme.colors.backgroundGradient}
                style={styles.referGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.referContent}>
                    <View style={styles.referIconContainer}>
                        <MaterialCommunityIcons name="gift" size={30} color="white" />
                    </View>
                    <View style={styles.referTextContainer}>
                        <AppText style={styles.referTitle} weight="bold">Refer & Earn CASH</AppText>
                        <AppText style={styles.referSubtitle}>Invite friends and get 10% commission on every purchase!</AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    referBanner: {
        marginHorizontal: 20,
        marginTop: 25,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: Theme.colors.card,
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
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    referTextContainer: {
        flex: 1,
    },
    referTitle: {
        color: 'white',
        fontSize: 16,
    },
    referSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        marginTop: 2,
    },
});

export default ReferAndEarnBanner;
