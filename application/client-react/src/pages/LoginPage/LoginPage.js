import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRegCheckCircle, FaCheckCircle, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import {
  LoginContainer,
  LoginSubtext,
  LoginTitleWrapper,
  LoginLine,
  LoginTitleText,
  LoginInput,
  LoginOptionGroup,
  LoginOptionItem,
  LoginButton,
  LoginFindLinks,
  LoginSignupBox,
} from "./style/LoginPageStyle";
import { loginUser } from "./../../features/user/userSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.user);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      console.log("🟡 로그인 요청 시작:", { username, password });

      const resultAction = await dispatch(loginUser({ username, password }));

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
      <LoginSubtext>삶의 마지막을 장식하는</LoginSubtext>

      <LoginTitleWrapper>
        <LoginLine />
        <LoginTitleText>마침표</LoginTitleText>
        <LoginLine />
      </LoginTitleWrapper>

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
        <Link to="/register">회원가입</Link>
      </LoginSignupBox>
    </LoginContainer>
  );
};

export default LoginPage;
