// ✅ WillList.js - 슬라이스 연동해서 전체 리팩토링 완료
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMyWills,
  fetchDesignatedWills,
} from "../../features/post/willSlice"; // 위치에 맞게 경로 조정

export default function WillList({ onSelect }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { myWills, designatedWills, loading } = useSelector((state) => state.will);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      dispatch(fetchMyWills(storedUsername));
      dispatch(fetchDesignatedWills(storedUsername));
    } else {
      console.warn("WillList: Username not found in session storage.");
    }
  }, [dispatch]);

  const filterWills = (list, term) => {
    if (!term) return list;
    const keyword = term.toLowerCase();
    return list.filter((item) => {
      const idValue = item.id || "";
      const titleValue = item.title || "";
      return (
        idValue.toLowerCase().includes(keyword) ||
        titleValue.toLowerCase().includes(keyword)
      );
    });
  };

  const filteredMyWills = filterWills(myWills, searchTerm);
  const filteredDesignatedWills = filterWills(designatedWills, searchTerm);

  const handleItemClick = (willId) => {
    if (willId) {
      if (typeof onSelect === "function") {
        onSelect(willId);
      } else {
        navigate(`/will/${willId}`);
      }
    }
  };

  const renderWillList = (title, list) => (
    <div className="mb-4">
      <h4>{title}</h4>
      {loading ? (
        <p>조회 중...</p>
      ) : list.length > 0 ? (
        <ul className="list-group">
          {list.map((item, idx) => (
            <li
              key={item.id || idx}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onClick={() => handleItemClick(item.id)}
            >
              <strong>ID:</strong> {item.id}
              <br />
              <strong>제목:</strong> {item.title || "제목 없음"}
              <br />
              {item.testatorId &&
                title.includes("지정 열람자") && (
                  <small>
                    <strong>작성자:</strong> {item.testatorId}
                  </small>
                )}
            </li>
          ))}
        </ul>
      ) : (
        <p>해당 목록에 유언장이 없습니다.</p>
      )}
    </div>
  );

  return (
    <div className="container mt-3">
      <h3>유언장 목록</h3>
      {username ? (
        <div className="form-group">
          <input
            className="form-control mb-3"
            placeholder="검색어를 입력하세요 (ID 또는 제목)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      ) : (
        <p>로그인 후 유언장 목록을 확인할 수 있습니다.</p>
      )}

      {username && (
        <>
          {renderWillList("나의 유언장", filteredMyWills)}
          {renderWillList("내가 지정 열람자인 유언장", filteredDesignatedWills)}
        </>
      )}
    </div>
  );
}
