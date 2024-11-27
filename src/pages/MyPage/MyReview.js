import axios from 'axios';
import React, { useEffect, useState } from 'react';

const MyReview = () => {
    const [reviews, setReviews] = useState([]); // 리뷰 목록 상태
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태

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
                const response = await axios.get(`/ROOT/api/review/selectall.json`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.status === 200) {
                    setReviews(response.data.list); // 리뷰 목록 업데이트
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
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줍니다.
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    if (isLoading) {
        return <p>로딩 중...</p>;
    }

    return (
        <div>
            <h1>내 리뷰</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* 오류 메시지 표시 */}

            {reviews.length === 0 ? (
                <p>작성한 리뷰가 없습니다.</p>
            ) : (
                <ul>
                    {reviews.map((review) => (
                        <li key={review.id}>
                            <p>내용:{review.content}</p>
                            <p>평점:{review.rating}</p>
                            <p>작성일: {formatDate(review.regdate)}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyReview;
