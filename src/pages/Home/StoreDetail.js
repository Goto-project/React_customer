import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../css/StoreDetail.css";

function StoreDetail() {
    const { storeid } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("menu");
    const [store, setStore] = useState(null);
    const [menus, setMenus] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchStoreDetail();
        fetchDailyMenus();
        fetchReviews();
    }, [storeid]);

    const fetchStoreDetail = async () => {
        try {
            const response = await axios.get(`/ROOT/api/store/detail/${storeid}`);
            if (response.data.status === 200) {
                setStore(response.data.result);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDailyMenus = async () => {
        try {
            const response = await axios.get(`/ROOT/api/menu/daily/list`, {
                params: { date: new Date().toISOString().slice(0, 10) },
            });
            if (response.data.status === 200) {
                setMenus(response.data.result);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/ROOT/api/store/reviews/${storeid}`);
            if (response.data.status === 200) {
                setReviews(response.data.result);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!store) {
        return <div>가게 정보를 불러오는 중...</div>;
    }

    return (
        <div className="store-detail-container">
            {/* 헤더 */}
            <header className="store-header">
            <h1 className="customer-logo">ECOEATS</h1>
                <button className="back-button" onClick={() => navigate("/pages/Home/CustomerHome")}>
                    🔙 홈으로 돌아가기
                </button>
            </header>

            {/* 가게 정보 섹션 */}
            <div className="store-info-container">
                <div className="store-image-wrapper">
                    <img
                        className="store-image"
                        src={`http://127.0.0.1:8080${store.imageurl}`}
                        alt={store.storeName}
                    />
                </div>
                <div className="store-info">
                    <h2>{store.storeName}</h2>
                    <p>{store.address}</p>
                    <p>📞 {store.phone}</p>
                    <p>⏰ {store.startPickup} ~ {store.endPickup}</p>
                    <p>⭐ {store.rating}</p>
                </div>
            </div>
            {/* 탭 버튼 */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === "menu" ? "active" : ""}`}
                    onClick={() => setActiveTab("menu")}
                >
                    메뉴보기
                </button>
                <button
                    className={`tab-button ${activeTab === "review" ? "active" : ""}`}
                    onClick={() => setActiveTab("review")}
                >
                    리뷰보기
                </button>
            </div>

            {/* 콘텐츠 */}
            <section className="tab-content">
                {activeTab === "menu" ? (
                    <div className="menu-list">
                        {menus.length > 0 ? (
                            menus.map((menu, index) => (
                                <div key={index} className="menu-item">
                                    <div className="menu-item-details">
                                        <img
                                            className="menu-image"
                                            src={`http://127.0.0.1:8080${menu.menuNo.imageurl}`}
                                            alt={menu.menuNo.name}
                                        />
                                        <div className="menu-info">
                                            <h4>{menu.menuNo.name}</h4>
                                            <p>{menu.price.toLocaleString()}원</p>
                                            <p>남은 수량: {menu.qty}개</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>오늘의 메뉴가 없습니다.</p>
                        )}
                    </div>
                ) : (
                    <div className="review-list">
                        {reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div key={index} className="review-item">
                                    <h4>{review.author}</h4>
                                    <p>{review.comment}</p>
                                    <span>⭐ {review.rating}</span>
                                </div>
                            ))
                        ) : (
                            <p>리뷰가 없습니다.</p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

export default StoreDetail;