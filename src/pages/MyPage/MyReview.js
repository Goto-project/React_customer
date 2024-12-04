import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../../css/MyReview.css';  // CSS 파일을 별도로 추가

const MyReview = () => {
    const [reviews, setReviews] = useState([]); // 리뷰 목록 상태
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태

    const [isEditing, setIsEditing] = useState(false); // 수정 상태
    const [currentReview, setCurrentReview] = useState(null); // 현재 수정 중인 리뷰
    const [updatedContent, setUpdatedContent] = useState(''); // 수정된 내용
    const [updatedRating, setUpdatedRating] = useState(0); // 수정된 평점
    const [updatedImage, setUpdatedImage] = useState(null); // 수정된 이미지 파일

    useEffect(() => {
        // 리뷰 목록을 가져오는 함수
        const fetchReviews = async () => {
            const token = localStorage.getItem('token');
            const customerEmail = localStorage.getItem('email');

            if (!token || !customerEmail) {
                setErrorMessage('로그인 정보가 유효하지 않습니다.');
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
                        return dateB - dateA; // 내림차순 정렬
                    });
                    setReviews(sortedReviews); // 리뷰 목록 업데이트
                } else {
                    setErrorMessage('리뷰를 불러오는 데 실패했습니다.');
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setErrorMessage('리뷰를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews(); // 컴포넌트가 마운트될 때 리뷰 목록을 가져옵니다.
    }, []); // 빈 배열을 의존성으로 주어 한 번만 실행되게 합니다.

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const isReviewEditable = (regdate) => {
        const reviewDate = new Date(regdate);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - reviewDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 밀리초를 일로 변환
        return diffDays <= 3; // 3일 이내면 수정 가능
    };

    const handleUpdate = (review) => {
        setCurrentReview(review); // 수정할 리뷰 저장
        setUpdatedContent(review.content); // 기존 리뷰 내용 설정
        setUpdatedRating(review.rating); // 기존 평점 설정
        // setUpdatedImage(null); // 기존 이미지는 비워둡니다.
        setIsEditing(true); // 수정 모달 열기
    };

    const handleSaveUpdate = async () => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem("email");

        const formData = new FormData();
        formData.append("review", new Blob([JSON.stringify({
            reviewNo: currentReview.reviewNo,
            content: updatedContent,
            rating: updatedRating,
            customerEmail: { customerEmail: email },
        })], { type: "application/json" }));

        if (updatedImage) {
            formData.append('image', updatedImage); // 수정된 이미지 파일 추가
        }

        try {
            const response = await axios.put(`/ROOT/api/review/update.json`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', // 파일을 포함한 요청
                },
            });

            if (response.data.status === 200) {
                // 리뷰 수정 후 목록 갱신
                const updatedReviews = reviews.map((review) =>
                    review.reviewNo === currentReview.reviewNo
                        ? { ...review, content: updatedContent, rating: updatedRating, image: updatedImage }
                        : review
                );
                setReviews(updatedReviews);
                setIsEditing(false); // 수정 모달 닫기
                setCurrentReview(null); // 수정 중인 리뷰 초기화
                setUpdatedContent(''); // 수정된 내용 초기화
                setUpdatedRating(0); // 수정된 평점 초기화
                // setUpdatedImage(null); // 이미지 초기화
            } else {
                setErrorMessage('리뷰 수정 실패');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            setErrorMessage('리뷰 수정 중 오류가 발생했습니다.');
        }
    };

    const handleCancelUpdate = () => {
        setIsEditing(false); // 수정 모달 닫기
        setCurrentReview(null); // 수정 중인 리뷰 초기화
        setUpdatedContent(''); // 수정된 내용 초기화
        setUpdatedRating(0); // 수정된 평점 초기화
        // setUpdatedImage(null); // 이미지 초기화
    };

    const handleDelete = async (reviewNo) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/ROOT/api/review/delete.json`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    reviewNo: reviewNo,
                },
            });
            if (response.data.status === 200) {
                setReviews(reviews.filter((review) => review.reviewNo !== reviewNo)); // 리뷰 삭제 후 목록 갱신
            } else {
                setErrorMessage('리뷰 삭제 실패');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            setErrorMessage('리뷰 삭제 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return <p className="loading">로딩 중...</p>;
    }

    return (
        <div className="review-container">
            <h1 className="review-title">내 리뷰</h1>
            {errorMessage && <p className="review-error-message">{errorMessage}</p>} {/* 오류 메시지 표시 */}

            {reviews.length === 0 ? (
                <p className="no-reviews">작성한 리뷰가 없습니다.</p>
            ) : (
                <ul className="review-list">
                    {reviews.map((review) => (
                        <li key={review.reviewNo}>
                            <p>평점: {review.rating}</p>
                            <p>내용: {review.content}</p>
                            <p>가게: {review.storeName}</p>
                            <p>작성일: {formatDate(review.regdate)}</p>
                            <p>
                                이미지:
                                {review.imageurl && (
                                    <img
                                        src={review.imageurl ? `/ROOT/api/review/image?no=${review.reviewNo}` : '/static/img/default.png'}
                                        alt="리뷰 이미지"
                                        style={{ width: '100px', height: '100px' }}
                                    />
                                )}
                            </p>
                            {isReviewEditable(review.regdate) && (
                                <button onClick={() => handleUpdate(review)}>수정</button>
                            )}
                            <button onClick={() => handleDelete(review.reviewNo)}>삭제</button>
                        </li>
                    ))}
                </ul>
            )}
            {/* 수정 모달 */}
            {isEditing && (
                <div className="modal">
                    <h2>리뷰 수정</h2>
                    <div>
                        <label>평점:</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={updatedRating}
                            onChange={(e) => setUpdatedRating(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>내용:</label>
                        <textarea
                            value={updatedContent}
                            onChange={(e) => setUpdatedContent(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>이미지:</label>
                        <input
                            type="file"
                            onChange={(e) => setUpdatedImage(e.target.files[0])}
                        />
                    </div>
                    <div>
                        <button onClick={handleSaveUpdate}>저장</button>
                        <button onClick={handleCancelUpdate}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReview;
