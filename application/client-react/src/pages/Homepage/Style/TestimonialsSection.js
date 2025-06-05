// components/styles/TestimonialsSectionStyles.js
import styled from 'styled-components';

export const TestimonialSection = styled.section`
  background: #f9fafa;
  padding: 100px 40px;
  text-align: center;
`;

export const TestimonialHeader = styled.div`
  margin-bottom: 60px;
`;

export const TestimonialTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
`;

export const TestimonialSub = styled.p`
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
`;

export const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 20px;
`;

export const TestimonialCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  text-align: left;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

export const UserAvatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
`;

export const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

export const UserName = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
`;

export const UserJob = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

export const UserQuote = styled.p`
  font-size: 16px;
  color: #374151;
  line-height: 1.7;
  white-space: pre-line;
`;
