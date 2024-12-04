import axios from 'axios';
import React, { useEffect } from 'react';

const NaverLogin = () => {

    const naverInit = async () => {
        console.log('1111')
        var naver_id_login = new window.naver_id_login("ofyUDU2NTCyZHJ972RrY", "http://localhost:3000/naverlogin");

        // 접근 토큰 값 출력
        console.log(naver_id_login.oauthParams.access_token);
        const url = `/ROOT/api/naver/getInfo.json`;
        const headers = { "Content-Type": "application/json", "token": naver_id_login.oauthParams.access_token };
        console.log("API 호출 전");
        const { data } = await axios.get(url, { headers })
        console.log("API 호출 후", data);
        console.log(data);
    }

    useEffect(() => {
        
        naverInit();
    }, []);

    return (
        <div>

        </div>
    );
};

export default NaverLogin;