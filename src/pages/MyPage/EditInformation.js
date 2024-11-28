import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/CustomerEditInfo.css';
import '../../css/ChangePassword.css';

const EditInformation = () => {
    const [activeTab, setActiveTab] = useState('editInfo'); // 현재 탭 상태
    const [customerInfo, setCustomerInfo] = useState({
        customerEmail: '',
        phone: '',
        nickname: '',
    });
    const [passwords, setPasswords] = useState({
        currentPwd: '',
        newPwd: '',
        confirmNewPwd: '',
    });
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 회원 정보 가져오기
    useEffect(() => {
        const token = localStorage.getItem('token');
        const customerEmail = localStorage.getItem('email');

        if (!customerEmail || !token) {
            setErrorMessage('유효한 customerEmail과 token이 없습니다.');
            setIsLoading(false);
            return;
        }

        const fetchCustomerDetails = async () => {
            try {
                const url = `/ROOT/api/customer/mypage.do`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    setCustomerInfo({
                        customerEmail: response.data.customerEmail,
                        phone: response.data.phone,
                        nickname: response.data.nickname,
                    });
                } else {
                    setErrorMessage('회원 정보를 불러오는 데 실패했습니다.');
                }
            } catch (error) {
                setErrorMessage('회원 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomerDetails();
    }, []);

    // 회원 정보 수정 핸들러
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인 상태가 아닙니다. 다시 로그인해주세요.');
            return;
        }

        try {
            const response = await axios.put('/ROOT/api/customer/update.do', customerInfo, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.status === 200) {
                alert('회원 정보가 성공적으로 수정되었습니다.');
                window.location.reload();
            } else {
                setMessage(response.data.message || '회원 정보 수정에 실패했습니다.');
            }
        } catch (error) {
            setMessage('회원 정보 수정 중 오류가 발생했습니다.');
        }
    };

    // 비밀번호 변경 핸들러
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prevPasswords) => ({
            ...prevPasswords,
            [name]: value,
        }));
    };

    const handlePasswordSubmit = async () => {
        if (passwords.newPwd !== passwords.confirmNewPwd) {
            setMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(
                `/ROOT/api/customer/updatepassword.do?currentPwd=${passwords.currentPwd}&newPwd=${passwords.newPwd}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();
            if (data.status === 200) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                window.location.reload();
            } else {
                setMessage(data.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    if (isLoading) {
        return <p>로딩 중...</p>;
    }

    return (
        <div className="settings-container">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'editInfo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('editInfo')}
                >
                    회원 정보 수정
                </button>
                <button
                    className={`tab ${activeTab === 'changePassword' ? 'active' : ''}`}
                    onClick={() => setActiveTab('changePassword')}
                >
                    비밀번호 변경
                </button>
            </div>

            {activeTab === 'editInfo' && (
                <div className="tab-content">
                    <h1 className="edit-title">회원 정보 수정</h1>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <form onSubmit={handleInfoSubmit} className="edit-form">
                        <div className="customer-edit-input-group">
                            <label>이메일</label>
                            <input type="email" value={customerInfo.customerEmail} disabled className="input-field" />
                        </div>
                        <div className="customer-edit-input-group">
                            <label>닉네임</label>
                            <input
                                type="text"
                                name="nickname"
                                value={customerInfo.nickname}
                                onChange={handleInfoChange}
                                className="input-field"
                            />
                        </div>
                        <div className="customer-edit-input-group">
                            <label>전화번호</label>
                            <input
                                type="text"
                                name="phone"
                                value={customerInfo.phone}
                                onChange={handleInfoChange}
                                className="input-field"
                            />
                        </div>
                        {message && <p className="message">{message}</p>}
                        <button type="submit" className="submit-btn">
                            저장
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'changePassword' && (
                <div className="tab-content">
                    <h2 className="password-edit-title">비밀번호 변경</h2>
                    <div className="password-input-group">
                        <label>현재 비밀번호</label>
                        <input
                            type="password"
                            name="currentPwd"
                            value={passwords.currentPwd}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    <div className="password-input-group">
                        <label>새 비밀번호</label>
                        <input
                            type="password"
                            name="newPwd"
                            value={passwords.newPwd}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    <div className="password-input-group">
                        <label>새 비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmNewPwd"
                            value={passwords.confirmNewPwd}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    {message && <p className="message">{message}</p>}
                    <button className="editpasswordbtn" onClick={handlePasswordSubmit}>
                        비밀번호 변경
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditInformation;
