import React, { useState } from 'react';
import { FaRegCheckCircle, FaCheckCircle, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
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
} from './style/LoginPagestyle';

const LoginPage = () => {
  const [saveId, setSaveId] = useState(false);

  return (
    <LoginContainer>
      <LoginSubtext>삶의 마지막을 장식하는</LoginSubtext>

      <LoginTitleWrapper>
        <LoginLine />
        <LoginTitleText>마침표</LoginTitleText>
        <LoginLine />
      </LoginTitleWrapper>

      <LoginInput type="text" placeholder="아이디" />
      <LoginInput type="password" placeholder="비밀번호" />

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

      <LoginButton>로그인</LoginButton>

      <LoginFindLinks>
        <a href="#">아이디 찾기</a>|
        <a href="#">비밀번호 찾기</a>
      </LoginFindLinks>

      <LoginSignupBox>
        <span>아직 회원이 아니신가요?</span>
        <Link to="/register">회원가입</Link>
      </LoginSignupBox>
    </LoginContainer>
  );
};

export default LoginPage;
