import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../css/MyFavorite.css';

const MyFavorite = () => {
    const [favorites, setFavorites] = useState([]); // 즐겨찾기 목록
    const [searchQuery, setSearchQuery] = useState(""); // 검색어
    const [filteredFavorites, setFilteredFavorites] = useState([]); // 필터링된 목록

    // 즐겨찾기 목록 불러오기
    const fetchFavorites = async () => {
        const token = localStorage.getItem('token');
        try {
            if (!token) {
                alert("로그인이 필요합니다.");
                window.location.href = "/pages/Member/LoginHome";
                return;
            }
            const response = await axios.get(
                "/ROOT/api/bookmark/list",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("서버 응답 데이터:", response.data); // 서버 응답 확인

            if (response.data.status === 200 && Array.isArray(response.data.data)) {
                setFavorites(response.data.data);
                setFilteredFavorites(response.data.data);
            } else {
                console.error("오류 발생:", response.data.message || "알 수 없는 오류");
            }
        } catch (error) {
            console.error("즐겨찾기 목록을 불러오는 중 오류 발생:", error);
        }
    };

    // 즐겨찾기 삭제
    const deleteFavorite = async (storeId) => {
        console.log("삭제 요청 storeId:", storeId); // 삭제 요청 번호 확인
        const token = localStorage.getItem("token");

        try {
            const response = await axios({
                method: "delete",
                url: "/ROOT/api/bookmark/delete.json",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ storeId }),  // storeId만 보내기
            });

            if (response.data.status === 200) {
                alert("즐겨찾기가 삭제되었습니다.");
                fetchFavorites(); // 즐겨찾기 목록 갱신
            } else {
                alert(response.data.result || "삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("즐겨찾기 삭제 중 오류 발생:", error);
            alert("즐겨찾기 삭제 중 오류가 발생했습니다.");
        }
    };

    // 검색 기능
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // 검색어와 매칭되는 가게 필터링
        if (query) {
            const filtered = favorites.filter((store) =>
                store.storeName.toLowerCase().includes(query)
            );
            setFilteredFavorites(filtered);
        } else {
            setFilteredFavorites(favorites); // 검색어가 없으면 전체 목록
        }
    };

    // 컴포넌트 마운트 시 즐겨찾기 불러오기
    useEffect(() => {
        fetchFavorites();
    }, []);

    return (
        <div className="my-favorite-container">
            <h2>내 즐겨찾기</h2>
            <input
                type="text"
                placeholder="가게 이름 검색"
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
            />

            {filteredFavorites.length === 0 ? (
                <p>검색된 즐겨찾기가 없습니다.</p>
            ) : (
                <ul className="favorite-list">
                    {filteredFavorites.map((store) => (
                        <li key={store.storeId} onClick={() => window.location.href = `/store/detail/${store.storeId}`}>
                            <img
                                src={`http://localhost:8080${store.imageurl}`}
                                alt={store.storeName}
                                style={{ width: "50px", height: "50px" }}
                            />
                            <span>{store.storeName}</span>
                            <span>{store.address}</span>
                            <span>{store.phone}</span>
                            <span>{store.category}</span>
                            <button
                                onClick={() => deleteFavorite(store.storeId)}
                                className="delete-btn"
                            >
                                삭제
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyFavorite;
