import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/CustomerHome.css';

const { kakao } = window;

function CustomerHome() {
    console.log(window)
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [stores, setStores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('distance');
    const mapContainer = useRef(null);

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

        // 가게 데이터 초기화 (더미 데이터)
        const dummyStores = Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            name: `가게 ${i + 1}`,
            address: `주소 ${i + 1}`,
            phone: `051-${i + 1}`,
            rating: (Math.random() * 5).toFixed(2),
            distance: Math.floor(Math.random() * 10), // 거리 임의 생성
            orders: Math.floor(Math.random() * 100), // 주문 수 임의 생성
        }));
        setStores(dummyStores);
    }, []);

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
                            <div key={store.id} className="store-card">
                                <h3>{store.name}</h3>
                                <p>{store.address}</p>
                                <p>☎ {store.phone}</p>
                                <p>⭐ {store.rating}</p>
                                <p>📍 {store.distance} km</p>
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
