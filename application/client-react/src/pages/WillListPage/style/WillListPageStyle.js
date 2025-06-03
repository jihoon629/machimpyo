import styled from "styled-components";

export const Container = styled.div`
  /* 전체 컨테이너 부분 */  
  width: 70%;
  margin: 0 auto; 
  padding: 20px;
  background-color: #f9fafb;
  min-height: 100vh;
  font-family: "Pretendard", sans-serif;
`;

export const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

export const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
`;

export const ProfileInfo = styled.div`
  flex: 1;
  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
  }
  p {
    margin: 2px 0;
    color: #666;
    font-size: 0.9rem;
  }
`;

export const CreateButton = styled.button`
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: #3f3bd9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const DocumentItem = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid #e0e0e0;
    background: #fafafa;
  }
`;

export const LeftSection = styled.div`
  width: 40px;
  font-size: 1.5rem;
  text-align: center;
`;

export const CenterSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 20px;
`;

export const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const DocumentTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const HashText = styled.span`
  font-size: 0.85rem;
  color: #333;
  word-break: break-all;
`;

export const CopyIcon = styled.img`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

export const Label = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  letter-spacing: 0.2px;
  ${(props) =>
    props.$blockchain &&
    `
    background-color: #e0f7fa;
    color: #00796b;
  `}
  ${(props) =>
    props.$notarized &&
    `
    background-color: #c8e6c9;
    color: #388e3c;
  `}
`;

export const DocumentInfo = styled.p`
  margin: 0;
  color: #555;
  font-size: 0.85rem;
`;

export const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ButtonIcon = styled.img`
  width: 16px;
  height: 16px;
`;

export const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #1976d2;
  border: 2px solid #1976d2;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #1976d2;
    color: #fff;
  }

  &:active {
    transform: scale(0.97);
  }
`;

export const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #d32f2f;
  border: 2px solid #d32f2f;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #d32f2f;
    color: #fff;
  }

  &:active {
    transform: scale(0.97);
  }
`;

