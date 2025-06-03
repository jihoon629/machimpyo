// components/styles/WillPreviewSectionStyles.js
import styled from 'styled-components';

export const WillPreviewSection = styled.section`
  background: white;
  padding: 120px 40px;
`;

// 제목 및 설명
export const PreviewHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

export const PreviewTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

export const PreviewSub = styled.p`
  font-size: 16px;
  color: #6b7280;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
`;

// 본문 구성
export const PreviewContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
  gap: 80px;
  flex-wrap: wrap;
  text-align: left;
`;

export const PreviewLeft = styled.div`
  flex: 1;
  min-width: 360px;
  display: flex;
  justify-content: center;
`;

export const PreviewRight = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

// 카드
export const PreviewCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  padding: 24px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
`;

export const PreviewCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 16px;
`;

export const StatusTag = styled.span`
  background-color: #ecfdf5;
  color: #059669;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export const PreviewDate = styled.span`
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const PreviewCardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
`;

export const PreviewCardBody = styled.div`
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #9ca3af;
  font-size: 14px;
  gap: 8px;
  margin-bottom: 16px;
`;

export const PreviewCardFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PreviewTag = styled.div`
  background-color: #eef2ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  color: #4b5563;
`;

export const TagLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

export const TagValue = styled.span`
  font-weight: 700;
  color: ${props => (props.verified ? '#10b981' : '#4b5563')};
`;

// 우측 설명
export const PreviewInfoBlock = styled.div`
  h4 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #111827;
  }

  p {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.7;
  }
`;
