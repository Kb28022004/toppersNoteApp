import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const lightTheme = {
    colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        border: '#E5E7EB',
        text: '#111827',
        textMuted: '#6B7280',
        textSubtle: '#9CA3AF',
        white: '#FFFFFF',
        headerBottomBorder: '#E5E7EB',
        uploadNotesButton: '#3B82F6',
        backgroundGradient: ["#F9FAFB", "#F3F4F6", "#E5E7EB"],
        inputBackground: '#F3F4F6',
        modalBackground: '#FFFFFF',
        modalItem: '#F9FAFB',
        danger: '#EF4444',
        success: '#10B981',
        overlay: 'rgba(0, 0, 0, 0.4)',
        borderLight: 'rgba(255, 255, 255, 0.1)',
        textInverse: '#FFFFFF',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
    },
    layout: {
        windowWidth: width,
        windowHeight: height,
        screenPadding: 20,
    },
    header: {
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 20,
            backgroundColor: 'transparent',
            minHeight: 100,
        },
        iconSize: 26,
    }
};

export const darkTheme = {
    colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#000000ff',
        surface: '#000000f8',
        card: '#1E293B',
        border: '#334155',
        text: 'white',
        textMuted: '#94A3B8',
        textSubtle: '#64748B',
        white: '#FFFFFF',
        headerBottomBorder: '#262727ff',
        uploadNotesButton: '#24459fff',
        backgroundGradient: ["#2d313fff", "#1f2534ff", "#29383bff"],
        inputBackground: 'rgba(33, 36, 40, 0.5)',
        modalBackground: '#111827',
        modalItem: '#1E293B',
        danger: '#EF4444',
        success: '#10B981',
        overlay: 'rgba(0, 0, 0, 0.6)',
        borderLight: 'rgba(255, 255, 255, 0.1)',
        textInverse: '#FFFFFF',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
    },
    layout: {
        windowWidth: width,
        windowHeight: height,
        screenPadding: 20,
    },
    header: {
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 20,
            backgroundColor: 'transparent',
            minHeight: 100,
        },
        iconSize: 26,
    }
};

// Legacy Export for compatibility during migration
export const Theme = darkTheme;
