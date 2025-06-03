// components/styles/GetStartSectionStyles.js
import styled from 'styled-components';

export const GuideText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const GuideTextTitle = styled.strong`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

export const GuideTextSub = styled.p`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
`;

export const GuideIcon = styled.img`
  width: 32px;
  height: 32px;
`;

export const GetStartSection = styled.section`
  background: white;
  padding: 100px 40px;
`;

export const InquiryBox = styled.div`
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 24px 32px;
  margin-top: 40px;
`;

export const InquiryText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InquiryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

export const InquirySub = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

export const InquiryButton = styled.button`
  background-color: #6366f1;
  color: white;
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
`;

export const GetStartTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 12px;
  color: #111827;
`;

export const GetStartSub = styled.p`
  text-align: center;
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 60px;
`;

export const GetStartGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
`;

export const GuideBlock = styled.div`
  flex: 1;
  min-width: 300px;
`;

export const FaqBlock = styled.div`
  flex: 1;
  min-width: 300px;
`;

export const GuideTitle = styled.h4`
  font-size: 25px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #111827;
`;

export const GuideItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
`;

export const GuideItemIcon = styled.div`
  font-size: 20px;
  line-height: 1;
  margin-top: 3px;
`;

export const GuideItemText = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
`;

export const CtaBox = styled.div`
  background: linear-gradient(to right, #6366f1, #818cf8);
  padding: 24px;
  border-radius: 16px;
  margin-top: 36px;
  color: white;

  h4 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  p {
    font-size: 14px;
    margin-bottom: 12px;
  }
`;

export const CtaButton = styled.button`
  background: white;
  color: #4f46e5;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: none;
  cursor: pointer;
`;

export const FaqTitle = styled.h4`
  font-size: 25px;
  font-weight: 700;
  margin-bottom: 24px;
`;

export const FaqQuestion = styled.div`
  margin-bottom: 24px;
`;

export const FaqQuestionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

export const FaqQuestionText = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
`;

export const FaqButton = styled.button`
  background: white;
  border: 1.5px solid #4f46e5;
  color: #4f46e5;
  font-weight: 500;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 8px;
  margin-top: 24px;
  cursor: pointer;
`;

export const LegalFooterNote = styled.div`
  background-color: #f1f4ff;
  text-align: center;
  padding: 24px;
  margin-top: 60px;
  font-size: 14px;
  color: #6b7280;
  border-radius: 12px;
`;

export const SectionDivider = styled.hr`
  border: none;
  height: 2px;
  background-color: #bfc0c2;
  margin: 40px 0;
`;
