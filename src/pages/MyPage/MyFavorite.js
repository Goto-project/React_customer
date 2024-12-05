import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../css/MyFavorite.css';

const MyFavorite = () => {
    const [favorites, setFavorites] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFavorites, setFilteredFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const fetchFavorites = async () => {
        const token = localStorage.getItem('token');
        try {
            if (!token) {
                alert("로그인이 필요합니다.");
                window.location.href = "/pages/Member/LoginHome";
                return;
            }
            const response = await axios.get("/ROOT/api/bookmark/list", {
                headers: { Authorization: `Bearer ${token}` },
            });

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

    const deleteFavorite = async (storeId) => {
        const isConfirmed = window.confirm("즐겨찾기에서 삭제하시겠습니까?");
        if (!isConfirmed) return;

        const token = localStorage.getItem("token");
        try {
            const response = await axios.delete("/ROOT/api/bookmark/delete.json", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ storeId }),
            });

            if (response.data.status === 200) {
                alert("즐겨찾기가 삭제되었습니다.");
                fetchFavorites();
            } else {
                alert(response.data.result || "삭제에 실패했습니다.");
            }
        } catch (error) {
            alert("즐겨찾기 삭제 중 오류가 발생했습니다.");
            console.error("즐겨찾기 삭제 중 오류 발생:", error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query) {
            const filtered = favorites.filter((store) =>
                store.storeName.toLowerCase().includes(query)
            );
            setFilteredFavorites(filtered);
            setCurrentPage(1);
        } else {
            setFilteredFavorites(favorites);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < Math.ceil(filteredFavorites.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFavorites = filteredFavorites.slice(indexOfFirstItem, indexOfLastItem);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredFavorites.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    const maxPageToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPageToShow / 2));
    const endPage = Math.min(startPage + maxPageToShow - 1, pageNumbers.length);
    const visiblePages = pageNumbers.slice(startPage - 1, endPage);

    useEffect(() => {
        fetchFavorites();
    }, []);

    return (
        <div className="my-favorite-container">
            <h2>MY FAVORITE STORE</h2>
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
                            <div className="favorite-store-info">
                                <span className="store-name">{store.storeName}</span>
                                <span className="store-address">{store.address}</span>
                                <span className="store-phone">{store.phone}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFavorite(store.storeId);
                                }}
                                className="delete-btn"
                            >
                                ★
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="pagination">
                <button onClick={handlePrev} disabled={currentPage === 1}>
                    &lt;&lt;
                </button>
                {visiblePages.map((number) => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={number === currentPage ? "active" : ""}
                    >
                        {number}
                    </button>
                ))}
                <button onClick={handleNext} disabled={currentPage === pageNumbers.length}>
                    &gt;&gt;
                </button>
            </div>
        </div>
    );
};

export default MyFavorite;
