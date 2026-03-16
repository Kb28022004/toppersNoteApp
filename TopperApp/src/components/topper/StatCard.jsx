import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../AppText';
import useTheme from '../../hooks/useTheme';

const StatCard = ({ icon, color, bg, value, label }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: bg }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View>
                <AppText style={styles.statValue} weight="bold">{value}</AppText>
                <AppText style={styles.statLabel}>{label}</AppText>
            </View>
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    statCard: {
        width: '48%',
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statValue: {
        fontSize: 16,
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textSubtle,
    },
});

export default StatCard;
