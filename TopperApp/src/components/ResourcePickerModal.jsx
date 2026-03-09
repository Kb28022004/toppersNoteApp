import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import { Theme } from '../theme/Theme';

const ResourcePickerModal = ({
    visible,
    onClose,
    onSelectGallery,
    onSelectDocument,
    title = "Upload Marksheet",
    subtitle = "Choose a source for your document"
}) => {
    return (
        <BottomSheet visible={visible} onClose={onClose} paddingHorizontal={20}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <AppText style={styles.title} weight="bold">{title}</AppText>
                    <AppText style={styles.subtitle}>{subtitle}</AppText>
                </View>

                <View style={styles.optionsWrapper}>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => {
                            onSelectGallery();
                            onClose();
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                            <Ionicons name="images" size={24} color="#3B82F6" />
                        </View>
                        <View style={styles.optionTextContent}>
                            <AppText style={styles.optionLabel} weight="bold">Photo Gallery</AppText>
                            <AppText style={styles.optionDesc}>Select an image from your device</AppText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#475569" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => {
                            onSelectDocument();
                            onClose();
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                            <MaterialCommunityIcons name="file-document" size={24} color="#10B981" />
                        </View>
                        <View style={styles.optionTextContent}>
                            <AppText style={styles.optionLabel} weight="bold">Files / Documents</AppText>
                            <AppText style={styles.optionDesc}>Pick a PDF or document file</AppText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#475569" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <AppText style={styles.cancelText} weight="bold">Cancel</AppText>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 10,
    },
    header: {
        alignItems: 'center',
        marginVertical: 15,
        marginBottom: 25,
    },
    title: {
        fontSize: 20,
        color: 'white',
    },
    subtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 4,
    },
    optionsWrapper: {
        gap: 12,
        marginBottom: 25,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTextContent: {
        flex: 1,
        marginLeft: 16,
    },
    optionLabel: {
        fontSize: 16,
        color: 'white',
    },
    optionDesc: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    cancelBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    cancelText: {
        color: '#EF4444',
        fontSize: 16,
    },
});

export default ResourcePickerModal;
