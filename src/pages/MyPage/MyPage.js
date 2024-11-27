import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import '../../css/MyPage.css';
import MyProfile from "./MyProfile";
import MyFavorite from "./MyFavorite";
import MyOrder from "./MyOrder";
import MyReview from "./MyReview";
import EditInformation from './EditInformation';
import ChangePassword from './ChangePassword';

const MyPage = () => {

    const [activePage, setActivePage] = useState('MY_FAVORITE');
    const [activeMenu, setActiveMenu] = useState('MY_FAVORITE');
    const navigate = useNavigate();

    const { email } = useParams();
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    // Fetch user data on component mount
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const storedEmail = localStorage.getItem('email');

            if (!token || storedEmail !== email) {
                navigate('/pages/Member/LoginHome'); // Redirect to login if token or email mismatch
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
                    throw new Error(response.data.message || '인증 실패');
                }
            } catch (error) {
                console.error('회원 정보 불러오기 실패:', error);
                navigate('/pages/Member/LoginHome'); // Redirect on fetch failure
            }
        };

        fetchData();
    }, [email, navigate]);

    // Handle Logout
    const handleLogout = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.delete(`/ROOT/api/customer/logout.do`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status === 200) {
                localStorage.clear(); // Clear local storage
                navigate('/pages/Home/Customerhome'); // Redirect to home page
            } else {
                alert('로그아웃 실패: ' + response.data.message);
            }
        } catch (error) {
            console.error('로그아웃 실패:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
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

    const handleMenuClick = (page) => {
        setActiveMenu(page);
        setActivePage(page);
    };

    const handleHomeClick = () => {
        navigate('/pages/Home/CustomerHome');
    };

    return (
        <div className="container">

    
            <aside className="sidebar">
            <header className="header">MYPAGE</header>
                <div className="profile-box">
                    <h2>{nickname || "User Name"}</h2>
                    <p>{phone || "No phone number"}</p>
                </div>
                <div className="header-buttons">
                    <button className="logoutbutton" onClick={handleHomeClick}>HOME</button>
                    <button className="logoutbutton" onClick={handleLogout}>LOGOUT</button>
                </div>
            </aside>
    
            <main className="main-area">
                <ul className="menu-bar">
                    <li
                        onClick={() => handleMenuClick('MY_FAVORITE')}
                        className={activeMenu === 'MY_FAVORITE' ? 'active' : ''}
                    >
                        MY FAVORITE
                    </li>
                    <li
                        onClick={() => handleMenuClick('MY_ORDER')}
                        className={activeMenu === 'MY_ORDER' ? 'active' : ''}
                    >
                        MY ORDER
                    </li>
                    <li
                        onClick={() => handleMenuClick('MY_REVIEW')}
                        className={activeMenu === 'MY_REVIEW' ? 'active' : ''}
                    >
                        MY REVIEW
                    </li>
                    <li
                        onClick={() => handleMenuClick('EDIT_INFORMATION')}
                        className={activeMenu === 'EDIT_INFORMATION' ? 'active' : ''}
                    >
                        EDIT INFORMATION
                    </li>
                    <li
                        onClick={() => handleMenuClick('CHANGE_PASSWORD')}
                        className={activeMenu === 'CHANGE_PASSWORD' ? 'active' : ''}
                    >
                        CHANGE PASSWORD
                    </li>
                </ul>
    
                <div className="main-content">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
    
    
};

export default MyPage;
