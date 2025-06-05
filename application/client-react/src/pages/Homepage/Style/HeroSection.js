// components/styles/HeroSectionStyles.js
import styled from 'styled-components';

export const HeroSection = styled.section`
  display: flex;
  background-color: #f5f7ff;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 120px 40px 100px;
  max-width: 1280px;
  margin: 0 auto;
  gap: 40px;
`;

export const HeroText = styled.div`
  flex: 1;
  min-width: 320px;
`;

export const HeroTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  line-height: 1.5;
  color: #1f2937;

  span {
    color: #6366f1;
  }
`;

export const HeroDesc = styled.p`
  margin-top: 20px;
  font-size: 18px;
  color: #6b7280;
  line-height: 1.8;
`;

export const ButtonGroup = styled.div`
  margin-top: 36px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  background: #6366f1;
  color: white;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
`;

export const SecondaryButton = styled.button`
  background: transparent;
  color: #6366f1;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border: 2px solid #6366f1;
  border-radius: 10px;
  cursor: pointer;
`;

export const HeroCard = styled.div`
  flex: 0.9;
  min-width: 300px;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  padding: 28px;
`;

export const CardHeader = styled.div`
  font-size: 13px;
  color: #4f46e5;
  font-weight: bold;
  margin-bottom: 8px;
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
`;

export const CardBox = styled.div`
  background: #f3f4f6;
  border-radius: 10px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
  margin-bottom: 16px;
`;

export const CardFooter = styled.div`
  font-size: 13px;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
`;
