import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import '../../css/MyPage.css';
import MyFavorite from "./MyFavorite";
import MyOrder from "./MyOrder";
import MyReview from "./MyReview";
import EditInformation from './EditInformation';
import ChangePassword from './ChangePassword';
import CustomerSetting from './CustomerSetting';

const MyPage = () => {
    const [activePage, setActivePage] = useState('MY_FAVORITE');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state?.email;
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const storedEmail = localStorage.getItem('email');

            // 비교 전에 공백 제거
            const trimmedEmail = (location.state?.email || '').trim();
            const trimmedStoredEmail = (storedEmail || '').trim();

            // 이메일 비교
            if (!token || trimmedStoredEmail !== trimmedEmail) {
                navigate('/pages/Member/LoginHome');
                return;
            }

            // if (!token || storedEmail !== email) {
            //     navigate('/pages/Member/LoginHome');
            //     return;
            // }

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

    // activePage 상태를 변경할 때마다 localStorage에 저장
    const handlePageChange = (page) => {
        setActivePage(page);
        localStorage.setItem('activePage', page); // activePage를 localStorage에 저장
        setIsMenuOpen(false);
    };

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

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/ROOT/api/customer/delete.do`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status == 200) {
                localStorage.clear();
                navigate("/Thankyou");
            } else {
                alert('회원 탈퇴 실패: ' + response.data.message);
            }
        } catch (error) {
            console.error('회원 탈퇴 실패:', error);
            alert('오류가 발생했습니다.');
        }
        setShowModal(false);
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
            case 'CUSTOMER_SETTING':
                return <CustomerSetting />;
            default:
                return null;
        }
    };

    const handleHomeClick = () => {
        navigate('/pages/Home/CustomerHome');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="mypage-container">
            <aside className="sidebar">
                <div className="mypage-logo">
                    <h1 onClick={handleHomeClick}>ECOEATS</h1>
                </div>
                <nav className={`menu-bar ${isMenuOpen ? 'open' : ''}`}>
                    <ul>
                        <li onClick={handleHomeClick}>홈으로</li>
                        <li className={activePage === 'MY_FAVORITE' ? 'active' : ''} onClick={() => handlePageChange('MY_FAVORITE')}>즐겨찾기</li>
                        <li className={activePage === 'MY_ORDER' ? 'active' : ''} onClick={() => handlePageChange('MY_ORDER')}>내 주문목록</li>
                        <li className={activePage === 'MY_REVIEW' ? 'active' : ''} onClick={() => handlePageChange('MY_REVIEW')}>내 리뷰목록</li>
                        {/* <li className={activePage === 'EDIT_INFORMATION' ? 'active' : ''} onClick={() => handlePageChange('EDIT_INFORMATION')}>정보 수정</li>
                        <li className={activePage === 'CHANGE_PASSWORD' ? 'active' : ''} onClick={() => handlePageChange('CHANGE_PASSWORD')}>비밀번호 변경</li> */}
                        <li className={activePage === 'CUSTOMER_SETTING' ? 'active' : ''} onClick={() => handlePageChange('CUSTOMER_SETTING')}>계정 설정</li>
                        <li onClick={() => {
                            setShowModal(true);
                            console.log("showModal 상태:", showModal);
                        }}>회원 탈퇴</li>

                    </ul>
                </nav>

                <div className="btnbar">
                    {/* <button onClick={handleHomeClick}>홈으로 돌아가기</button> */}
                </div>
            </aside>

            {showModal && (
                <div className="mypage-modal">
                    <div className="mypage-modal-content">
                        <h3>정말 탈퇴하시겠습니까?</h3>
                        <p>탈퇴 후 정보는 복구할 수 없습니다.</p>
                        <button onClick={handleDeleteAccount} className="confirm-button">
                            확인
                        </button>
                        <button onClick={() => setShowModal(false)} className="cancel-button">
                            취소
                        </button>
                    </div>
                </div>
            )}

            <button className="hamburger-btn" onClick={toggleMenu}>
                {isMenuOpen ? 'X' : '☰'}
            </button>

            <main className="main-content">
                {renderContent()}
            </main>

            {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
        </div>
    );
};

export default MyPage;
