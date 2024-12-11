import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const WriteReview = () => {
    const { orderNumber, storeid } = useParams(); // URL 파라미터로 전달된 ordernumber 가져오기
    const navigate = useNavigate();

    const [rating, setRating] = useState(0); // 평점
    const [content, setContent] = useState(""); // 리뷰 내용
    const [image, setImage] = useState(null); // 업로드 이미지
    const [error, setError] = useState(null); // 에러 메시지
    const [success, setSuccess] = useState(null); // 성공 메시지
    console.log("storeid", storeid); 

    // 리뷰 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError(null);
            setSuccess(null);
            const email = localStorage.getItem("email");

            const formData = new FormData();

            formData.append("review",
                new Blob([JSON.stringify({
                    rating: rating,
                    content: content,
                    orderno: { orderno: orderNumber },  // URL 파라미터에서 가져온 주문 번호 사용
                    customerEmail: { customerEmail: email },
                    storeId: {storeId: storeid }, // 로컬스토리지에서 가져온 이메일
                })], {
                    type: "application/json"
                })
            );
            console.log("Store ID being sent:", storeid);
            console.log("FormData 내용:", Object.fromEntries(formData.entries()));

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

    // UI 렌더링
    return (
        <div>
            <h1>리뷰 작성</h1>
            <p>주문 번호: {orderNumber}</p>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        평점:
                        <input
                            type="number"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            min="0"
                            max="5"
                        />
                    </label>
                </div>
                <div>
                    <label>
                        리뷰 내용:
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        이미지 업로드:
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </label>
                </div>
                <button type="submit">리뷰 작성</button>
            </form>
        </div>
    );
};

export default WriteReview;

// export default WriteReview;
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// const ReviewPage = () => {
//     const { orderNo } = useParams(); // 주문 번호로 리뷰 페이지로 접근
//     const navigate = useNavigate();

//     const [review, setReview] = useState({ rating: 0, content: "", image: null });
//     const [reviewId, setReviewId] = useState(null);
//     const [isEditing, setIsEditing] = useState(false);
//     const [error, setError] = useState(null);

//     // 리뷰 작성 요청
//     const handleReviewSubmit = async (e) => {
//         e.preventDefault();
//         const formData = new FormData();
//         formData.append("review", JSON.stringify({ ...review, reviewNo: reviewId }));
//         if (review.image) {
//             formData.append("image", review.image);
//         }

//         try {
//             const token = localStorage.getItem("email");
//             const response = isEditing
//                 ? await axios.put(`/ROOT/api/review/update.json?reviewNo=${reviewId}`, formData)
//                 : await axios.post("/ROOT/api/review/insert.json", formData);

//             if (response.data.status === 200) {
//                 alert("리뷰가 성공적으로 " + (isEditing ? "수정" : "작성") + "되었습니다.");
//                 navigate.push("/myorders");
//             } else {
//                 setError(response.data.result || "문제가 발생했습니다.");
//             }
//         } catch (err) {
//             setError("리뷰 처리 중 오류가 발생했습니다.");
//         }
//     };

//     // 리뷰 삭제 요청
//     const handleDeleteReview = async () => {
//         if (window.confirm("리뷰를 삭제하시겠습니까?")) {
//             try {
//                 const response = await axios.delete("/ROOT/api/review/delete.json", {
//                     data: { reviewNo: reviewId },
//                 });
//                 if (response.data.status === 200) {
//                     alert("리뷰가 삭제되었습니다.");
//                     navigate("/myorders");
//                 } else {
//                     setError(response.data.result || "삭제 중 문제가 발생했습니다.");
//                 }
//             } catch (err) {
//                 setError("리뷰 삭제 중 오류가 발생했습니다.");
//             }
//         }
//     };

//     // 리뷰 데이터 로딩
//     useEffect(() => {
//         const fetchReview = async () => {
//             try {
//                 const response = await axios.get(`/ROOT/api/review/${orderNo}`);
//                 if (response.data.status === 200) {
//                     setReview(response.data.review);
//                     setReviewId(response.data.review.reviewNo);
//                     setIsEditing(true);
//                 } else {
//                     setReview({ rating: 0, content: "", image: null });
//                     setIsEditing(false);
//                 }
//             } catch (err) {
//                 setError("리뷰를 불러오는 중 오류가 발생했습니다.");
//             }
//         };

//         fetchReview();
//     }, [orderNo]);

//     return (
//         <div>
//             <h1>{isEditing ? "리뷰 수정" : "리뷰 작성"}</h1>

//             {error && <p style={{ color: "red" }}>{error}</p>}

//             <form onSubmit={handleReviewSubmit}>
//                 <div>
//                     <label>
//                         평점:
//                         <select
//                             value={review.rating}
//                             onChange={(e) => setReview({ ...review, rating: e.target.value })}
//                         >
//                             <option value={0}>선택</option>
//                             <option value={1}>1</option>
//                             <option value={2}>2</option>
//                             <option value={3}>3</option>
//                             <option value={4}>4</option>
//                             <option value={5}>5</option>
//                         </select>
//                     </label>
//                 </div>

//                 <div>
//                     <label>
//                         내용:
//                         <textarea
//                             value={review.content}
//                             onChange={(e) => setReview({ ...review, content: e.target.value })}
//                         />
//                     </label>
//                 </div>

//                 <div>
//                     <label>
//                         이미지:
//                         <input
//                             type="file"
//                             onChange={(e) => setReview({ ...review, image: e.target.files[0] })}
//                         />
//                     </label>
//                 </div>

//                 <button type="submit">{isEditing ? "수정" : "작성"} 완료</button>
//             </form>

//             {isEditing && (
//                 <button onClick={handleDeleteReview} style={{ color: "red" }}>
//                     리뷰 삭제
//                 </button>
//             )}
//         </div>
//     );
// };

// export default ReviewPage;
