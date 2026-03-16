import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    FlatList,
    TextInput,
    Modal,
    Share,
    RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
import Loader from '../../components/Loader';
import ScreenLoader from '../../components/ScreenLoader';
import { NoteDetailsSkeleton } from '../../components/Skeleton';
import PageHeader from '../../components/PageHeader';
import BottomSheet from '../../components/BottomSheet';
import { useGetNoteDetailsQuery, useAddReviewMutation, useToggleFavoriteNoteMutation } from '../../features/api/noteApi';
import { useFollowTopperMutation, topperApi } from '../../features/api/topperApi';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '../../features/api/paymentApi';
import { useDispatch } from 'react-redux';
import { useAlert } from '../../context/AlertContext';
import useRefresh from '../../hooks/useRefresh';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadNote, isNoteDownloaded, getDownloadedNotes } from '../../helpers/downloadService';
import useTheme from '../../hooks/useTheme';
import PaymentConfirmationModal from '../../components/PaymentConfirmationModal';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const StudentNoteDetails = ({ route, navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { noteId } = route.params;
    const { data: note, isLoading, isError, refetch } = useGetNoteDetailsQuery(noteId);
    const { refreshing, onRefresh } = useRefresh(refetch);
    const [followTopper, { isLoading: isFollowLoading }] = useFollowTopperMutation();
    const [addReview, { isLoading: isReviewing }] = useAddReviewMutation();

    // Payment Hooks
    const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
    const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
    const [toggleFavorite] = useToggleFavoriteNoteMutation();

    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [user, setUser] = useState(null);

    const [following, setFollowing] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [localNote, setLocalNote] = useState(null);
    const { showAlert } = useAlert();
    const dispatch = useDispatch();

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
        }
        loadUser();
    }, []);

    useEffect(() => {
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

    useEffect(() => {
        if (note) {
            setFollowing(note.isFollowing);
            setIsFavorite(note.isFavorite);
        }
    }, [note]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out these amazing notes on ToppersNote: ${note?.title}`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    if (isLoading) return <NoteDetailsSkeleton />;
    if (isError) return (
        <View style={styles.center}>
            <AppText style={{ color: theme.colors.danger }}>Failed to load note details</AppText>
            <ReusableButton title="Retry" onPress={refetch} style={{ marginTop: 20, width: 120 }} />
        </View>
    );

    const displayNote = note || localNote;
    if (!displayNote && !isLoading) return null;

    const {
        title: nTitle,
        subject: nSubject,
        chapterName,
        previewImages,
        price,
        description,
        topper,
        isPurchased: nIsPurchased,
        reviews,
        rating: avgRating,
        reviewCount,
        pageCount,
        language = "English",
        pdfSize = "12 MB",
        tableOfContents = []
    } = displayNote || {};

    const isPurchased = nIsPurchased || !!localNote;
    const title = nTitle || localNote?.title;
    const subject = nSubject || localNote?.subject;


    const handleFollow = async () => {
        try {
            const result = await followTopper(topper.id).unwrap();
            setFollowing(!following);
            // showAlert("Success", result.message, "success");
        } catch (error) {
            console.log("Follow Error", error);
            showAlert("Error", "Failed to update follow status", "error");
        }
    };


    const handleSubmitReview = async () => {
        try {
            await addReview({ noteId, review: { rating, comment } }).unwrap();
            setReviewModalVisible(false);
            setComment('');
            setRating(5);
            showAlert("Success", "Review added successfully!", "success");

            // Invalidate Topper Profile Cache (since rating updated)
            if (topper?.id) {
                dispatch(topperApi.util.invalidateTags([{ type: 'PublicTopper', id: topper.id }]));
            }
        } catch (error) {
            console.log("Review Error:", error);
            const errorMessage = error?.data?.message || "Failed to add review";
            showAlert("Error", errorMessage, "error");
        }
    };

    const handleToggleFavorite = async () => {
        try {
            // Optimistic update
            const newFavoriteStatus = !isFavorite;
            setIsFavorite(newFavoriteStatus);

            await toggleFavorite(noteId).unwrap();
        } catch (error) {
            console.log("Toggle Favourite Error:", error);
            // Revert if failed
            setIsFavorite(isFavorite);
            showAlert("Error", "Failed to update favourite status", "error");
        }
    };

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

    const handlePurchase = async () => {
        try {
            // Open the new confirmation modal
            setIsPaymentModalVisible(true);
        } catch (error) {
            console.log("Purchase Error", error);
            showAlert("Error", "Failed to initiate purchase", "error");
        }
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

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                {item.profilePhoto ? (
                    <Image source={{ uri: item.profilePhoto }} style={styles.reviewerAvatar} />
                ) : (
                    <View style={styles.reviewerAvatar}>
                        <AppText style={styles.avatarText}>{item.user?.charAt(0) || 'S'}</AppText>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <AppText style={styles.reviewerName} weight="bold">{item.user || 'Student'}</AppText>
                    <AppText style={styles.reviewDate}>{item?.daysAgo}</AppText>
                </View>
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons key={star} name={star <= item.rating ? "star" : "star-outline"} size={12} color={theme.colors.warning} />
                    ))}
                </View>
            </View>
            <AppText style={styles.reviewComment}>{item.comment}</AppText>
            {/* {item.verifiedPurchase && (
                <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={12} color="#10B981" />
                    <AppText style={styles.verifiedText}>Verified Learner</AppText>
                </View>
            )} */}
        </View>
    );

    return (
        <View style={styles.container}>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >

                {/* Preview Image */}
                <View style={styles.previewContainer}>
                    <Image
                        source={
                            (previewImages && previewImages.length > 0)
                                ? { uri: previewImages[0] }
                                : (localNote?.localThumbnail)
                                    ? { uri: localNote.localThumbnail }
                                    : (localNote?.thumbnail)
                                        ? { uri: localNote.thumbnail }
                                        : require('../../../assets/topper.avif')
                        }
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                    <View style={styles.gradientOverlay}>
                        <LinearGradient
                            colors={['transparent', theme.colors.background + 'cc']}
                            style={StyleSheet.absoluteFill}
                        />
                    </View>


                    <TouchableOpacity
                        style={styles.previewBtn}
                        onPress={() => navigation.navigate('NotePreview', { noteId })}
                    >
                        <Ionicons name={isPurchased ? "book-outline" : "eye"} size={20} color="white" style={{ marginRight: 8 }} />
                        <AppText style={styles.previewBtnText}>
                            {isPurchased ? "Read Full Notes" : "Watermarked Preview"}
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <View style={styles.contentBody}>

                    {/* Title & Rating */}
                    <AppText style={styles.title} weight="bold">{title}</AppText>
                    <View style={styles.ratingMeta}>
                        <Ionicons name="star" size={16} color={theme.colors.warning} />
                        <AppText style={styles.ratingValue} weight="bold">{avgRating || '0.0'}</AppText>
                        <View style={styles.dot} />
                        <AppText style={styles.reviewCount}>{reviewCount || 0} Reviews</AppText>
                    </View>

                    {/* Topper Card */}
                    <View style={styles.topperCard}>
                        {topper?.profilePhoto ? (
                            <Image source={{ uri: topper.profilePhoto }} style={styles.topperImage} />
                        ) : (
                            <View style={[styles.topperImage, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                                <AppText style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                    {topper?.name?.charAt(0) || 'T'}
                                </AppText>
                            </View>
                        )}
                        <View style={styles.topperInfo}>
                            <View style={styles.row}>
                                <AppText style={styles.topperName} weight="bold">{topper?.name}</AppText>
                                <TouchableOpacity
                                    style={[styles.badge, { backgroundColor: following ? theme.colors.surface : theme.colors.primary }, following && { borderWidth: 1, borderColor: theme.colors.primary }]}
                                    onPress={handleFollow}
                                    disabled={isFollowLoading}
                                >
                                    <AppText style={[styles.badgeText, following && { color: theme.colors.primary }]}>
                                        {following ? "Following" : "Follow"}
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                            {topper?.bio && <AppText style={styles.topperBio}>{topper.bio}</AppText>}
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('PublicTopperProfile', { topperId: topper.id })}>
                            <AppText style={styles.viewProfileText} weight="bold">View Profile</AppText>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                            <AppText style={styles.statValue} weight="bold">{pageCount || 0}</AppText>
                            <AppText style={styles.statLabel}>Pages</AppText>
                        </View>
                        {language && (
                            <View style={styles.statBox}>
                                <MaterialCommunityIcons name="translate" size={24} color={theme.colors.primary} />
                                <AppText style={styles.statValue} weight="bold">{language}</AppText>
                                <AppText style={styles.statLabel}>Language</AppText>
                            </View>
                        )}
                        {pdfSize && (
                            <View style={styles.statBox}>
                                <MaterialCommunityIcons name="file-pdf-box" size={24} color={theme.colors.primary} />
                                <AppText style={styles.statValue} weight="bold">{pdfSize}</AppText>
                                <AppText style={styles.statLabel}>PDF Size</AppText>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    <AppText style={styles.sectionTitle} weight="bold">Description</AppText>
                    <AppText style={styles.descriptionText}>{description || "No description available"}</AppText>

                    {/* Table of Contents */}
                    {tableOfContents && tableOfContents.length > 0 && (
                        <>
                            <AppText style={styles.sectionTitle} weight="bold">Table of Contents</AppText>
                            <View style={styles.tocList}>
                                {tableOfContents.map((chapter, index) => (
                                    <View key={index} style={styles.tocItem}>
                                        <View style={styles.chapterNumberBox}>
                                            <AppText style={styles.chapterNumber}>{index + 1}</AppText>
                                        </View>
                                        <AppText style={styles.chapterTitle} numberOfLines={1}>{chapter.title}</AppText>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}


                    {/* Reviews */}
                    <View style={styles.rowBetween}>
                        <AppText style={styles.sectionTitle} weight="bold">Reviews & Ratings</AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            {isPurchased && (
                                <TouchableOpacity onPress={() => setReviewModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="create-outline" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
                                    <AppText style={styles.seeAllText}>Write Review</AppText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {reviews && reviews.length > 0 ? (
                        <View style={{ gap: 15 }}>
                            {reviews.map((item, index) => (
                                <React.Fragment key={index}>
                                    {renderReviewItem({ item })}
                                </React.Fragment>
                            ))}
                        </View>
                    ) : (
                        <AppText style={styles.noReviewsText}>No reviews yet.</AppText>
                    )}

                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <AppText style={styles.finalPrice} weight="bold">₹{typeof price === 'object' ? price.current : price}</AppText>
                    <AppText style={styles.strikePrice}>Total Amount</AppText>
                </View>

                {isPurchased ? (
                    <TouchableOpacity
                        style={[styles.downloadBtnLarge, isDownloaded && { backgroundColor: theme.colors.success }]}
                        onPress={handleDownload}
                        disabled={isDownloading}
                    >
                        <Ionicons
                            name={isDownloading ? "cloud-download" : (isDownloaded ? "cloud-done" : "cloud-download-outline")}
                            size={20}
                            color="white"
                        />
                        <AppText style={styles.downloadBtnText} weight="bold">
                            {isDownloading ? `Downloading ${Math.round(downloadProgress * 100)}%` : (isDownloaded ? "Offline Ready" : "Download PDF")}
                        </AppText>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.unlockBtn}
                        onPress={handlePurchase}
                        disabled={isCreatingOrder || isVerifyingPayment}
                    >
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primary + 'CC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.unlockGradient}
                        >
                            {isCreatingOrder ? (
                                <AppText style={styles.unlockText} weight="bold">Processing...</AppText>
                            ) : (
                                <>
                                    <Ionicons name="lock-open" size={18} color="white" />
                                    <AppText style={styles.unlockText} weight="bold">Unlock Full Notes</AppText>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.header}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
                <PageHeader
                    title="Note Details"
                    onBackPress={() => navigation.goBack()}
                    iconName="chevron-back"
                    style={{ backgroundColor: isDarkMode ? 'transparent' : theme.colors.background }}
                    rightComponent={
                        <View style={styles.rightIcons}>
                            <TouchableOpacity onPress={handleToggleFavorite} style={styles.iconBtn}>
                                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? theme.colors.danger : (isDarkMode ? "white" : theme.colors.text)} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                                <Ionicons name="share-social-outline" size={22} color={isDarkMode ? "white" : theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>

            {/* Review Modal */}
            <BottomSheet
                visible={reviewModalVisible}
                onClose={() => setReviewModalVisible(false)}
            >
                <AppText style={styles.modalTitle} weight="bold">Write a Review</AppText>
                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons name={star <= rating ? "star" : "star-outline"} size={32} color={theme.colors.warning} />
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Share your feedback..."
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                />
                <View style={styles.modalActions}>
                    <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={styles.cancelBtn}>
                        <AppText style={{ color: theme.colors.textMuted }}>Cancel</AppText>
                    </TouchableOpacity>
                    <ReusableButton
                        title="Submit"
                        loading={isReviewing}
                        loadingText="Submitting..."
                        onPress={handleSubmitReview}
                        style={{ width: 220 }}
                    />
                </View>
            </BottomSheet>

            <PaymentConfirmationModal
                visible={isPaymentModalVisible}
                onClose={() => setIsPaymentModalVisible(false)}
                onConfirm={confirmPayment}
                itemName={title}
                price={typeof price === 'object' ? price.current : price}
                topperName={topper?.name}
            />
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        padding: 8,
    },
    scrollContent: {
        paddingTop: 0, // Header is absolute but we want image at top
        paddingBottom: 120, // Make space for footer
    },
    previewContainer: {
        height: 380,
        width: width,
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.colors.card,
        marginBottom: 25,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.3)' // Subtle overlay
    },
    bestSellerBadge: {
        position: 'absolute',
        top: 20,
        right: 30,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
        zIndex: 2,
    },
    bestSellerText: {
        color: theme.colors.textInverse,
        fontSize: 10,
        fontWeight: 'bold',
    },
    previewBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.overlay,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        zIndex: 5,
    },
    previewBtnText: {
        color: theme.colors.textInverse,
        fontWeight: '600',
        fontSize: 14,
    },
    contentBody: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        color: theme.colors.text,
        lineHeight: 32,
        marginBottom: 10,
    },
    ratingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    ratingValue: {
        color: theme.colors.text,
        fontSize: 14,
        marginLeft: 6,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.textMuted,
        marginHorizontal: 8,
    },
    reviewCount: {
        color: theme.colors.textMuted,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    topperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 25,
    },
    topperImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    topperInfo: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topperName: {
        color: theme.colors.text,
        fontSize: 16,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: theme.colors.textInverse,
        fontSize: 11,
        fontWeight: 'bold',
    },
    topperBio: {
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    viewProfileText: {
        color: theme.colors.primary,
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        gap: 10,
    },
    statBox: {
        flex: 1,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statValue: {
        color: theme.colors.text,
        fontSize: 16,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    sectionTitle: {
        color: theme.colors.text,
        fontSize: 18,
        marginBottom: 12,
    },
    descriptionText: {
        color: theme.colors.textMuted,
        fontSize: 14,
        lineHeight: 24,
        marginBottom: 30,
    },
    tocList: {
        marginBottom: 30,
    },
    tocItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    chapterNumberBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    chapterNumber: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
    },
    chapterTitle: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    chapterPage: {
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    showAllChapters: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    showAllText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    seeAllText: {
        color: theme.colors.primary,
        fontSize: 14,
    },
    reviewCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: theme.colors.textInverse,
        fontWeight: 'bold',
        fontSize: 16,
    },
    reviewerName: {
        color: theme.colors.text,
        fontSize: 14,
        marginBottom: 2,
    },
    reviewDate: {
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewComment: {
        color: theme.colors.textSubtle,
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    verifiedText: {
        color: theme.colors.success,
        fontSize: 12,
        fontWeight: '500',
    },
    noReviewsText: {
        color: theme.colors.textMuted,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: theme.colors.card,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    finalPrice: {
        color: theme.colors.text,
        fontSize: 24,
    },
    discountText: {
        color: theme.colors.success,
        fontSize: 14,
        fontWeight: 'bold',
    },
    strikePrice: {
        color: theme.colors.textMuted,
        fontSize: 14,
    },
    unlockBtn: {
        borderRadius: 12,
        overflow: 'hidden',
        width: 180,
    },
    unlockGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    downloadBtnLarge: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 180,
        gap: 8,
    },
    downloadBtnText: {
        color: theme.colors.textInverse,
        fontSize: 14,
    },
    unlockText: {
        color: theme.colors.textInverse,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        color: theme.colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    commentInput: {
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        padding: 15,
        color: theme.colors.text,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cancelBtn: {
        padding: 15,
    },
});

export default StudentNoteDetails;
