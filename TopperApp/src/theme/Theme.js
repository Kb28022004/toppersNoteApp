import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Theme = {
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
        backgroundGradient: ["#020617", "#0F172A", "#020617"],
        inputBackground: 'rgba(33, 36, 40, 0.5)',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20, // This is your standard horizontal padding
        xl: 24,
        xxl: 32,
    },
    layout: {
        windowWidth: width,
        windowHeight: height,
        screenPadding: 20, // Reusable horizontal padding constant
    },
    header: {
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 55,
            paddingBottom: 20,
            backgroundColor: 'transparent', // Make changes here to alter globally
            minHeight: 100, // ensuring same height globally
        },
        iconSize: 26,
    }
};
