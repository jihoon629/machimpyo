import React, { useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";
import {
  LoginSubtext,
  LoginTitleWrapper,
  LoginLine,
  LoginTitleText,
} from "../LoginPage/style/LoginPageStyle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { format } from "date-fns";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafc;
  padding: 40px 20px;
  font-family: "Noto Sans KR", sans-serif;
`;

const FormWrapper = styled.div`
  background-color: #fff;
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 0 24px rgb(0 0 0 / 0.1);
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  color: #a1a9b8;
  font-size: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 20px 14px 52px;
  border-radius: 10px;
  border: 1px solid #e4e6ee;
  font-size: 16px;
  font-weight: 400;
  font-family: "Noto Sans KR", sans-serif;
  color: #222;
  background-color: #f8f9ff;
  outline: none;
  transition: border-color 0.3s ease;
  &:focus {
    border-color: #574bff;
    background-color: #fff;
  }
  &::placeholder {
    color: #bdbdbd;
  }
`;

const Button = styled.button`
  background-color: #574bff;
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  border-radius: 12px;
  border: none;
  padding: 16px 0;
  cursor: pointer;
  font-family: "Noto Sans KR", sans-serif;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #4633d6;
  }
  &:active {
    background-color: #3627b9;
  }
`;

const GenderToggleWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
`;

const GenderButton = styled.button`
  flex: 1;
  padding: 12px 0;
  border: 1px solid ${({ active }) => (active ? "#574bff" : "#ddd")};
  background-color: ${({ active }) => (active ? "#eef0ff" : "#fff")};
  color: ${({ active }) => (active ? "#2d3282" : "#555")};
  font-weight: ${({ active }) => (active ? "600" : "400")};
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
`;

const ConsentWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #444;
  gap: 10px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #574bff;
  cursor: pointer;
`;

const PersonalRegisterPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    birthdate: "",
    gender: "MAN",
    agreeTerms: false,
    agreePrivacy: false,
    marketingConsent: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "birthdate") return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheck = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleBirthdateChange = (date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setForm((prev) => ({ ...prev, birthdate: formattedDate }));
    } else {
      setForm((prev) => ({ ...prev, birthdate: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestBody = {
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone,
      birthdate: form.birthdate,
      gender: form.gender,
      agreeTerms: form.agreeTerms,
      agreePrivacy: form.agreePrivacy,
      marketingConsent: form.marketingConsent,
      role: "USER",
    };
    console.log("회원가입 요청:", requestBody);
    // dispatch(registerUser({ values: form, navigate })) // Uncomment and import dispatch and navigate as needed
  };

  return (
    <Container>
      <LoginSubtext>블록체인 기반 유언장 공증 플랫폼</LoginSubtext>
      <LoginTitleWrapper>
        <LoginLine />
        <LoginTitleText>마침표</LoginTitleText>
        <LoginLine />
      </LoginTitleWrapper>
      <LoginSubtext>일반 사용자 회원가입</LoginSubtext>
      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <FormWrapper>
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

          <GenderToggleWrapper>
            <GenderButton
              type="button"
              active={form.gender === "MAN"}
              onClick={() => setForm({ ...form, gender: "MAN" })}
            >
              남성
            </GenderButton>
            <GenderButton
              type="button"
              active={form.gender === "WOMAN"}
              onClick={() => setForm({ ...form, gender: "WOMAN" })}
            >
              여성
            </GenderButton>
          </GenderToggleWrapper>

          <InputWrapper>
            <StyledIcon icon={faUser} />
            <div style={{ width: "100%" }}>
              <DatePicker
                selected={form.birthdate ? new Date(form.birthdate) : null}
                onChange={handleBirthdateChange}
                locale={ko}
                dateFormat="yyyy-MM-dd"
                placeholderText="생년월일 선택"
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                customInput={
                  <Input style={{ paddingLeft: "52px", width: "100%" }} />
                }
                isClearable
                required
              />
            </div>
          </InputWrapper>

          <ConsentWrapper>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleCheck}
                required
              />
              <span>이용약관에 동의합니다.</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                name="agreePrivacy"
                checked={form.agreePrivacy}
                onChange={handleCheck}
                required
              />
              <span>개인정보 처리방침에 동의합니다.</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                name="marketingConsent"
                checked={form.marketingConsent}
                onChange={handleCheck}
              />
              <span>마케팅 정보 수신에 동의합니다. (선택)</span>
            </CheckboxLabel>
          </ConsentWrapper>

          <Button type="submit">회원가입</Button>
        </FormWrapper>
      </form>
    </Container>
  );
};

export default PersonalRegisterPage;
