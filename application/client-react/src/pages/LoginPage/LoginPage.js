import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRegCheckCircle, FaCheckCircle, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  LoginContainer,
  LoginSubtext,
  LoginTitleWrapper,
  LoginLine,
  LoginTitleText,
  LoginInput,
  LoginButton,
  LoginFindLinks,
  LoginSignupBox,
} from "./style/LoginPageStyle";
import { loginUser } from "./../../features/user/userSlice";

const MemberTypeToggle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f2f3f7;
  border-radius: 14px;
  padding: 8px;
  margin-bottom: 30px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ToggleButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  padding: 14px 0;
  margin: 0 4px;
  cursor: pointer;
  background: ${({ active }) =>
    active ? "linear-gradient(135deg, #6a5af9, #574bff)" : "#fff"};
  color: ${({ active }) => (active ? "#fff" : "#555")};
  font-weight: 600;
  transition: all 0.25s ease-in-out;
  box-shadow: ${({ active }) =>
    active ? "0 0 0 1px #574bff inset" : "0 0 0 1px #ddd inset"};

  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    margin-right: 8px;
  }

  &:hover {
    background: ${({ active }) =>
      active ? "linear-gradient(135deg, #574bff, #4633d6)" : "#f8f8f8"};
  }
`;

const LoginOptionGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 400px;
  margin-bottom: 30px;
  font-size: 14px;
  color: #666;
`;

const LoginOptionItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
  cursor: pointer;

  svg {
    margin-right: 6px;
    width: 18px;
    height: 18px;
  }
`;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.user);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [memberType, setMemberType] = useState("personal");

  const handleLogin = async () => {
    if (!username || !password) {
      console.warn("⚠️ 아이디와 비밀번호가 모두 입력되지 않았습니다.");
      return;
    }

    const role = memberType === "notary" ? "NOTARY" : "USER";

    try {
      console.log("🟡 로그인 요청 시작:", { username, password, role });

      const resultAction = await dispatch(
        loginUser({ username, password, role })
      );

      console.log("🟢 로그인 결과:", resultAction);

      if (loginUser.fulfilled.match(resultAction)) {
        console.log("✅ 로그인 성공! 홈으로 이동합니다.");
        navigate("/");
      } else {
        console.warn("⚠️ 로그인 실패:", resultAction.payload);
      }
    } catch (err) {
      console.error("❌ 로그인 중 예외 발생:", err);
    }
  };

  return (
    <LoginContainer>
      <LoginSubtext>블록체인 기반 유언장 공증 플랫폼</LoginSubtext>
      <LoginTitleWrapper>
        <LoginLine />
        <LoginTitleText>마침표</LoginTitleText>
        <LoginLine />
      </LoginTitleWrapper>

      <MemberTypeToggle>
        <ToggleButton
          active={memberType === "personal"}
          onClick={() => setMemberType("personal")}
        >
          <FaCheckCircle
            color={memberType === "personal" ? "#fff" : "#ccc"}
            style={{ marginRight: 6 }}
          />
          일반 사용자
        </ToggleButton>
        <ToggleButton
          active={memberType === "notary"}
          onClick={() => setMemberType("notary")}
        >
          <FaCheckCircle
            color={memberType === "notary" ? "#fff" : "#ccc"}
            style={{ marginRight: 6 }}
          />
          공증인
        </ToggleButton>
      </MemberTypeToggle>

      <LoginInput
        type="text"
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <LoginInput
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <LoginOptionGroup>
        <LoginOptionItem onClick={() => setSaveId(!saveId)}>
          {saveId ? (
            <FaCheckCircle color="#574bff" />
          ) : (
            <FaRegCheckCircle color="#ccc" />
          )}
          아이디 저장
        </LoginOptionItem>
        <LoginOptionItem>
          <FaLock color="#e74c3c" /> 보안 접속
        </LoginOptionItem>
      </LoginOptionGroup>

      <LoginButton onClick={handleLogin} disabled={loading}>
        {loading ? "로그인 중..." : "로그인"}
      </LoginButton>

      <LoginFindLinks>
        <a href="#">아이디 찾기</a>|<a href="#">비밀번호 찾기</a>
      </LoginFindLinks>

      <LoginSignupBox>
        <span>아직 회원이 아니신가요?</span>
        <Link
          to={
            memberType === "notary" ? "/register/notary" : "/register/personal"
          }
        >
          회원가입
        </Link>
      </LoginSignupBox>
    </LoginContainer>
  );
};

export default LoginPage;
