import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/CustomerHome.css';
import '../../css/Suggestion.css';

const { kakao } = window;

function CustomerHome() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [stores, setStores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [places, setPlaces] = useState([]); // 장소 검색 결과 상태
    const [selectedPlace, setSelectedPlace] = useState(null); // 선택된 장소
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [sortOption, setSortOption] = useState('distance');
    const [suggestions, setSuggestions] = useState([]); // 검색어 추천 상태
    const [location, setLocation] = useState({ lat: null, lon: null }); // 사용자 위치 상태

    const API_KEY = '5b0886d4afea2f236cbff25dabce17ab'; // 환경 변수 또는 설정 파일에서 가져오는 방식으로 변경해야 함.

    // 가게 리스트 API 호출
    const fetchStores = async (page = 1) => {
        const { lat, lon } = location; // 현재 위치(또는 선택된 주소)의 위도, 경도
        if (!lat || !lon) {
            // 위치 정보가 없을 경우 주소 등록 유도 API 호출
            try {
                const response = await axios.get(`/ROOT/api/store/list`, { params: { page } });
                if (response.data.status === 200) {
                    setStores(response.data.result);
                } else {
                    console.error('Failed to fetch store list:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching store list:', error);
            }
            return;
        }

        try {
            // 주소가 등록된 경우, 등록된 위치를 기준으로 가게 리스트 요청
            const response = await axios.get(`/ROOT/api/store/list1`, {
                params: {
                    customerLatitude: lat,
                    customerLongitude: lon,
                    sortBy: sortOption, // 예: 거리 기준으로 정렬
                }
            });

            if (response.data.status === 200) {
                setStores(response.data.result);
            } else {
                console.error('Failed to fetch store list:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching store list:', error);
        }
    };

    // 지도 초기화
    const initializeMap = () => {
        const container = mapRef.current;
        const options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667),
            level: 3,
        };
        mapInstance.current = new kakao.maps.Map(container, options);
    };


    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const lat = position.coords.latitude; // 위도
                    const lon = position.coords.longitude; // 경도
                    setLocation({ lat, lon });
                    console.log(lat, lon);

                    // 사용자의 위치로 지도 초기화
                    const map = mapInstance.current;
                    const locPosition = new kakao.maps.LatLng(lat, lon);
                    map.setCenter(locPosition); // 지도 중심을 사용자 위치로 설정

                    // 사용자의 위치에 마커 추가
                    const marker = new kakao.maps.Marker({
                        position: locPosition, // 마커 위치
                        title: "내 위치", // 마커 타이틀
                    });
                    marker.setMap(map); // 지도에 마커 추가
                },
                function (error) {
                    // 위치 정보를 가져올 수 없을 때
                    console.error('위치 정보를 가져오지 못했습니다.', error);
                }
            );
        } else {
            alert("현재 브라우저에서는 위치 정보를 제공하지 않습니다.");
        }
    };

    useEffect(() => {
        kakao.maps.load(() => {
            initializeMap();
            getLocation(); // 사용자 위치로 지도 초기화
        });

        const token = localStorage.getItem('token');
        const savedEmail = localStorage.getItem('email');
        if (token && savedEmail) {
            setIsLoggedIn(true);
            setEmail(savedEmail);
        }

        fetchStores(currentPage);
    }, []);

    // 토큰 만료 확인 함수
    const checkTokenValidity = () => {
        const token = localStorage.getItem('token'); // 토큰 가져오기
        if (!token) {
            setIsLoggedIn(false); // 토큰이 없으면 로그아웃 상태로 변경
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1])); // JWT 디코딩
            const isExpired = payload.exp * 1000 < Date.now(); // 만료 시간 확인
            if (isExpired) {
                handleLogout(); // 만료 시 로그아웃
            } else {
                setIsLoggedIn(true); // 유효하면 로그인 상태 유지
            }
        } catch (err) {
            console.error('토큰 파싱 에러:', err);
            handleLogout();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setIsLoggedIn(false);
        setEmail('');
        navigate('/pages/Home/Customerhome');
    };

    useEffect(() => {
        checkTokenValidity();
        const interval = setInterval(checkTokenValidity, 60000); // 1분마다 토큰 유효성 확인
        return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
    }, []);

    const handleMyPage = () => {
        if (email) {
            navigate(`/pages/Member/MyPage/${email}`);
        } else {
            navigate('/pages/Member/LoginHome');
        }
    };

    const handleSortChange = async (option) => {
        setSortOption(option);
        const { lat, lon } = location; // 사용자 위치 정보
        if (!lat || !lon) {
            alert("위치 정보를 가져오지 못했습니다.");
            return;
        }

        try {
            const response = await axios.get('/ROOT/api/store/list1', {
                params: {
                    customerLatitude: lat,
                    customerLongitude: lon,
                    // category: '', // 카테고리 선택 시, 이 값을 설정할 수 있습니다.
                    sortBy: option,
                }
            });

            console.log("요청 파라미터:", {
                customerLatitude: lat,
                customerLongitude: lon,
                category: '',
                sortBy: option,
            });
            if (response.data.status === 200) {
                console.log("응답 데이터:", response.data.result);
                if (response.data.result && response.data.result.length > 0) {
                    setStores(response.data.result); // 새로운 가게 목록을 상태에 설정
                } else {
                    console.warn("가게 데이터가 비어있습니다.");
                    setStores([]); // 빈 데이터일 경우 빈 배열 설정
                }
            } else {
                console.error('가게 목록 가져오기 실패:', response.data.message);
            }
        } catch (error) {
            console.error('API 호출 오류:', error);
        }
    };

    const handleStoreClick = (storeId) => {
        navigate(`/store/detail/${storeId}`);
    };

    // 장소 검색 함수
    const handleAddressSearch = async () => {
        const addressInput = document.querySelector('.address-input').value;
        if (!addressInput.trim()) {
            alert('주소를 입력해주세요.');
            return;
        }
        const { lat, lon } = location;
        if (!lat || !lon) {
            alert('위치 정보를 가져오지 못했습니다.');
            return;
        }
        console.log(location);
        try {
            // 카카오 주소 검색 REST API 호출
            const addressResponse = await axios.get(`https://dapi.kakao.com/v2/local/search/address.json`,
                {
                    params: {
                        query: addressInput,
                        x: lon,
                        y: lat,
                        // radius: 5000, // 5km 내에서 검색
                    },
                    headers: {
                        Authorization: `KakaoAK ${API_KEY}`,
                        "Content-Type": `application/json;charset=UTF-8`
                    },
                }
            );
            // keyword.json 호출 (키워드 검색)
            const keywordResponse = await axios.get(`https://dapi.kakao.com/v2/local/search/keyword.json`, {
                params: {
                    query: addressInput,
                    x: lon,
                    y: lat,
                    // radius: 5000, // 5km 반경 내 검색
                },
                headers: {
                    Authorization: `KakaoAK ${API_KEY}`,
                    "Content-Type": `application/json;charset=UTF-8`,
                },
            });

            // 검색 결과 병합
            const combinedResults = [
                ...addressResponse.data.documents,
                ...keywordResponse.data.documents,
            ];

            if (combinedResults.length > 0) {
                setPlaces(combinedResults);  // 검색된 장소 결과 저장

                // 지도 초기화 및 마커 생성
                const map = mapInstance.current;
                map.setCenter(new kakao.maps.LatLng(combinedResults[0].y, combinedResults[0].x)); // 지도 중심 이동

                // 마커 배열을 저장할 변수
                const markers = [];

                // 검색된 장소를 지도에 마커로 표시
                combinedResults.forEach(place => {
                    const { x, y, place_name, address_name, phone, category_group_name } = place;

                    const marker = new kakao.maps.Marker({
                        position: new kakao.maps.LatLng(y, x),
                        title: place_name,
                    });

                    marker.setMap(map); // 지도에 마커 추가

                    // InfoWindow 생성
                    const infoWindow = new kakao.maps.InfoWindow({
                        content: `
                            <div>
                                <strong>${place_name}</strong><br />
                                주소: ${address_name}<br />
                                전화: ${phone || '정보 없음'}<br />
                                카테고리: ${category_group_name || '정보 없음'}
                                <button class="select-place-button">이 주소 등록</button>
                            </div>
                        `,
                    });

                    // 상태 변수로 InfoWindow의 열림 여부 추적
                    let isOpen = false;

                    // 마커 클릭 이벤트
                    kakao.maps.event.addListener(marker, 'click', function () {
                        if (isOpen) {
                            infoWindow.close();
                        } else {
                            infoWindow.open(map, marker);

                            // "이 주소 등록" 버튼 이벤트 연결
                            setTimeout(() => {
                                const selectButton = document.querySelector('.select-place-button');
                                if (selectButton) {
                                    selectButton.addEventListener('click', () => {
                                        handlePlaceSelect(place); // React 함수 호출
                                    });
                                }
                            }, 0); // Ensure DOM is updated before adding the event listener
                        }
                        isOpen = !isOpen;
                    });


                    // // InfoWindow 버튼 클릭 이벤트(북마커 상세정보 클릭시 가게 상세정보로 들어가짐)
                    // kakao.maps.event.addListener(marker, 'click', function () {
                    //     setTimeout(() => {
                    //         const detailButton = document.getElementById(`detail-${id}`);
                    //         if (detailButton) {
                    //             detailButton.addEventListener('click', () => {
                    //                 navigate(`/store/detail/${id}`);
                    //             });
                    //         }
                    //     }, 0); // Ensure the DOM is updated before adding the event listener
                    // });

                    markers.push(marker);
                });

            } else {
                alert('검색 결과가 없습니다.');
            }
        } catch (error) {
            console.error('주소 검색 오류:', error);
            alert('주소 검색에 실패했습니다.');
        }
    };

    // 장소 선택 시 지도 이동 및 서버에 주소 저장
    const handlePlaceSelect = async (place) => {
        const { x, y, place_name, address_name, phone, category_group_name, road_address } = place;
        const postcode = road_address?.zone_no || '우편번호 없음';
        const fullAddress = place.address_name;

        // 주소 선택 후 상세 주소 입력 모달 띄우기
        const addressDetailsModal = document.getElementById('addressDetailsModal');
        const detailedAddressInput = document.getElementById('detailedAddressInput');
        const submitDetailedAddressBtn = document.getElementById('submitDetailedAddressBtn');
        const cancelDetailedAddressBtn = document.getElementById('cancelDetailedAddressBtn');

        addressDetailsModal.style.display = 'flex'; // 상세 주소 입력 모달 표시

        cancelDetailedAddressBtn.onclick = () => {
            addressDetailsModal.style.display = 'none'; // 모달 숨기기
        };

        return new Promise((resolve) => {
            submitDetailedAddressBtn.onclick = () => {
                // 상세 주소를 입력하지 않아도 진행할 수 있도록 처리
                const detailedAddress = detailedAddressInput.value.trim() || '상세 정보 없음';
                addressDetailsModal.style.display = 'none'; // 상세 주소 모달 숨기기

                const completeAddress = `${fullAddress} ${detailedAddress}`;

                // 주소 등록 확인 모달 띄우기
                const confirmationModal = document.getElementById('confirmationModal');
                const confirmBtn = document.getElementById('confirmBtn');
                const cancelBtn = document.getElementById('cancelBtn');
                confirmationModal.style.display = 'flex'; // 확인 모달 표시

                cancelBtn.onclick = () => {
                    confirmationModal.style.display = 'none'; // 모달 숨기기
                    resolve(false); // 취소된 경우 반환
                };

                confirmBtn.onclick = async () => {
                    confirmationModal.style.display = 'none'; // 확인 모달 숨기기
                    resolve({ isConfirmed: true, completeAddress }); // 확인된 경우 반환
                };
            };
        }).then(async ({ isConfirmed, completeAddress }) => {
            if (!isConfirmed) {
                return; // 취소된 경우 함수 종료
            }

            const customerEmail = localStorage.getItem('email');
            if (!customerEmail) {
                alert('로그인 정보가 필요합니다.');
                return;
            }

            // 주소를 선택하면 location 상태를 갱신
            setLocation({ lat: y, lon: x });
            const map = mapInstance.current;
            const newCenter = new kakao.maps.LatLng(y, x);
            map.setCenter(newCenter);

            if (window.marker) {
                window.marker.setMap(null);
            }

            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(y, x),
            });
            marker.setMap(map);

            window.marker = marker;

            setSelectedPlace({
                placeName: place_name,
                address: address_name,
                phone: phone || '전화번호 정보 없음',
                category: category_group_name || '카테고리 정보 없음',
            });

            try {
                const response = await axios.post(
                    '/ROOT/api/customerAddress/add.json',
                    {
                        postcode,
                        address: address_name,
                        addressdetail: completeAddress,
                        customeremail: {
                            customerEmail: customerEmail,
                        },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.data.status === 200) {
                    alert('주소가 성공적으로 추가되었습니다.');
                } else {
                    alert(`주소 추가 실패: ${response.data.error || '알 수 없는 오류'}`);
                }
            } catch (error) {
                console.error('주소 추가 중 오류 발생:', error);
                alert('서버에 주소를 저장하는 중 오류가 발생했습니다.');
            }

            setSuggestions([]); // 추천 결과 초기화
        });
    };



    const storesPerPage = 6;
    const displayedStores = stores.slice(
        (currentPage - 1) * storesPerPage,
        currentPage * storesPerPage
    );

    // 검색어 추천 함수
    const handleAddressInputChange = async (e) => {
        const query = e.target.value;
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        const { lat, lon } = location;
        if (!lat || !lon) {
            alert("위치 정보를 가져오지 못했습니다.");
            return;
        }

        try {
            // 카카오 주소 검색 REST API 호출
            const addressResponse = await axios.get(`https://dapi.kakao.com/v2/local/search/address.json`, {
                params: {
                    query,         // 검색어
                    x: lon,        // 경도
                    y: lat,        // 위도
                    // radius: 5000,  // 5km 반경 내에서 검색
                },
                headers: {
                    Authorization: `KakaoAK ${API_KEY}`,
                    "Content-Type": `application/json;charset=UTF-8`
                },
            });

            // 카카오 키워드 검색 REST API 호출 (keyword.json)
            const keywordResponse = await axios.get(`https://dapi.kakao.com/v2/local/search/keyword.json`, {
                params: {
                    query,         // 검색어
                    x: lon,        // 경도
                    y: lat,        // 위도
                    // radius: 5000,  // 5km 반경 내에서 검색
                },
                headers: {
                    Authorization: `KakaoAK ${API_KEY}`,
                    "Content-Type": `application/json;charset=UTF-8`
                },
            });
            // 검색 결과 병합
            const combinedResults = [
                ...addressResponse.data.documents,
                ...keywordResponse.data.documents,
            ];
            setSuggestions(combinedResults); // 추천 결과 상태 업데이트
        } catch (error) {
            console.error('검색어 추천 오류:', error);
        }
    };


    //페이징 관련
    const totalPages = Math.ceil(stores.length / storesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleNextGroup = () => {
        if (currentPage + 5 <= totalPages) {
            setCurrentPage(currentPage + 5);
        } else {
            setCurrentPage(totalPages);
        }
    };

    const handlePrevGroup = () => {
        if (currentPage - 5 > 0) {
            setCurrentPage(currentPage - 5);
        } else {
            setCurrentPage(1);
        }
    };

    const generatePageNumbers = () => {
        const pageNumbers = [];
        const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1; // Always start at 1, 6, 11, ...
        const endPage = Math.min(startPage + 4, totalPages); // Show up to 5 pages

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    //슬라이드쇼
    const [currentSlide, setCurrentSlide] = useState(0);

    // 슬라이드마다 제목과 설명을 객체로 추가
    const slides = [
        {
            title: "STEP 1 : GET START",
            description: "간단한 회원가입 후 근처의 ECOEATS 가게를 확인하세요!"
        },
        {
            title: "STEP 2 : MAKE PAYMENT",
            description: "원하는 음식을 선택 후 ECOEATS를 통해 결제하세요!"
        },
        {
            title: "STEP 3 : GET FOOD",
            description: "지정된 픽업 시간 안에 매장으로 가서 영수증 확인 후 음식을 즐기세요!"
        }
    ];

    // 슬라이드 전환 함수
    const slide = (direction) => {
        if (direction === 1) {
            setCurrentSlide((prev) => (prev + 1) % slides.length);  // Next slide
        } else {
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);  // Previous slide
        }
    };

    // 동그라미 클릭 시 슬라이드로 이동
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };


    return (
        <div className="customer-home">
            <header className="customer-header">
                <div className='customer-header-1'>
                    <h1 className="customer-logo">ECOEATS</h1>
                    <div className="header-buttons">
                        {isLoggedIn ? (
                            <>
                                <button onClick={handleMyPage}>MY PAGE</button>
                                <button onClick={handleLogout}>LOGOUT</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate('/pages/Member/LoginHome')}>LOGIN</button>
                                <button onClick={() => navigate('/pages/Member/SignupPage')}>SIGN UP</button>
                            </>
                        )}
                    </div>
                </div>

                <div className='customer-header-2'>
                    <div className="slider-container">
                        <div className="slider">
                            <div className="slide">
                                <h2>{slides[currentSlide].title}</h2> {/* 각 슬라이드의 제목 */}
                                <p>{slides[currentSlide].description}</p> {/* 각 슬라이드의 설명 */}
                            </div>
                        </div>
                        {/* <button className="arrow left" onClick={() => slide(-1)}>&lt;</button>
                        <button className="arrow right" onClick={() => slide(1)}>&gt;</button> */}

                        <div className="dots">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => goToSlide(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

            </header>

            <main className="content">
                <section className="map-section">
                    <div className="map-overlay"></div>
                    <div className="map-content">
                        <h2>FIND YOUR STORE</h2>
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="지번, 도로명, 건물명으로 검색하세요."
                                className="address-input"
                                onChange={handleAddressInputChange}
                            />
                        </div>
                    </div>

                    {/* 검색어 추천 리스트 */}
                    {suggestions.length > 0 && (
                        <div className="suggestions-list">
                            <ul>
                                {suggestions.map((place) => (
                                    <li key={place.id} onClick={() => handlePlaceSelect(place)}>
                                        <strong>{place.place_name}</strong><br />
                                        {place.address_name}<br />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div id="addressDetailsModal" class="modal">
                        <div class="modal-content">
                            <h3>상세 주소를 입력해주세요</h3>
                            <p>상세 주소가 없다면 입력하지 않아도 됩니다.</p>
                            <input type="text" className="modal-input" id="detailedAddressInput" placeholder="상세 주소 입력 (선택)" />
                            <div class="modal-buttons">
                                <button id="submitDetailedAddressBtn" class="confirm-button">확인</button>
                                <button id="cancelDetailedAddressBtn" class="cancel-button">취소</button>
                            </div>
                        </div>
                    </div>

                    <div id="confirmationModal" class="modal">
                        <div class="modal-content">
                            <h3>입력하신 주소를 등록하시겠습니까?</h3>
                            <div class="modal-buttons">
                                <button id="confirmBtn" class="confirm-button">확인</button>
                                <button id="cancelBtn" class="cancel-button">취소</button>
                            </div>
                        </div>
                    </div>
                    <div className="map-container" id="map" ref={mapRef}></div>
                </section>

                <section className="store-list">
                    <div className="sort-options">
                        <button onClick={() => handleSortChange('distance')}>가까운순</button>
                        <button onClick={() => handleSortChange('bookmark')}>즐겨찾기 순</button>
                        <button onClick={() => handleSortChange('rating')}>리뷰 순</button>
                    </div>
                    <div className="stores">
                        {displayedStores.map((store) => (
                            <div
                                key={store.storeid}
                                className="store-card"
                                onClick={() => handleStoreClick(store.storeid)}
                            >
                                <img
                                    src={`http://127.0.0.1:8080${store.imageurl}`}
                                    alt={store.storeName}
                                />
                                <div className="store-info">
                                    <h3>{store.storeName} [{store.category}]</h3>
                                    <p>주소: {store.address}</p>
                                    <p>⭐ {store.avgrating}</p>
                                    <p>북마크: {store.bookmarkcount}</p>
                                </div>
                            </div>
                        ))}
                    </div>


                    {totalPages > 1 && (
                        <div className="pagination">
                            <button onClick={handlePrevGroup}>&lt;&lt;</button>
                            {generatePageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={currentPage === pageNum ? "active" : ""}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button onClick={handleNextGroup}>&gt;&gt;</button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default CustomerHome;
