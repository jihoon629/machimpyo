import React, { useState } from "react";
import { FaRegCheckCircle, FaCheckCircle, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import willService from "../services/willService";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/user/userSlice";
import { toast } from "react-toastify"; // ✅ 추가
import "react-toastify/dist/ReactToastify.css"; // ✅ 스타일 적용

import "./css/LoginPagecss/LoginPage.css";
import "./css/LoginPagecss/LoginPage.css";

const LoginPage = () => {
  const [saveId, setSaveId] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    const result = await dispatch(loginUser({ username: id, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate("/"); // ✅ 로그인 성공 시 홈으로 이동
    }
  };

  return (
    <div className="login-container">
      <div className="login-subtext">삶의 마지막을 장식하는</div>
      <div className="login-title-wrapper">
        <div className="login-line" />
        <h1 className="login-title-text">마침표</h1>
        <div className="login-line" />
      </div>

      <input
        className="login-input"
        type="text"
        placeholder="아이디"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        className="login-input"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="login-option-group">
        <div className="login-option-item" onClick={() => setSaveId(!saveId)}>
          {saveId ? (
            <FaCheckCircle color="#574bff" />
          ) : (
            <FaRegCheckCircle color="#ccc" />
          )}
          아이디 저장
        </div>
        <div className="login-option-item">
          <FaLock color="#e74c3c" /> 보안 접속
        </div>
      </div>

      <button className="login-button" onClick={handleLogin}>
        로그인
      </button>
      <button className="login-button" onClick={handleLogin}>
        로그인
      </button>

      <div className="login-find-links">
        <a href="#">아이디 찾기</a>|<a href="#">비밀번호 찾기</a>
      </div>

      <div className="login-signup-box">
        <span>아직 회원이 아니신가요?</span>
        <Link to="/register">회원가입</Link>
      </div>
    </div>
  );
};

export default LoginPage;
