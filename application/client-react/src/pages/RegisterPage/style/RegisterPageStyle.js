// src/pages/RegisterPage/style/RegisterPageStyle.js
import styled from 'styled-components';

export const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f5f5f5;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  background-color: #fff;
  padding: 40px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 4px;
  color: #333;
`;

export const Title = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

export const Subtitle = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
`;

export const SectionWrapper = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
  background-color: #f5f5f5;
`;

export const SectionHeader = styled.div`
  background-color: #f2f2f2;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
`;

export const SectionContent = styled.div`
  padding: 16px 40px 16px 16px;
  background-color: #fff;
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

export const Label = styled.label`
  flex: 0 0 120px;
  font-size: 14px;

  &.required::after {
    content: ' *';
    color: #e74c3c;
  }
`;

export const Input = styled.input`
  flex: 1 1 0;
  min-width: 80px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 40px;
  box-sizing: border-box;
`;

export const Select = styled.select`
  flex: 1 1 0;
  min-width: 80px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 40px;
  box-sizing: border-box;
  padding-right: 32px;
`;

export const Button = styled.button`
  flex: 0 0 auto;
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #574bff;
  background-color: #fff;
  color: #574bff;
  cursor: pointer;
  border-radius: 4px;
  height: 40px;
  transition: background-color .2s, color .2s;

  &:hover {
    background-color: #574bff;
    color: #fff;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 14px 0;
  background-color: #574bff;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color .2s;

  &:hover {
    background-color: #4633d6;
  }
`;

// 추가 스타일링 (고정 너비 등)
export const AddressRow = styled(Row)`
  flex-wrap: nowrap;

  ${Input}, ${Button} {
    flex: 0 0 120px;
    width: 120px;
  }
`;

export const PhoneRow = styled(Row)`
  flex-wrap: nowrap;

  ${Select} {
    flex: 0 0 80px;
    width: 80px;
  }

  ${Input} {
    flex: 0 0 100px;
    width: 100px;
  }
`;



export const MobileRow = PhoneRow;
