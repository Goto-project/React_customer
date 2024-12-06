import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/MyReview.css";

const MyReview = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [updatedContent, setUpdatedContent] = useState("");
    const [updatedRating, setUpdatedRating] = useState(0);
    const [updatedImage, setUpdatedImage] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            const token = localStorage.getItem("token");
            const customerEmail = localStorage.getItem("email");

            if (!token || !customerEmail) {
                setErrorMessage("로그인 정보가 유효하지 않습니다.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/ROOT/api/review/myreviews.json`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.status === 200) {
                    const sortedReviews = response.data.list.sort((a, b) => {
                        const dateA = new Date(a.regdate);
                        const dateB = new Date(b.regdate);
                        return dateB - dateA;
                    });
                    setReviews(sortedReviews);
                } else {
                    setErrorMessage("리뷰를 불러오는 데 실패했습니다.");
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
                setErrorMessage("리뷰를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };

    const handleUpdate = (review) => {
        setCurrentReview(review);
        setUpdatedContent(review.content);
        setUpdatedRating(review.rating);
        setIsEditing(true);
    };

    const handleSaveUpdate = async () => {
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("review", new Blob([JSON.stringify({
            reviewNo: currentReview.reviewNo,
            content: updatedContent,
            rating: updatedRating,
        })], { type: "application/json" }));

        if (updatedImage) {
            formData.append("image", updatedImage);
        }

        try {
            const response = await axios.put(`/ROOT/api/review/update.json`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status === 200) {
                const updatedReviews = reviews.map((review) =>
                    review.reviewNo === currentReview.reviewNo
                        ? { ...review, content: updatedContent, rating: updatedRating, imageurl: updatedImage ? URL.createObjectURL(updatedImage) : review.imageurl }
                        : review
                );
                setReviews(updatedReviews);
                setIsEditing(false);
                setCurrentReview(null);
                setUpdatedContent("");
                setUpdatedRating(0);
                setUpdatedImage(null);
            } else {
                setErrorMessage("리뷰 수정 실패");
            }
        } catch (error) {
            console.error("Error updating review:", error);
            setErrorMessage("리뷰 수정 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async (reviewNo) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`/ROOT/api/review/delete.json`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: { reviewNo },
            });

            if (response.data.status === 200) {
                setReviews(reviews.filter((review) => review.reviewNo !== reviewNo));
            } else {
                setErrorMessage("리뷰 삭제 실패");
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            setErrorMessage("리뷰 삭제 중 오류가 발생했습니다.");
        }
    };

    if (isLoading) {
        return <p className="loading">로딩 중...</p>;
    }

    return (
        <div className="review-container">
            <h1 className="review-title">내 리뷰</h1>
            {errorMessage && <p className="review-error-message">{errorMessage}</p>}
            {reviews.length === 0 ? (
                <p className="no-reviews">작성한 리뷰가 없습니다.</p>
            ) : (
                <ul className="review-list">
                    {reviews.map((review) => (
                        <li key={review.reviewNo} className="review-item">
                            <img
                                src={review.imageurl || "/static/img/default.png"}
                                alt="리뷰 이미지"
                                className="review-image"
                            />
                            <div className="review-details">
                                <p className="review-store">{review.storeName}</p>
                                <p className="review-date">{formatDate(review.regdate)}</p>
                                <p className="review-rating">평점: {review.rating}</p>
                                <p className="review-content">{review.content}</p>
                                <div className="review-actions">
                                    <button className="edit-button" onClick={() => handleUpdate(review)}>수정</button>
                                    <button className="delete-button" onClick={() => handleDelete(review.reviewNo)}>삭제</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {isEditing && (
                <div className="modal">
                    <div className="modal-overlay" onClick={() => setIsEditing(false)}></div>
                    <div className="modal-content">
                        <h2>리뷰 수정</h2>
                        <label>평점:</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={updatedRating}
                            onChange={(e) => setUpdatedRating(Number(e.target.value))}
                        />
                        <label>내용:</label>
                        <textarea
                            value={updatedContent}
                            onChange={(e) => setUpdatedContent(e.target.value)}
                        ></textarea>
                        <label>이미지:</label>
                        <input
                            type="file"
                            onChange={(e) => setUpdatedImage(e.target.files[0])}
                        />
                        <div>
                            <button className="save-button" onClick={handleSaveUpdate}>저장</button>
                            <button className="cancel-button" onClick={() => setIsEditing(false)}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReview;
