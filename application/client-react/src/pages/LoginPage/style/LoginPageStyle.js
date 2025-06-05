export const MemberTypeToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 0px;
`;

export const ToggleButton = styled.button`
  background: none;
  width: 200px;
  border-radius: 10px;
  border: none;
  font-size: 18px;
  padding: 10px 20px;
  margin-left: 20px;
  margin-right: 20px;
  color: #888;
  cursor: pointer;
  transition: color 0.3s, background-color 0.3s;
  font-weight: normal;

  &.active {
    color: #574bff;
    background-color: #e6eeff;
  }

  &:not(.active):hover {
    color: #574bff;
    background-color: #f0f4ff;
  }
`;
// components/styles/LoginPageStyles.js
import styled from "styled-components";

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  font-family: "Noto Sans KR", sans-serif;
  color: #333;
`;

export const LoginSubtext = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

export const LoginTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

export const LoginLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #ddd;
`;

export const LoginTitleText = styled.div`
  margin: 0 20px;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
`;

export const LoginInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 16px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    border-color: #574bff;
  }
`;

export const LoginOptionGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 400px;
  margin-bottom: 30px;
  font-size: 14px;
  color: #666;
`;

export const LoginOptionItem = styled.div`
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

export const LoginButton = styled.button`
  width: 100%;
  max-width: 420px;
  padding: 18px;
  background-color: #574bff;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 15px;

  &:hover {
    background-color: #4633d6;
  }
`;

export const LoginFindLinks = styled.div`
  font-size: 14px;
  color: #999;
  margin-bottom: 40px;

  a {
    color: inherit;
    text-decoration: none;
    margin: 0 8px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const LoginSignupBox = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 12px;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    color: #574bff;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;
