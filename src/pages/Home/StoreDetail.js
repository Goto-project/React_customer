import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../css/StoreDetail.css";
import ShowReceipt from './ShowReceipt';

// 모달 컴포넌트
const PaymentModal = ({ isOpen, onClose, handlePayment }) => {
    if (!isOpen) return null; // 모달이 닫혀있으면 아무것도 렌더링하지 않음

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>결제 방법 선택</h3>
                <button onClick={() => handlePayment(1)}>카카오페이</button>
                <button onClick={() => handlePayment(0)}>현장결제</button>
                <button className="close-button" onClick={onClose}>
                    닫기
                </button>
            </div>
        </div>
    );
};

function StoreDetail() {
    const { storeid } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("menu");
    const [store, setStore] = useState(null);
    const [dailyMenu, setDailyMenu] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentMenuPage, setCurrentMenuPage] = useState(1); // 메뉴 페이지 상태
    const [currentReviewPage, setCurrentReviewPage] = useState(1); // 리뷰 페이지 상태
    const [cart, setCart] = useState([]); // 장바구니 상태
    const [isBookmarked, setIsBookmarked] = useState(false); // 즐겨찾기 상태 추가
    // const [email, setEmail] = useState(""); // 로그인된 이메일 상태
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null); // 영수증 정보 상태

    useEffect(() => {
        fetchStoreDetail();
        fetchDailyMenu(); // 첫 렌더링 시 데일리 메뉴도 불러옴
        checkBookmarkStatus(); // 즐겨찾기 여부 확인
    }, [storeid]);

    useEffect(() => {
        // 세션 스토리지에서 장바구니를 불러오기
        const storedCart = JSON.parse(sessionStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, [storeid]);

    const checkBookmarkStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await axios.get(
                `/ROOT/api/bookmark/searchbookmark.json?storeId=${storeid}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setIsBookmarked(response.data.status === 200);
        } catch (error) {
            console.error("즐겨찾기 상태 확인 중 오류:", error);
        }
    };
    const fetchStoreDetail = async () => {
        try {
            const response = await axios.get(`/ROOT/api/store/detail/${storeid}`);
            if (response.data.status === 200) {
                setStore(response.data.result);
            }
        } catch (error) {
            setErrorMessage("가게 정보를 불러오는 데 실패했습니다.");
        }
    };

    const fetchDailyMenu = async () => {
        try {
            const date = new Date().toISOString().split('T')[0]; // 현재 날짜
            const response = await axios.get(`/ROOT/api/dailymenu/list`, {
                params: { date, storeId: storeid },
            });

            if (response.status === 200) {
                setDailyMenu(response.data); // 데이터를 상태에 저장
            } else {
                console.error("데일리 메뉴를 불러오지 못했습니다.");
            }
        } catch (error) {
            console.error("데일리 메뉴를 불러오는 데 실패했습니다.", error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/ROOT/api/selectall.json`, {
                params: { storeId: storeid },
            });
            if (response.status === 200) {
                setReviews(response.data.list); // 리뷰 목록 설정
            } else {
                setErrorMessage("리뷰를 불러오지 못했습니다.");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("리뷰를 불러오는 데 실패했습니다.");
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === "menu") fetchDailyMenu();
        if (tab === "reviews") fetchReviews();
    };

    // 메뉴 페이징: 한 페이지당 5개씩만 표시
    const menuPerPage = 5;
    const currentMenuItems = dailyMenu.slice(
        (currentMenuPage - 1) * menuPerPage,
        currentMenuPage * menuPerPage
    );

    // 리뷰 페이징: 한 페이지당 5개씩만 표시
    const reviewPerPage = 5;
    const currentReviewItems = reviews.slice(
        (currentReviewPage - 1) * reviewPerPage,
        currentReviewPage * reviewPerPage
    );

    const handleMenuPageChange = (direction) => {
        if (direction === "next" && currentMenuPage * menuPerPage < dailyMenu.length) {
            setCurrentMenuPage(currentMenuPage + 1);
        } else if (direction === "prev" && currentMenuPage > 1) {
            setCurrentMenuPage(currentMenuPage - 1);
        }
    };

    const handleReviewPageChange = (direction) => {
        if (direction === "next" && currentReviewPage * reviewPerPage < reviews.length) {
            setCurrentReviewPage(currentReviewPage + 1);
        } else if (direction === "prev" && currentReviewPage > 1) {
            setCurrentReviewPage(currentReviewPage - 1);
        }
    };

    // 장바구니 항목 추가
    const handleAddToCart = (menuId, menuName, price, selectedQty, menuQty) => {
        // 새로운 아이템
        const newItem = { menuId, menuName, price, selectedQty, menuQty };

        // 기존 장바구니에서 같은 메뉴가 있는지 확인
        const existingItem = cart.find(item => item.menuId === menuId);

        if (existingItem) {
            // 같은 메뉴가 있으면 수량만 업데이트
            const updatedCart = cart.map(item =>
                item.menuId === menuId
                    ? { ...item, selectedQty: selectedQty }  // 수량만 변경
                    : item
            );

            // 업데이트된 장바구니 배열을 세션에 저장
            sessionStorage.setItem("cart", JSON.stringify(updatedCart));
            setCart(updatedCart);
        } else {
            // 같은 메뉴가 없으면 새로운 항목을 추가
            const updatedCart = [...cart, newItem];

            // 업데이트된 장바구니 배열을 세션에 저장
            sessionStorage.setItem("cart", JSON.stringify(updatedCart));
            setCart(updatedCart);
        }
    };

    // 장바구니 수량 변경
    const handleQuantityChange = (menuId, newQty) => {
        // 최대 수량 제한
        const item = cart.find(item => item.menuId === menuId);
        if (!item) return;

        if (newQty < 1) return; // 수량이 1 미만이면 변경하지 않음
        if (newQty > item.menuQty) {
            alert(`최대 주문 가능 수량은 ${item.menuQty}개입니다.`);
            return;
        }

        const updatedCart = cart.map((item) => {
            if (item.menuId === menuId) {
                return { ...item, selectedQty: newQty };
            }
            return item;
        });

        setCart(updatedCart);
        // 세션에 저장
        sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const handleInputChange = (menuId, value) => {
        const newQty = parseInt(value, 10);

        if (isNaN(newQty) || newQty < 1) {
            alert("수량은 1 이상이어야 합니다.");
            return;
        }

        const updatedCart = cart.map((item) => {
            if (item.menuId === menuId) {
                if (newQty > item.menuQty) {
                    alert(`최대 주문 가능 수량은 ${item.menuQty}개입니다.`);
                    return item; // 변경 없이 그대로 반환
                }
                return { ...item, selectedQty: newQty };
            }
            return item;
        });

        setCart(updatedCart);
        // 세션에 저장
        sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // 장바구니 항목 삭제
    const handleRemoveFromCart = (menuId) => {
        const updatedCart = cart.filter(item => item.menuId !== menuId);

        // 세션에 저장할 때 동일한 키 사용
        sessionStorage.setItem("cart", JSON.stringify(updatedCart));
        setCart(updatedCart);  // 상태 업데이트
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("장바구니가 비어 있습니다. 상품을 추가해주세요!");
            return;
        }
        setIsModalOpen(true); // 모달 열기
    };

    const closeModal = () => {
        setIsModalOpen(false); // 모달 닫기
    };

    // 결제하기
    const handlePayment = async (method) => {
        setPaymentMethod(method); // 결제 방법을 상태에 저장
        const token = localStorage.getItem("token"); // 토큰 가져오기

        // 로그인되지 않았으면 로그인 페이지로 이동
        if (!token) {
            alert("로그인 후 결제 가능합니다. 로그인 페이지로 이동합니다.");
            navigate("/pages/Member/LoginHome"); // 로그인 페이지로 이동 (React Router 사용)
            return;
        }

        const orderRequest = {
            pay: method, // 전달받은 결제 방식
            cartRequests: cart.map(item => ({
                dailymenuNo: item.menuId,
                qty: item.selectedQty,
            })), // 장바구니에서 카트 항목을 가져와서 전달
        };

        // orderRequest를 sessionStorage에 저장
        sessionStorage.setItem("orderRequest", JSON.stringify(orderRequest));

        try {
            const response = await axios.post(
                `/ROOT/api/order/create`,
                orderRequest,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status === 200) {
                if (response.data.paymentUrl) {
                    window.location.href = response.data.paymentUrl; // 카카오페이 결제 페이지로 이동
                }
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    // const handlePaymentSuccess = async (orderNo, pgToken, orderRequest) => {
    //     try {
    //         const response = await axios.post(
    //             "http://localhost:8080/api/payments/kakaoPaySuccess",
    //             orderRequest,
    //             {
    //                 params: {
    //                     orderno: orderNo,
    //                     pgToken: pgToken,
    //                 },
    //             }
    //         );

    //         // 응답 내용 로그 출력
    //         console.log("카카오페이 결제 승인 응답:", response.data);

    //         if (response.data.status === 200) {
    //             alert("결제가 성공적으로 완료되었습니다.");
    //             const paymentDetails = response.data.paymentDetails;

    //             // 영수증 화면으로 이동
    //             navigate("/show-receipt", { state: { paymentDetails, orderNo, pgToken, } });
    //         } else {
    //             alert("결제 승인에 실패했습니다.");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         alert("서버 오류가 발생했습니다.");
    //     }
    // };

    // const handlePaymentCancel = async (orderNo) => {
    //     try {
    //         const response = await axios.post(
    //             "http://localhost:8080/api/payments/kakaoPayCancel",
    //             null, // URL 파라미터로 전달
    //             { params: { orderno: orderNo } }
    //         );

    //         if (response.data.status === 400) {
    //             // 결제 취소 처리: 사용자에게 알림
    //             alert("결제가 취소되었습니다.");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         alert("서버 오류가 발생했습니다.");
    //     }
    // };

    // const handlePaymentFail = async (orderNo) => {
    //     try {
    //         const response = await axios.post(
    //             "http://localhost:8080/api/payments/kakaoPayFail",
    //             null, // URL 파라미터로 전달
    //             { params: { orderno: orderNo } }
    //         );

    //         if (response.data.status === 400) {
    //             // 결제 실패 처리: 사용자에게 알림
    //             alert("결제에 실패했습니다.");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         alert("서버 오류가 발생했습니다.");
    //     }
    // };
    if (!store) {
        return <div>가게 정보를 불러오는 중...</div>;
    }

    const handleAddBookmark = async () => {
        try {
            const token = localStorage.getItem("token"); // 사용자의 인증 토큰을 로컬 스토리지에서 가져옵니다.
            const email = localStorage.getItem("email");
            if (!token) {
                setErrorMessage("로그인이 필요합니다.");
                return;
            }

            if (isBookmarked) {
                // 즐겨찾기 취소
                const response = await axios.delete("/ROOT/api/bookmark/delete.json", {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { storeId: storeid },
                });

                if (response.data.status === 200) {
                    alert("즐겨찾기에서 삭제되었습니다.");
                    setIsBookmarked(false);
                } else {
                    setErrorMessage(response.data.result || "즐겨찾기 취소 실패.");
                }
            } else {
                // 즐겨찾기 추가
                const response = await axios.post(
                    "/ROOT/api/bookmark/insert.json",
                    {
                        customerEmail: { customerEmail: email },
                        storeId: { storeId: storeid },
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (response.data.status === 200) {
                    alert("즐겨찾기에 추가되었습니다.");
                    setIsBookmarked(true);
                } else {
                    setErrorMessage(response.data.result || "즐겨찾기 추가 실패.");
                }
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("즐겨찾기 추가 중 오류가 발생했습니다.");
        }
    };


    return (
        <div>
            <header className="store-header">
                <h1 className="customer-logo">ECOEATS</h1>
                <button className="back-button" onClick={() => navigate("/pages/Home/CustomerHome")}>
                    홈으로 돌아가기
                </button>
            </header>

            <div className="store-detail-container">
                <div className="store-left">
                    <div className="store-info-container">
                        <div className="store-image-wrapper">
                            <img className="store-image" src={`http://127.0.0.1:8080${store.imageurl}`} alt={store.storeName} />
                        </div>
                        <div className="detail-store-info">
                            <h2>{store.storeName}</h2>
                            <p>{store.address}</p>
                            <p>📞 {store.phone}</p>
                            <p>⏰ {store.startPickup} ~ {store.endPickup}</p>
                            <p>⭐ {store.rating}</p>

                            <button
                                onClick={handleAddBookmark}
                                className={`add-bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
                            >
                                {isBookmarked ? "★" : "☆"}
                            </button>
                        </div>
                    </div>

                    <div className="tabs-container">
                        <button
                            className={`tab-button ${activeTab === "menu" ? "active" : ""}`}
                            onClick={() => handleTabClick("menu")}
                        >
                            데일리 메뉴
                        </button>
                        <button
                            className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
                            onClick={() => handleTabClick("reviews")}
                        >
                            리뷰
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === "menu" && (
                            <div className="daily-menu">
                                {dailyMenu.length === 0 ? (
                                    <div className="no-menu-message">
                                        <img
                                            src="/img/sorry.png"
                                            alt="아이콘"
                                            className="no-menu-icon"
                                        />
                                        <p>아직 오늘의 메뉴가 추가되지 않았어요</p>
                                    </div>
                                ) : (
                                    currentMenuItems.map((menu) => (
                                        <div key={menu.dailymenuNo} className="menu-item">
                                            <img
                                                src={`http://127.0.0.1:8080${menu.menuImageUrl}`}
                                                alt={menu.menuName}
                                                className="menu-image"
                                            />
                                            <div className="menu-info">
                                                <h3>{menu.menuName}</h3>
                                                <p>가격: {menu.menuPrice}원</p>
                                                <p>할인가: {menu.menuDiscountedPrice}원</p>
                                                <p>수량: {menu.menuQty}</p>
                                            </div>

                                            {/* 수량 선택과 장바구니 추가 버튼 */}
                                            <div className="quantity-container">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={menu.menuQty}
                                                    defaultValue="1"
                                                    id={`quantity-${menu.dailymenuNo}`}
                                                    className="quantity-input"
                                                />
                                                <button
                                                    className="add-to-cart-btn"
                                                    onClick={() => {
                                                        // 입력된 수량 값 가져오기
                                                        const inputField = document.getElementById(`quantity-${menu.dailymenuNo}`);
                                                        const selectedQty = parseInt(inputField.value, 10);

                                                        // 입력값이 유효한지 확인 (0보다 커야 하고, 최대 메뉴 수량을 초과하지 않아야 함)
                                                        if (selectedQty > 0 && selectedQty <= menu.menuQty) {
                                                            handleAddToCart(menu.dailymenuNo, menu.menuName, menu.menuDiscountedPrice, selectedQty, menu.menuQty);
                                                        } else {
                                                            alert(`수량은 1에서 ${menu.menuQty} 사이의 값이어야 합니다.`);
                                                        }
                                                    }}
                                                >
                                                    장바구니에 추가
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div className="pagination">
                                    <button
                                        className="dailypaginationbtn"
                                        onClick={() => handleMenuPageChange("prev")}
                                        disabled={currentMenuPage === 1}
                                    >
                                        이전
                                    </button>
                                    <span>{currentMenuPage} 페이지</span>
                                    <button
                                        className="dailypaginationbtn"
                                        onClick={() => handleMenuPageChange("next")}
                                        disabled={currentMenuPage * menuPerPage >= dailyMenu.length}
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="reviews">
                                {reviews.length === 0 ? (
                                    <div className="no-reviews-message">
                                        <img
                                            src="/img/sorry.png"
                                            alt="아이콘"
                                            className="no-reviews-icon"
                                        />
                                        <p>아직 작성된 리뷰가 없어요</p>
                                    </div>
                                ) : (
                                    currentReviewItems.map((review) => (
                                        <div key={review.reviewId} className="review-item">
                                            <p>{review.content}</p>
                                            <p>작성자: {review.userName}</p>
                                        </div>
                                    ))
                                )}
                                <div className="pagination">
                                    <button
                                        className="dailypaginationbtn"
                                        onClick={() => handleReviewPageChange("prev")}
                                        disabled={currentReviewPage === 1}
                                    >
                                        이전
                                    </button>
                                    <span>{currentReviewPage} 페이지</span>
                                    <button
                                        className="dailypaginationbtn"
                                        onClick={() => handleReviewPageChange("next")}
                                        disabled={currentReviewPage * reviewPerPage >= reviews.length}
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="store-right">
                    <div className="cart-summary">
                        <div className="cartinfo">
                            <h3>장바구니</h3>
                            <ul>
                                {cart.map((item) => (
                                    <li key={item.menuId}>
                                        <div className="cart-item">
                                            <span>{item.menuName}</span>
                                            <div className="quantity-controls">
                                                <button
                                                    onClick={() => handleQuantityChange(item.menuId, item.selectedQty - 1)}
                                                    disabled={item.selectedQty <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.selectedQty}
                                                    onChange={(e) => handleInputChange(item.menuId, e.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(item.menuId, item.selectedQty + 1)}
                                                    disabled={item.selectedQty >= item.menuQty} // 최대 수량 제한
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button onClick={() => handleRemoveFromCart(item.menuId)}>삭제</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="checkout-container">
                            {/* 결제하기 버튼 */}
                            <button
                                className="checkout-button"
                                onClick={handleCheckout}
                            >
                                결제하기
                            </button>
                        </div>

                    </div>

                    {/* 모달 컴포넌트 */}
                    <PaymentModal isOpen={isModalOpen} onClose={closeModal} handlePayment={handlePayment} />
                </div>
            </div>
        </div>
    );
}

export default StoreDetail;