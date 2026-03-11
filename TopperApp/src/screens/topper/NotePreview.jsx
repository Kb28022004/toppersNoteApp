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
import { Theme } from '../../theme/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '../../context/AlertContext';
import PaymentConfirmationModal from '../../components/PaymentConfirmationModal';

const { width, height } = Dimensions.get('window');

const NotePreview = ({ route, navigation }) => {
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            {!isFullScreen && (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="white" />
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
                    <View style={styles.pageIndicatorBox}>
                        <AppText style={styles.pageCountText}>{currentPageIndex + 1} / {previewImages.length}</AppText>
                    </View>
                </View>
            )}

            {/* Note Content */}
            <View style={[styles.contentContainer, isFullScreen && styles.fullScreenContent]}>
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
                            <AppText style={{ color: '#64748B' }}>No preview pages available</AppText>
                        </View>
                    )}

                    {isFullScreen && (
                        <TouchableOpacity style={styles.exitFullScreenBtn} onPress={() => setIsFullScreen(false)}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    )}

                    {/* Dynamic Watermark Overlay */}
                    {!isPurchased && (
                        <View style={styles.watermarkLayer} pointerEvents="none">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <View key={i} style={[styles.watermarkRow, { marginTop: i * 80 }]}>
                                    <AppText style={styles.watermarkText}>
                                        UID: {userData?.id?.slice(-6) || 'STUDENT'} • UNAUTHORIZED SHARING PROHIBITED • PROPERTY OF TOPPERSNOTE
                                    </AppText>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Protected Content Badge */}
                    <View style={styles.protectedBadge}>
                        <Ionicons name="lock-closed" size={14} color="white" style={{ marginRight: 6 }} />
                        <AppText style={styles.protectedText}>Protected Content</AppText>
                    </View>
                </View>
            </View>

            {/* Footer / Controls */}
            {!isFullScreen && (
                <View style={styles.footer}>
                    {!isPurchased && hasMorePages && (
                        <TouchableOpacity
                            style={styles.buyBtn}
                            onPress={handleBuyNow}
                            disabled={isCreatingOrder || isVerifyingPayment}
                        >
                            <LinearGradient
                                colors={['#00B1FC', '#007FFF']}
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
                            minimumTrackTintColor="#00B1FC"
                            maximumTrackTintColor="#1E293B"
                            thumbTintColor="#00B1FC"
                        />
                    )}

                    <View style={styles.controlsRow}>
                        <TouchableOpacity style={styles.controlBtn} onPress={() => setIsFullScreen(true)}>
                            <MaterialCommunityIcons name="fullscreen" size={24} color="#00B1FC" />
                        </TouchableOpacity>

                        <View style={styles.screenshotBlocked}>
                            <MaterialCommunityIcons name="eye-off-outline" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                            <AppText style={styles.blockedText}>SCREEN RECORDING BLOCKED</AppText>
                        </View>

                        <TouchableOpacity
                            style={[styles.controlBtn, isDownloaded && { backgroundColor: '#059669' }]}
                            disabled={!isPurchased || isDownloading}
                            onPress={handleDownload}
                        >
                            {isDownloading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Feather name={isDownloaded ? "check" : "download"} size={22} color={isPurchased ? "white" : "#334155"} />
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
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Theme.colors.background,
    },
    backBtn: {
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    noteTitle: {
        color: 'white',
        fontSize: 14,
    },
    topperRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topperText: {
        color: '#64748B',
        fontSize: 11,
    },
    topperName: {
        color: '#94A3B8',
        fontSize: 11,
    },
    pageIndicatorBox: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pageCountText: {
        color: '#94A3B8',
        fontSize: 12,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
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
        color: '#FFFFFF',
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
        shadowColor: '#00B1FC',
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
        color: '#64748B',
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
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenshotBlocked: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    blockedText: {
        color: '#EF4444',
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
