import React, { useEffect, useState } from "react";
import axios from "axios";

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
                "/ROOT/api/bookmark/mybookmarks.json",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("서버 응답 데이터:", response.data); // 서버 응답 확인

            if (response.data.status === 200) {
                setFavorites(response.data.stores); // 가게 목록 저장
                setFilteredFavorites(response.data.stores); // 초기 필터 목록 설정
            }
        } catch (error) {
            console.error("즐겨찾기 목록을 불러오는 중 오류 발생:", error);
        }
    };

    // 즐겨찾기 삭제
    const deleteFavorite = async (storeId) => {
        console.log("삭제 요청 storeId:", storeId); // 삭제 요청 번호 확인
        const token = localStorage.getItem("token");

        // storeId로 해당 북마크를 찾아 bookmarkNo 가져오기
    const store = favorites.find(store => store.storeId === storeId);
    console.log("찾은 store:", store); // store 객체 확인

    if (!store) {
        alert("해당 storeId의 북마크를 찾을 수 없습니다.");
        return;
    }

    const bookmarkNo = store.bookmarkNo;
    console.log("삭제할 bookmarkNo:", bookmarkNo);


        try {
            const response = await axios({
                method: "delete",
                url: "/ROOT/api/bookmark/delete.json",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ bookmarkNo }),  // bookmarkNo를 사용
            });

            if (response.data.status === 200) {
                alert("즐겨찾기가 삭제되었습니다.");
                fetchFavorites(); // 즐겨찾기 목록 갱신
            } else {
                alert(response.data.result || "삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("즐겨찾기 삭제 중 오류 발생:", error);
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
        <div style={{ padding: "20px" }}>
            <h2>내 즐겨찾기</h2>
            <input
                type="text"
                placeholder="가게 이름 검색"
                value={searchQuery}
                onChange={handleSearch}
                style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "20px",
                    fontSize: "16px",
                }}
            />

            {filteredFavorites.length === 0 ? (
                <p>검색된 즐겨찾기가 없습니다.</p>
            ) : (
                <ul>
                    {filteredFavorites.map((store) => (
                        <li
                            key={store.storeId}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px",
                                borderBottom: "1px solid #ddd",
                            }}
                        >
                            <span>{store.storeName}</span>
                            <button
                                onClick={() => deleteFavorite(store.storeId)}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "red",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                }}
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
