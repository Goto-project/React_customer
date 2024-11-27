import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/CustomerHome.css';

const { kakao } = window;

function CustomerHome() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [stores, setStores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('distance');
    const mapContainer = useRef(null);
    

    // 전체 가게 리스트 API 호출
    const fetchStores = async (page = 1) => {
        try {
            const response = await axios.get(`/ROOT/api/store/list`, { params: { page } });
            if (response.data.status === 200) {
                setStores(response.data.result); // 데이터 저장
            } else {
                console.error('Failed to fetch store list:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching store list:', error);
        }
    };

    useEffect(() => {

        kakao.maps.load(() => {
            var container = document.getElementById('map');
            var options = {
                center: new kakao.maps.LatLng(33.450701, 126.570667),
                level: 3
            };
            var map = new kakao.maps.Map(container, options);

            // 마커가 표시될 위치입니다 
            var markerPosition = new kakao.maps.LatLng(33.450701, 126.570667);

            // 마커를 생성합니다
            var marker = new kakao.maps.Marker({
                position: markerPosition
            });

            // 마커가 지도 위에 표시되도록 설정합니다
            marker.setMap(map);
        })

        console.log(kakao)

        const token = localStorage.getItem('token');
        const savedEmail = localStorage.getItem('email');
        if (token && savedEmail) {
            setIsLoggedIn(true);
            setEmail(savedEmail);
        }


        // 가게 리스트 초기화
        fetchStores(currentPage);
    }, [currentPage]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setIsLoggedIn(false);
        setEmail('');
        navigate('/');
    };

    const handleMyPage = () => {
        if (email) {
            navigate(`/pages/Member/MyPage/${email}`);
        } else {
            navigate('/pages/Member/LoginHome');
        }
    };

    const handleSortChange = (option) => {
        setSortOption(option);
        const sortedStores = [...stores];
        if (option === 'distance') {
            sortedStores.sort((a, b) => a.distance - b.distance);
        } else if (option === 'orders') {
            sortedStores.sort((a, b) => b.orders - a.orders);
        } else if (option === 'rating') {
            sortedStores.sort((a, b) => b.rating - a.rating);
        }
        setStores(sortedStores);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const storesPerPage = 6;
    const displayedStores = stores.slice(
        (currentPage - 1) * storesPerPage,
        currentPage * storesPerPage
    );

    return (
        <div className="customer-home">
            <header className="customer-header">
                <h1 className="customer-logo">ECOEATS</h1>
                <div className="header-buttons">
                    {isLoggedIn ? (
                        <>
                            <button onClick={handleMyPage}>My Page</button>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/pages/Member/LoginHome')}>Login</button>
                            <button onClick={() => navigate('/pages/Member/SignupPage')}>Sign Up</button>
                        </>
                    )}
                </div>
            </header>

            <main className="content">
                <section className="map-section">
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="현재 주소를 입력하세요."
                            className="address-input"
                        />
                        <button className="find-address-button">주소 찾기</button>
                    </div>
                    <div className="map-container" id="map" ref={mapContainer}></div> {/* 지도 표시 */}
                </section>

                <section className="store-list">
                    <div className="sort-options">
                        <button onClick={() => handleSortChange('distance')}>가까운순</button>
                        <button onClick={() => handleSortChange('orders')}>주문 많은 순</button>
                        <button onClick={() => handleSortChange('rating')}>리뷰 순</button>
                    </div>
                    <div className="stores">
                        {displayedStores.map((store) => (
                            <div key={store.storeid} className="store-card">
                                <img src={`http://127.0.0.1:8080${store.imageurl}`} alt={store.storeName} />
                                <h3>{store.storeName}</h3>
                                <p>주소 : {store.address}</p>
                                <p>☎ {store.phone}</p>
                                <p>카테고리 : {store.category}</p>
                                <p>픽업 시간 : {store.startPickup} ~ {store.endPickup}</p>
                                <p>⭐ {store.avgrating}</p>
                                <p>북마크 : {store.bookmarkcount}</p>
                                <p>리뷰수 : {store.reviewcount}</p>
                            </div>
                        ))}
                    </div>
                    <div className="pagination">
                        {Array.from({ length: Math.ceil(stores.length / storesPerPage) }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={currentPage === i + 1 ? 'active' : ''}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}


export default CustomerHome;
