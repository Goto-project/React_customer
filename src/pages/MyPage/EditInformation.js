import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../css/EditInfo.css';

const EditInformation = () => {
    const [customerInfo, setCustomerInfo] = useState({
        customerEmail: '',
        phone: '',
        nickname: '',
    });
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { customerEmail, token } = location.state || {};

    useEffect(() => {

        const token = localStorage.getItem('token');
        const customerEmail = localStorage.getItem('email');
            
        console.log("Location state:", location.state); // location.state 확인

        if (!customerEmail || !token) {
            setErrorMessage('유효한 customerEmail과 token이 전달되지 않았습니다.');
            setIsLoading(false);
            return;
        }

        // 고객 정보 가져오는 함수
        const fetchCustomerDetails = async () => {
            try {
                const url = `/ROOT/api/customer/mypage.do`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    console.log("Fetched customerInfo:", response.data); // 응답 데이터 확인
                    const customerDetails = {
                        customerEmail: response.data.customerEmail,
                        phone: response.data.phone,
                        nickname: response.data.nickname,
                    };
                    setCustomerInfo(customerDetails); // 고객 정보 상태 업데이트
                } else {
                    setErrorMessage('회원 정보를 불러오는 데 실패했습니다.');
                }
            } catch (error) {
                console.error("Error fetching customer info:", error);
                setErrorMessage('회원 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomerDetails();
    }, [customerEmail, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("customerInfo:", JSON.stringify(customerInfo, null, 2));


        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인 상태가 아닙니다. 다시 로그인해주세요.');
            navigate('/pages/Member/LoginHome'); // 로그인 페이지로 리디렉션
            return;
        }

        try {
            const response = await axios.put('/ROOT/api/customer/update.do', customerInfo, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            
            console.log("Response from update:", response); // 응답 내용 확인

            if (response.data.status === 200) {
                alert('회원 정보가 성공적으로 수정되었습니다.');
                window.location.reload();
            } else {
                setMessage(response.data.message || '회원 정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error updating customer info:', error);
            setMessage('회원 정보 수정 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return <p>로딩 중...</p>;
    }

    return (
        <div className="customer-editcontainer">
            <h1 className="customer-edit-title">EDIT CUSTOMER INFORMATION</h1>

            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* 오류 메시지 표시 */}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>이메일:</label>
                    <input
                        type="email"
                        value={customerInfo.customerEmail}
                        disabled // 변경 불가능
                        className="editcustomerEmail"
                    />
                </div>

                <div className="customereditinput">
                    <div className="input-group">
                        <label>닉네임:</label>
                        <input
                            type="text"
                            name="nickname"
                            value={customerInfo.nickname}
                            onChange={handleChange}
                            className="editcustomerNickname"
                        />
                    </div>
                    <div className="input-group">
                        <label>전화번호:</label>
                        <input
                            type="text"
                            name="phone"
                            value={customerInfo.phone}
                            onChange={handleChange}
                            className="editcustomerPhone"
                        />
                    </div>
                </div>

                <button type="submit" className='editinfobtn'>저장</button>
            </form>
        </div>
    );
};

export default EditInformation;
