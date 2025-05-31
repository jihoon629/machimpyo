import React, { useState, useEffect } from 'react';
import willService from '../services/willService';
import { useNavigate } from 'react-router-dom';

export default function WillList({ onSelect }) {
    const [list, setList] = useState([]);
    const [status, setStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = sessionStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
            console.log("WillList: Loaded username from session:", storedUsername);
        } else {
            setStatus("로그인이 필요합니다. 사용자 이름을 세션에서 찾을 수 없습니다.");
            console.warn("WillList: Username not found in session storage.");
        }
    }, []);

    const handleFetch = async () => {
        if (!username) {
            setStatus('사용자 이름을 가져올 수 없습니다. 먼저 로그인해주세요.');
            return;
        }
        setStatus('조회 중...');
        try {
            const willsData = await willService.getMyWills(username);
            console.log("WillList: Response from getMyWills:", willsData); // 이 로그는 유지하여 데이터 확인

            if (Array.isArray(willsData) && willsData.length > 0) {
                setList(willsData);
                setStatus(`${willsData.length}개의 유언장이 조회되었습니다.`);
            } else if (Array.isArray(willsData) && willsData.length === 0) {
                setStatus('작성한 유언장이 없습니다.');
                setList([]);
            } else {
                console.error("WillList: Unexpected response structure from getMyWills:", willsData);
                setStatus('유언장 정보를 가져오는 데 실패했습니다. 응답 형식을 확인해주세요.');
                setList([]);
            }
        } catch (err) {
            console.error('WillList: Error fetching wills:', err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || '알 수 없는 오류';
            setStatus('조회 실패: ' + errorMessage);
            setList([]);
        }
    };
    
    useEffect(() => {
        if (username) {
            handleFetch();
        }
    }, [username]);

    const filteredList = list.filter(item => {
        // 실제 데이터 구조에 맞춰 필드명 사용
        const idValue = item.id || '';         // 'id' (소문자) 사용
        const titleValue = item.title || '';   // 'title' 사용
        const keyword = searchTerm.toLowerCase();
        return (
            idValue.toLowerCase().includes(keyword) ||
            titleValue.toLowerCase().includes(keyword)
        );
    });

    const handleItemClick = (willId) => { // 파라미터 이름은 그대로 willId 사용
        console.log("WillList: Item clicked. ID to navigate/select:", willId);
        console.log("WillList: onSelect prop exists:", typeof onSelect === 'function');

        if (willId) { // willId가 유효한 값인지 확인 (undefined, null, 빈 문자열이 아닌지)
            if (typeof onSelect === 'function') {
                console.log("WillList: Calling onSelect with ID:", willId);
                onSelect(willId);
            } else {
                console.log("WillList: Navigating to /detail/" + willId);
                navigate(`/will/${willId}`);
            }
        } else {
            console.warn("WillList: Clicked item has no valid ID to navigate or select. Received ID:", willId);
            setStatus("선택한 항목의 ID가 올바르지 않아 상세 페이지로 이동할 수 없습니다.");
        }
    };

    return (
        <div className="form-group">
            <h3>나의 유언장 목록 조회</h3>
            {username ? (
                <>
                    <input
                        className="form-control mb-2"
                        placeholder="검색어를 입력하세요 (ID 또는 제목)"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </>
            ) : null}
            <p>{status}</p>
            {list.length > 0 && (
                 <ul className="list-group">
                 {filteredList.map((item, idx) => (
                     <li
                         key={item.id || idx} // key 값으로 item.id 사용
                         className="list-group-item list-group-item-action"
                         style={{ cursor: 'pointer' }}
                         onClick={() => handleItemClick(item.id)} // onClick 시 item.id 전달
                     >
                         <strong>ID:</strong> {item.id}<br /> {/* 화면 표시도 item.id 사용 */}
                         <strong>제목:</strong> {item.title || '제목 없음'}
                     </li>
                 ))}
             </ul>
            )}
        </div>
    );
}