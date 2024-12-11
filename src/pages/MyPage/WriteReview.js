import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import '../../css/WriteReview.css';

const WriteReview = () => {
    const { orderNumber, storeid } = useParams();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError(null);
            setSuccess(null);
            const email = localStorage.getItem("email");

            const formData = new FormData();
            formData.append(
                "review",
                new Blob(
                    [
                        JSON.stringify({
                            rating,
                            content,
                            orderno: { orderno: orderNumber },
                            customerEmail: { customerEmail: email },
                            storeId: { storeId: storeid },
                        }),
                    ],
                    { type: "application/json" }
                )
            );

            if (image) {
                formData.append("image", image);
            }

            const token = localStorage.getItem("token");
            const response = await axios.post("/ROOT/api/review/insert.json", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status === 200) {
                setSuccess("리뷰가 성공적으로 작성되었습니다.");
                navigate('/pages/Member/MyPage', { state: { email: email }}); 
            } else {
                setError(response.data.result || "리뷰 작성 중 오류가 발생했습니다.");
            }
        } catch (err) {
            setError("리뷰 작성 중 문제가 발생했습니다.");
            console.error(err);
        }
    };

    return (
        <div className="review-home">
            <h1>리뷰 작성</h1>
            <div className="write-review-container">
                <p>주문 번호: {orderNumber}</p>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form className="review-label" onSubmit={handleSubmit}>
                    <label>
                        평점
                        <input
                            type="number"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            min="0"
                            max="5"
                            className="rating-input"
                        />
                    </label>
                    <label>
                        리뷰 내용
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="review-textarea"
                            placeholder="리뷰 내용을 입력하세요."
                        />
                    </label>
                    <label>
                        이미지 업로드
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="image-upload"
                        />
                    </label>
                    <button type="submit" className="submit-button">
                        리뷰 작성
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WriteReview;
