import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../css/MyFavorite.css';

const MyFavorite = () => {
    const [favorites, setFavorites] = useState([]); // 즐겨찾기 목록
    const [searchQuery, setSearchQuery] = useState(""); // 검색어
    const [filteredFavorites, setFilteredFavorites] = useState([]); // 필터링된 목록
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [itemsPerPage] = useState(5); // 한 페이지당 보여줄 아이템 수

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
        const isConfirmed = window.confirm("즐겨찾기에서 삭제하시겠습니까?");
        
        if (!isConfirmed) return;

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
            setCurrentPage(1); // 검색 시 첫 페이지로 이동
        } else {
            setFilteredFavorites(favorites); // 검색어가 없으면 전체 목록
        }
    };

    // 페이지 변경
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 현재 페이지에 맞는 즐겨찾기 항목 가져오기
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFavorites = filteredFavorites.slice(indexOfFirstItem, indexOfLastItem);

    // 페이지 번호 생성
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredFavorites.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

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
                    {currentFavorites.map((store) => (
                        <li key={store.storeId} className="favorite-item" onClick={() => window.location.href = `/store/detail/${store.storeId}`}>
                            <img
                                src={`http://localhost:8080${store.imageurl}`}
                                alt={store.storeName}
                                className="favorite-image"
                            />
                            <div className="store-info">
                                <span className="store-name">{store.storeName}</span>
                                <span className="store-address">{store.address}</span>
                                <span className="store-phone">{store.phone}</span>
                                <span className="store-category">{store.category}</span>
                            </div>
                            <button
                                onClick={() => deleteFavorite(store.storeId)}
                                className="delete-btn"
                            >
                                ★ {/* 별모양 */}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* 페이지 버튼 */}
            <div className="pagination">
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={number === currentPage ? "active" : ""}
                    >
                        {number}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MyFavorite;
