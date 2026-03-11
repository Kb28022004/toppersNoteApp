import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../../components/AppText';

const ProTipCard = () => {
    return (
        <View style={styles.proTipCard}>
            <View style={styles.tipIconBox}>
                <Ionicons name="bulb" size={24} color="#FBBF24" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <AppText style={styles.tipTitle} weight="bold">Pro Tip for Exams</AppText>
                <AppText style={styles.tipDesc}>Handwritten notes improve recall speed by 25% compared to typed ones.</AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    proTipCard: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FBBF2430',
    },
    tipIconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FBBF2415',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipTitle: {
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    tipDesc: {
        fontSize: 12,
        color: '#94A3B8',
        lineHeight: 18,
    },
});

export default ProTipCard;
