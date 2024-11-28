import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import '../../css/MyPage.css';
import MyFavorite from "./MyFavorite";
import MyOrder from "./MyOrder";
import MyReview from "./MyReview";
import EditInformation from './EditInformation';
import ChangePassword from './ChangePassword';

const MyPage = () => {
    const [activePage, setActivePage] = useState('MY_FAVORITE');
    const navigate = useNavigate();
    const { email } = useParams();
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const storedEmail = localStorage.getItem('email');

            if (!token || storedEmail !== email) {
                navigate('/pages/Member/LoginHome');
                return;
            }

            try {
                const response = await axios.get(`/ROOT/api/customer/mypage.do`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    setNickname(response.data.nickname);
                    setPhone(response.data.phone);
                } else {
                    throw new Error(response.data.message || 'Authentication Failed');
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                navigate('/pages/Member/LoginHome');
            }
        };

        fetchData();
    }, [email, navigate]);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`/ROOT/api/customer/logout.do`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status === 200) {
                localStorage.clear();
                navigate('/pages/Home/CustomerHome');
            } else {
                alert('Logout failed: ' + response.data.message);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Error occurred during logout.');
        }
    };

    const renderContent = () => {
        switch (activePage) {
            case 'MY_FAVORITE':
                return <MyFavorite />;
            case 'MY_ORDER':
                return <MyOrder />;
            case 'MY_REVIEW':
                return <MyReview />;
            case 'EDIT_INFORMATION':
                return <EditInformation />;
            case 'CHANGE_PASSWORD':
                return <ChangePassword />;
            default:
                return null;
        }
    };

    const handleHomeClick = () => {
        navigate('/pages/Home/CustomerHome');
    };

    return (
        <div className="mypage-container">
            <aside className="sidebar">
                <div className="mypage-logo">
                    <h1 onClick={handleHomeClick}>ECOEATS</h1>
                </div>
                <nav className="menu-bar">
                    <ul>
                        <li onClick={handleHomeClick}>홈으로</li>
                        <li className={activePage === 'MY_FAVORITE' ? 'active' : ''} onClick={() => setActivePage('MY_FAVORITE')}>즐겨찾기</li>
                        <li className={activePage === 'MY_ORDER' ? 'active' : ''} onClick={() => setActivePage('MY_ORDER')}>내 주문목록</li>
                        <li className={activePage === 'MY_REVIEW' ? 'active' : ''} onClick={() => setActivePage('MY_REVIEW')}>내 리뷰목록</li>
                        <li className={activePage === 'EDIT_INFORMATION' ? 'active' : ''} onClick={() => setActivePage('EDIT_INFORMATION')}>정보 수정</li>
                        <li className={activePage === 'CHANGE_PASSWORD' ? 'active' : ''} onClick={() => setActivePage('CHANGE_PASSWORD')}>비밀번호 변경</li>
                        <li onClick={handleLogout}>회원 탈퇴</li>
                    </ul>
                </nav>
                <div className="btnbar">
                    {/* <button onClick={handleHomeClick}>홈으로 돌아가기</button> */}
                </div>
            </aside>

            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default MyPage;
