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

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
        // 우편번호 추출 (road_address가 있는 경우 사용)
        const postcode = road_address?.zone_no || '우편번호 없음';

        // 입력창에 선택한 주소를 자동으로 채워넣음
        const fullAddress = place.address_name;

        // 사용자에게 상세 주소 입력 요청
        const detailedAddress = prompt('상세 주소를 입력해주세요 (예: 건물 이름, 층수 등)');
        // 입력창 요소 가져오기
        const addressInput = document.querySelector('.address-input');

        // 사용자가 "취소"를 누른 경우 함수 종료
        if (detailedAddress === null) {
            addressInput.value = ''; // 입력창을 빈칸으로 초기화
            return; // 이후 코드 실행 중단
        }

        const safeDetailedAddress = (detailedAddress ?? '').trim() || '상세 정보 없음';
        // 상세 주소를 포함한 전체 주소 구성
        const completeAddress = `${fullAddress} ${safeDetailedAddress}`;

        // 입력창에 자동으로 완성된 주소 표시
        document.querySelector('.address-input').value = completeAddress;

        const isConfirmed = window.confirm('입력하신 주소를 등록하시겠습니까?');

        // 취소를 눌러도 검색창을 비운다
        document.querySelector('.address-input').value = '';


        if (isConfirmed) {
            // localStorage에서 customerEmail 가져오기
            const customerEmail = localStorage.getItem('email'); // 로그인 시 저장한 이메일
            if (!customerEmail) {
                alert('로그인 정보가 필요합니다.');
                return;
            }
            // 주소를 선택하면 location 상태를 갱신
            setLocation({ lat: y, lon: x }); // 선택된 주소의 위도와 경도로 갱신
            const map = mapInstance.current;
            const newCenter = new kakao.maps.LatLng(y, x);
            map.setCenter(newCenter); // 지도 중심 이동

            // 기존에 찍힌 마커가 있다면 삭제
            if (window.marker) {
                window.marker.setMap(null);
            }

            // 새로운 마커 생성
            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(y, x),
            });
            marker.setMap(map); // 지도에 마커 추가

            window.marker = marker; // 마커를 window 객체에 저장 (삭제 가능)

            // 선택된 장소 정보를 상태에 저장하여 UI에 표시
            setSelectedPlace({
                placeName: place_name,
                address: address_name,
                phone: phone || '전화번호 정보 없음',
                category: category_group_name || '카테고리 정보 없음',
            });

            try {
                // 서버로 주소 저장 요청
                const response = await axios.post(
                    '/ROOT/api/customerAddress/add.json',
                    {
                        postcode, // 우편번호는 필요 시 처리 (카카오 API 결과에는 포함되지 않음)
                        address: address_name,
                        addressdetail: `${safeDetailedAddress}`,
                        customeremail: {
                            customerEmail: customerEmail, // 실제 사용자 이메일로 교체 필요
                        },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`, // 인증 토큰
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

            // "주소 찾기" 버튼을 자동으로 클릭 (기존 handleAddressSearch 호출)
            // handleAddressSearch();

            // 추천 리스트 숨기기
            setSuggestions([]); // 추천 결과 초기화 (추천창 사라짐)
        }
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
                            onChange={handleAddressInputChange} // 실시간 입력 처리
                        />
                        <button className="find-address-button" onClick={handleAddressSearch}>
                            주소 찾기
                        </button>
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
                                <h3>{store.storeName}</h3>
                                <p>주소: {store.address}</p>
                                <p>☎ {store.phone}</p>
                                <p>카테고리: {store.category}</p>
                                <p>픽업 시간: {store.startPickup} ~ {store.endPickup}</p>
                                <p>⭐ {store.avgrating}</p>
                                <p>북마크: {store.bookmarkcount}</p>
                                <p>리뷰 수: {store.reviewcount}</p>
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
