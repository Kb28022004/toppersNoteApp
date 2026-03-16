import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';

const SearchBar = ({
    value,
    onChangeText,
    placeholder = "Search...",
    onFilterPress,
    isFilterActive = false,
    style
}) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={[styles.container, style]}>
            <View style={styles.inputWrapper}>
                <Feather name="search" size={20} color={theme.colors.textSubtle} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    returnKeyType="search"
                />
            </View>
            {onFilterPress && (
                <TouchableOpacity
                    style={[styles.filterBtn, isFilterActive && styles.filterBtnActive]}
                    onPress={onFilterPress}
                >
                    <Ionicons
                        name="options-outline"
                        size={24}
                        color={isFilterActive ? theme.colors.textInverse : theme.colors.primary}
                    />
                    {isFilterActive && <View style={styles.activeDot} />}
                </TouchableOpacity>
            )}
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground || theme.colors.surface,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: theme.colors.text,
        fontSize: 14,
        height: '100%',
    },
    filterBtn: {
        width: 50,
        height: 50,
        backgroundColor: theme.colors.inputBackground || theme.colors.surface,
        borderRadius: 12,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        position: 'relative',
    },
    filterBtnActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    activeDot: {
        position: 'absolute',
        top: 9,
        right: 9,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.warning,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
});

export default SearchBar;
