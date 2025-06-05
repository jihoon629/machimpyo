import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearErrors,
  checkEmailAvailability,
  registerNotary,
} from "../../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
const LoginSubtext = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const LoginTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

const LoginLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #ddd;
`;

const LoginTitleText = styled.div`
  margin: 0 20px;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
`;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faBuilding,
  faMapMarkedAlt,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: #f8f9ff;
  padding: 30px 5px;
  font-family: "Noto Sans KR", sans-serif;
`;

const FormWrapper = styled.div`
  background: #ffffff;
  padding: 40px 24px;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 460px;
  text-align: center;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 22px;
`;

const StyledIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #adb5bd;
  font-size: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 48px;
  border: 1px solid #eee;
  border-radius: 12px;
  font-size: 15px;
  background-color: #fcfcfd;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;

  &::placeholder {
    color: #c1c1c1;
  }

  &:focus {
    border-color: #a3a3ff;
    outline: none;
    background-color: #ffffff;
  }
`;

const Button = styled.button`
  width: 100%;
  background: #574bff;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.3s;

  &:hover {
    background: #4633d6;
  }
`;

const NotaryRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { emailmessage, registrationError } = useSelector(
    (state) => state.user
  );

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    gender: "MAN",
    phone: "",
    companyName: "",
    companyAddress: "",
    registrationNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("공증인 등록 정보:", form);
    dispatch(registerNotary({ values: { ...form, role: "NOTARY" }, navigate }));
  };

  return (
    <Container>
      <LoginSubtext>블록체인 기반 유언장 공증 플랫폼</LoginSubtext>
      <LoginTitleWrapper>
        <LoginLine />
        <LoginTitleText>마침표</LoginTitleText>
        <LoginLine />
      </LoginTitleWrapper>
      <LoginSubtext>공증인 회원가입</LoginSubtext>
      <FormWrapper>
        <form onSubmit={handleSubmit}>
          <InputWrapper>
            <StyledIcon icon={faEnvelope} />
            <Input
              type="email"
              name="email"
              placeholder="이메일"
              value={form.email}
              onChange={handleChange}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <StyledIcon icon={faLock} />
            <Input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <StyledIcon icon={faUser} />
            <Input
              type="text"
              name="name"
              placeholder="이름"
              value={form.name}
              onChange={handleChange}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <StyledIcon icon={faPhone} />
            <Input
              type="text"
              name="phone"
              placeholder="연락처 (숫자만)"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <StyledIcon icon={faBuilding} />
            <Input
              type="text"
              name="companyName"
              placeholder="회사명"
              value={form.companyName}
              onChange={handleChange}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <StyledIcon icon={faMapMarkedAlt} />
            <Input
              type="text"
              name="companyAddress"
              placeholder="회사 주소"
              value={form.companyAddress}
              onChange={handleChange}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <StyledIcon icon={faBuilding} />
            <Input
              type="text"
              name="registrationNumber"
              placeholder="사업자등록번호"
              value={form.registrationNumber}
              onChange={handleChange}
              required
            />
          </InputWrapper>
          <Button type="submit">회원가입</Button>
        </form>
      </FormWrapper>
    </Container>
  );
};

export default NotaryRegisterPage;
