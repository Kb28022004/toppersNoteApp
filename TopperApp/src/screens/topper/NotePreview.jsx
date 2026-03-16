import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    FlatList
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ScreenCapture from 'expo-screen-capture';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../../components/AppText';
import { useGetNoteDetailsQuery } from '../../features/api/noteApi';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '../../features/api/paymentApi';
import Loader from '../../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadNote, isNoteDownloaded, getDownloadedNotes } from '../../helpers/downloadService';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '../../context/AlertContext';
import PaymentConfirmationModal from '../../components/PaymentConfirmationModal';
import useTheme from '../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

const NotePreview = ({ route, navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const { showAlert } = useAlert();
    const { noteId } = route.params;
    const { data: note, isLoading, refetch } = useGetNoteDetailsQuery(noteId);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [userData, setUserData] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const flatListRef = React.useRef(null);

    const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentPageIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = React.useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    const handleSliderChange = (value) => {
        setCurrentPageIndex(value);
        flatListRef.current?.scrollToIndex({ index: value, animated: true });
    };

    // Payment Hooks
    const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
    const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();

    // 0. Safety: Guarded Refetch on focus
    useFocusEffect(
        React.useCallback(() => {
            if (note) {
                refetch?.();
            }
        }, [note, refetch])
    );

    // 1. Protection: Prevent Screenshots & Recording
    useEffect(() => {
        const protect = async () => {
            await ScreenCapture.preventScreenCaptureAsync();
        };
        protect();

        // Allow screenshots again when leaving the screen
        return () => {
            ScreenCapture.allowScreenCaptureAsync();
        };
    }, []);

    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const [localNote, setLocalNote] = useState(null);

    // 2. Load User Data for Watermark
    useEffect(() => {
        const loadUser = async () => {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) setUserData(JSON.parse(userStr));
        };
        loadUser();

        if (noteId) {
            const checkDownload = async () => {
                const status = await isNoteDownloaded(noteId);
                setIsDownloaded(status);
                if (status) {
                    const downloads = await getDownloadedNotes();
                    const found = downloads.find(d => d.id === noteId);
                    if (found) setLocalNote(found);
                }
            };
            checkDownload();
        }
    }, [noteId]);

    const displayNote = note || localNote;

    if (isLoading && !localNote) return <Loader visible />;

    const previewImages = (displayNote?.previewImages && displayNote.previewImages.length > 0)
        ? displayNote.previewImages
        : (localNote?.localThumbnail ? [localNote.localThumbnail] : localNote?.thumbnail ? [localNote.thumbnail] : []);
    const totalPages = displayNote?.pageCount || 0;
    const isPurchased = displayNote?.isPurchased || !!localNote;
    const hasMorePages = totalPages > previewImages.length;

    const handleDownload = async () => {
        if (isDownloaded) {
            showAlert("In-App Offline", "This note is already downloaded and available in your library for offline access.", "success");
            return;
        }

        try {
            setIsDownloading(true);
            setDownloadProgress(0);

            await downloadNote(note, (progress) => {
                setDownloadProgress(progress);
            });

            setIsDownloaded(true);
            setIsDownloading(false);
            showAlert("Success", "Note downloaded for offline access! You can find it in 'My Library' under the Downloaded tab.", "success");
        } catch (error) {
            console.error("Download Error:", error);
            setIsDownloading(false);
            showAlert("Error", "Failed to download note. Please try again.", "error");
        }
    };

    const handleBuyNow = () => {
        setIsPaymentModalVisible(true);
    };

    const confirmPayment = async () => {
        setIsPaymentModalVisible(false);
        try {
            // 1. Create Order
            const orderData = await createOrder(noteId).unwrap();
            const { orderId } = orderData.data;

            // 2. SIMULATING SUCCESSFUL PAYMENT RESPONSE
            const mockPaymentResponse = {
                razorpay_order_id: orderId,
                razorpay_payment_id: `pay_${Date.now()}`,
                razorpay_signature: "mock_signature_bypass"
            };

            // 3. Verify Payment
            await verifyPayment(mockPaymentResponse).unwrap();
            showAlert("Success", "Payment Successful! Note unlocked.", "success");
            refetch();
        } catch (error) {
            console.log("Confirm Payment Error", error);
            showAlert("Error", error?.data?.message || "Payment verification failed", "error");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header */}
            {!isFullScreen && (
                <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <AppText style={styles.noteTitle} weight="bold" numberOfLines={1}>
                            {displayNote?.subject}: {displayNote?.chapterName || displayNote?.title}
                        </AppText>
                        <View style={styles.topperRow}>
                            <AppText style={styles.topperText}>Topper: </AppText>
                            <AppText style={styles.topperName} weight="bold">{displayNote?.topper?.name || displayNote?.topperName}</AppText>
                        </View>
                    </View>
                    <View style={[styles.pageIndicatorBox, { backgroundColor: theme.colors.card }]}>
                        <AppText style={styles.pageCountText}>{currentPageIndex + 1} / {previewImages.length}</AppText>
                    </View>
                </View>
            )}

            {/* Note Content */}
            <View style={[styles.contentContainer, isFullScreen && styles.fullScreenContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.imageWrapper, { width: '100%', height: '100%' }]}>
                    {previewImages.length > 0 ? (
                        <FlatList
                            ref={flatListRef}
                            data={previewImages}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            onViewableItemsChanged={onViewableItemsChanged}
                            viewabilityConfig={viewabilityConfig}
                            getItemLayout={(data, index) => ({
                                length: isFullScreen ? width : width - 32,
                                offset: (isFullScreen ? width : width - 32) * index,
                                index,
                            })}
                            renderItem={({ item }) => (
                                <View style={{ width: isFullScreen ? width : width - 34, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <ImageZoom
                                        cropWidth={isFullScreen ? width : width - 34}
                                        cropHeight={height * 0.7} // Approximate height of the container
                                        imageWidth={isFullScreen ? width : width - 34}
                                        imageHeight={height * 0.7}
                                        enableDoubleClickZoom={true}
                                        centerOn={null}
                                    >
                                        <Image
                                            source={{ uri: item }}
                                            style={styles.noteImage}
                                            resizeMode="contain"
                                        />
                                    </ImageZoom>
                                </View>
                            )}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <AppText style={{ color: theme.colors.textMuted }}>No preview pages available</AppText>
                        </View>
                    )}

                    {isFullScreen && (
                        <TouchableOpacity style={styles.exitFullScreenBtn} onPress={() => setIsFullScreen(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.white} />
                        </TouchableOpacity>
                    )}

                    {/* Dynamic Watermark Overlay */}
                    {!isPurchased && (
                        <View style={styles.watermarkLayer} pointerEvents="none">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <View key={i} style={[styles.watermarkRow, { marginTop: i * 80 }]}>
                                    <AppText style={[styles.watermarkText, { color: theme.colors.white }]}>
                                        UID: {userData?.id?.slice(-6) || 'STUDENT'} • UNAUTHORIZED SHARING PROHIBITED • PROPERTY OF TOPPERSNOTE
                                    </AppText>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Protected Content Badge */}
                    <View style={styles.protectedBadge}>
                        <Ionicons name="lock-closed" size={14} color={theme.colors.white} style={{ marginRight: 6 }} />
                        <AppText style={styles.protectedText}>Protected Content</AppText>
                    </View>
                </View>
            </View>

            {/* Footer / Controls */}
            {!isFullScreen && (
                <View style={styles.footer}>
                    {!isPurchased && hasMorePages && (
                        <TouchableOpacity
                            style={[styles.buyBtn, { shadowColor: theme.colors.primary }]}
                            onPress={handleBuyNow}
                            disabled={isCreatingOrder || isVerifyingPayment}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.primary + 'CC']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buyGradient}
                            >
                                {isCreatingOrder || isVerifyingPayment ? (
                                    <AppText style={styles.buyBtnText} weight="bold">Processing Payment...</AppText>
                                ) : (
                                    <>
                                        <Ionicons name="cart-outline" size={20} color="white" />
                                        <AppText style={styles.buyBtnText} weight="bold">Unlock {totalPages - previewImages.length} more pages - ₹{displayNote?.price?.current}</AppText>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <View style={styles.pageSliderRow}>
                        <AppText style={styles.pageLabel}>Page {currentPageIndex + 1}</AppText>
                        <AppText style={styles.pageLabel}>{previewImages.length} Pages Available</AppText>
                    </View>

                    {previewImages.length > 1 && (
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={previewImages.length - 1}
                            step={1}
                            value={currentPageIndex}
                            onSlidingComplete={handleSliderChange}
                            minimumTrackTintColor={theme.colors.primary}
                            maximumTrackTintColor={theme.colors.border}
                            thumbTintColor={theme.colors.primary}
                        />
                    )}

                    <View style={styles.controlsRow}>
                        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: theme.colors.card }]} onPress={() => setIsFullScreen(true)}>
                            <MaterialCommunityIcons name="fullscreen" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>

                        <View style={[styles.screenshotBlocked, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]}>
                            <MaterialCommunityIcons name="eye-off-outline" size={16} color={theme.colors.danger} style={{ marginRight: 8 }} />
                            <AppText style={[styles.blockedText, { color: theme.colors.danger }]}>SCREEN RECORDING BLOCKED</AppText>
                        </View>

                        <TouchableOpacity
                            style={[styles.controlBtn, { backgroundColor: theme.colors.card }, isDownloaded && { backgroundColor: theme.colors.success }]}
                            disabled={!isPurchased || isDownloading}
                            onPress={handleDownload}
                        >
                            {isDownloading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Feather name={isDownloaded ? "check" : "download"} size={22} color={isPurchased ? "white" : theme.colors.textMuted} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <PaymentConfirmationModal
                visible={isPaymentModalVisible}
                onClose={() => setIsPaymentModalVisible(false)}
                onConfirm={confirmPayment}
                itemName={displayNote?.chapterName || displayNote?.subject || "Note"}
                price={displayNote?.price?.current}
                topperName={displayNote?.topper?.name || displayNote?.topperName}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    noteTitle: {
        fontSize: 14,
    },
    topperRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topperText: {
        fontSize: 11,
    },
    topperName: {
        fontSize: 11,
    },
    pageIndicatorBox: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pageCountText: {
        fontSize: 12,
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    imageWrapper: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteImage: {
        width: '100%',
        height: '100%',
    },
    watermarkLayer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 40,
        opacity: 0.15,
    },
    watermarkRow: {
        transform: [{ rotate: '-30deg' }],
        padding: 10,
    },
    watermarkText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    protectedBadge: {
        position: 'absolute',
        top: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
    },
    protectedText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600'
    },
    buyBtn: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buyGradient: {
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    buyBtnText: {
        color: 'white',
        fontSize: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40, // Increased for safe area
        paddingTop: 10,
    },
    pageSliderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    pageLabel: {
        fontSize: 12,
    },
    slider: {
        width: '100%',
        height: 40,
        marginBottom: 10,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    controlBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenshotBlocked: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    blockedText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    fullScreenContent: {
        marginHorizontal: 0,
        marginVertical: 0,
        borderRadius: 0,
        borderWidth: 0,
    },
    navOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    navBtn: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exitFullScreenBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    }
});

export default NotePreview;
