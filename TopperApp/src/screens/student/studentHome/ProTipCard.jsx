import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../../components/AppText';
import useTheme from '../../../hooks/useTheme';

const ProTipCard = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.proTipCard}>
            <View style={styles.tipIconBox}>
                <Ionicons name="bulb" size={24} color={theme.colors.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <AppText style={styles.tipTitle} weight="bold">Pro Tip for Exams</AppText>
                <AppText style={styles.tipDesc}>Handwritten notes improve recall speed by 25% compared to typed ones.</AppText>
            </View>
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    proTipCard: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.warning + '30',
    },
    tipIconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.warning + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipTitle: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 4,
    },
    tipDesc: {
        fontSize: 12,
        color: theme.colors.textMuted,
        lineHeight: 18,
    },
});

export default ProTipCard;
