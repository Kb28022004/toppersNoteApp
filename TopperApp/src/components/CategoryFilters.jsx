import React, { useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';
import useTheme from '../hooks/useTheme';

const CategoryFilters = ({
    categories = [],
    activeCategory,
    onSelectCategory,
    style
}) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={[styles.container, style]}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.chip,
                            activeCategory === item && styles.activeChip
                        ]}
                        onPress={() => onSelectCategory(item)}
                    >
                        <AppText style={[
                            styles.text,
                            activeCategory === item && styles.activeText
                        ]}>
                            {item}
                        </AppText>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    listContent: {
        gap: 10,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    text: {
        color: theme.colors.textMuted,
        fontSize: 14,
        fontWeight: '500',
    },
    activeText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CategoryFilters;
