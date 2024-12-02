import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../css/StoreDetail.css";

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
    const [email, setEmail] = useState(""); // 로그인된 이메일 상태

    
    useEffect(() => {
        fetchStoreDetail();
        fetchDailyMenu(); // 첫 렌더링 시 데일리 메뉴도 불러옴
    }, [storeid]);

    const fetchStoreDetail = async () => {
        try {
            const response = await axios.get(`/ROOT/api/store/detail/${storeid}`);
            if (response.data.status === 200) {
                setStore(response.data.result);
            }
        } catch (error) {
            console.error(error);
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

    const handleAddToCart = (menuId, menuName, price, qty, selectedQty) => {
        // 선택된 수량만큼 장바구니에 추가
        const newItem = { menuId, menuName, price, selectedQty };
        setCart([...cart, newItem]);
    };

    if (!store) {
        return <div>가게 정보를 불러오는 중...</div>;
    }

    const handleAddBookmark = async () => {
        try {
            const token = localStorage.getItem("token"); // 사용자의 인증 토큰을 로컬 스토리지에서 가져옵니다.

            if (!token) {
                setErrorMessage("로그인이 필요합니다.");
                return;
            }

            const response = await axios.post(
                "/ROOT/api/bookmark/insert.json",
                {
                    store: {
                        storeId: storeid, // 가게 ID를 store 객체 안에 넣어 전달
                    },
                    customer: {
                        customerEmail: store.customerEmail, // 고객 이메일도 customer 객체로 묶어서 전달
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // 인증 헤더에 토큰 포함
                    },
                }
            );

            if (response.data.status === 200) {
                setErrorMessage("즐겨찾기에 추가되었습니다.");
            } else {
                setErrorMessage(response.data.result || "즐겨찾기 추가 실패.");
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
                        <div className="store-info">
                            <h2>{store.storeName}</h2>
                            <p>{store.address}</p>
                            <p>📞 {store.phone}</p>
                            <p>⏰ {store.startPickup} ~ {store.endPickup}</p>
                            <p>⭐ {store.rating}</p>

                            <button onClick={handleAddBookmark} className="add-bookmark-btn">
                                즐겨찾기 추가
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
                                                        const selectedQty = parseInt(
                                                            document.getElementById(`quantity-${menu.dailymenuNo}`).value
                                                        );
                                                        handleAddToCart(menu.dailymenuNo, menu.menuName, menu.menuDiscountedPrice, menu.menuQty, selectedQty);
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
                                {cart.map((item, index) => (
                                    <li key={index}>
                                        {item.menuName} - {item.selectedQty}개
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default StoreDetail;
