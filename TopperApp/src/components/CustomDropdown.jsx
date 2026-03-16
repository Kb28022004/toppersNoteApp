import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import AppText from './AppText';
import { Ionicons } from "@expo/vector-icons";
import useTheme from '../hooks/useTheme';

const CustomDropdown = ({ label, options, selectedValue, onSelect, placeholder = "Select", error }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handleSelect = (item) => {
        onSelect(item);
        setIsVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <AppText style={styles.label}>{label}</AppText>}

            <TouchableOpacity
                style={[styles.dropdownButton, error && styles.buttonError]}
                onPress={() => setIsVisible(true)}
            >
                <AppText style={[styles.selectedText, !selectedValue && styles.placeholderText]}>
                    {options.find(opt => (opt.value || opt) === selectedValue)?.label || (typeof selectedValue === 'object' ? selectedValue.label : selectedValue) || placeholder}
                </AppText>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <AppText style={styles.modalTitle}>Select {label}</AppText>
                            <ScrollView
                                contentContainerStyle={styles.optionsList}
                                showsVerticalScrollIndicator={false}
                            >
                                {options.map((option, index) => {
                                    const optionValue = option.value || option;
                                    const optionLabel = option.label || option;
                                    const isSelected = selectedValue === optionValue;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.optionItem,
                                                isSelected && styles.selectedOptionItem
                                            ]}
                                            onPress={() => handleSelect(optionValue)}
                                        >
                                            <AppText style={[
                                                styles.optionText,
                                                isSelected && styles.selectedOptionText
                                            ]}>
                                                {optionLabel}
                                            </AppText>
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: 0,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 10,
    },
    dropdownButton: {
        backgroundColor: theme.colors.inputBackground || theme.colors.surface,
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedText: {
        color: theme.colors.text,
        fontSize: 15,
    },
    placeholderText: {
        color: theme.colors.textMuted,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 20,
        maxHeight: '70%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    optionsList: {
        paddingBottom: 10,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    selectedOptionItem: {
        backgroundColor: theme.colors.primary + '1A', // 10% alpha
        borderRadius: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 0,
    },
    optionText: {
        fontSize: 16,
        color: theme.colors.textMuted,
    },
    selectedOptionText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    buttonError: {
        borderColor: theme.colors.danger,
        backgroundColor: theme.colors.danger + '0D', // 5% alpha
    },
});

export default CustomDropdown;
