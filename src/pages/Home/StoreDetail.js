import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function StoreDetail() {
    const { storeid } = useParams();  // URL에서 storeid를 받아옵니다.
    const [store, setStore] = useState(null);
    const [menus, setMenus] = useState([]); // 메뉴 목록을 저장할 상태

    // 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환하는 함수
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // storeid로 가게 정보를 가져오기
    const fetchStoreDetail = async () => {
        try {
            const response = await axios.get(`/ROOT/api/store/detail/${storeid}`);
            if (response.data.status === 200) {
                setStore(response.data.result);
            } else {
                console.error('Failed to fetch store details');
            }
        } catch (error) {
            console.error('Error fetching store details:', error);
        }
    };

    // 날짜에 맞는 메뉴 목록을 가져오는 함수
    const fetchDailyMenus = async () => { 
        const selectedDate = getTodayDate();
        try {
            const response = await axios.get(`/ROOT/api/menu/daily/list`, {
                params: { date: selectedDate },
            });
            if (response.data.status === 200) {
                setMenus(response.data.result); // 메뉴 목록 상태 업데이트
            } else {
                console.error('Failed to fetch daily menus');
            }
        } catch (error) {
            console.error('Error fetching daily menus:', error);
        }

    };



    useEffect(() => {
        fetchStoreDetail(); // 가게 정보 불러오기
        fetchDailyMenus(); // 메뉴 목록 불러오기
    }, [storeid]);

    // store 데이터가 로딩 중일 때 로딩 화면 표시
    if (!store) {
        return <div>가게를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="store-detail">
            <img src={`http://127.0.0.1:8080${store.imageurl}`} alt={store.storeName} />
            <h2>{store.storeName}</h2>
            <p>email: {store.storeemail}</p>
            <p>주소: {store.address}</p>
            <p>전화번호: {store.phone}</p>
            <p>카테고리: {store.category}</p>
            <p>리뷰: {store.rating}</p>
            <p>픽업 시간: {store.startpickup} ~ {store.endpickup}</p>
            <p>북마크: {store.bookmarkcount}</p>
            <p>리뷰수: {store.reviewcount}</p>

<br/>
            <h3>메뉴 목록</h3>
            {menus.length > 0 ? (
                <div>
                    <ul>
                        {menus.map((menu, index) => (
                            <li key={index}>
                                <h4>{menu.menuNo.name}</h4>
                                <p>{menu.description}</p>
                                <p>{menu.price}원</p>
                                <p>{menu.qty}개 주문 가능</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>해당 날짜의 메뉴가 없습니다.</p>
            )}

        </div>
    );
};

export default StoreDetail;