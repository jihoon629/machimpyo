import React from "react";
import styled from "styled-components";
import {
  FaPhoneAlt,
  FaCommentDots,
  FaPlus,
  FaHandPointer,
  FaLightbulb,
} from "react-icons/fa";

const isNotary = true; // replace with real logic based on user role

const Container = styled.div`
  max-width: 850px;
  margin: 60px auto 40px;
  padding: 0 20px;
`;

const Header = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const NotaryCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 24px;
  margin: 28px 0 40px;
  display: flex;
  flex-direction: column;
  gap: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;
const TopSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
`;

const Info = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Tags = styled.div`
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
`;

const Description = styled.div`
  font-size: 14px;
  color: #444;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
`;

const FilledButtonPrimary = styled.button`
  background-color: #e0e7ff;
  color: #3b4cca;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #3b4cca;
    color: #fff;
  }
`;

const FilledButtonSecondary = styled.button`
  background-color: #e0f0ff;
  color: #1c5d99;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #1c5d99;
    color: #fff;
  }
`;

const QuickIcons = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;

  .label {
    font-size: 14px;
    font-weight: bold;
    margin-right: 8px;
  }
`;

const CircleIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #dee2e6;
  }
`;

const CreateServiceButton = styled.button`
  background: transparent;
  color: #574bff;
  font-weight: 600;
  border: 2px solid #574bff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  float: right;
  margin-top: -8px;

  &:hover {
    background: #574bff;
    color: #fff;
  }
`;

const NotaryServicePage = () => {
  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Header>공증인 목록</Header>
        {isNotary && (
          <CreateServiceButton>
            <FaPlus /> 공증 서비스 등록하기
          </CreateServiceButton>
        )}
      </div>

      {[1, 2, 3].map((n) => (
        <NotaryCard key={n}>
          <TopSection>
            <ProfileSection>
              <LargeProfileImage src="https://randomuser.me/api/portraits/men/32.jpg" />
            </ProfileSection>
            <CardContent>
              <TagRow>
                <FaHandPointer style={{ color: "#f7b500" }} />
                <Tag>예약준수</Tag>
                <FaLightbulb style={{ color: "#f7b500" }} />
                <Tag>해결사</Tag>
              </TagRow>
              <Name>홍길동 변호사</Name>
              <SubInfo>법무법인 정인 | 관련분야 후기 8개</SubInfo>
              <Description>
                &lt;상속 10년차&gt; 상속·재산분할 전문 / 꾸준한 승소전략
              </Description>
              <HashTags>
                <HashTag>#재산분할</HashTag>
                <HashTag>#기여분</HashTag>
              </HashTags>
              <QuickIcons>
                <span className="label">간편 문의</span>
                <CircleIcon>
                  <FaPhoneAlt />
                </CircleIcon>
                <CircleIcon>
                  <FaCommentDots />
                </CircleIcon>
              </QuickIcons>
            </CardContent>
          </TopSection>
          <ConsultBox>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ConsultRow>
                <ConsultLabel>15분 전화상담</ConsultLabel>
                <ConsultPrice>25,000원</ConsultPrice>
              </ConsultRow>
              <div
                style={{
                  height: "32px",
                  width: "1px",
                  backgroundColor: "#ccc",
                  margin: "0 24px",
                }}
              />
              <ConsultRow disabled>
                <ConsultLabel>30분 방문상담</ConsultLabel>
                <ConsultPrice>60,000원</ConsultPrice>
              </ConsultRow>
            </div>
            <ActionButtonsWrapper>
              <ActionButtons>
                <FilledButtonPrimary>상담 예약하기</FilledButtonPrimary>
                <FilledButtonSecondary>공증 신청하기</FilledButtonSecondary>
              </ActionButtons>
            </ActionButtonsWrapper>
          </ConsultBox>
        </NotaryCard>
      ))}
    </Container>
  );
};

// Styled-components for new NotaryCard layout
const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 0px;
`;

const LargeProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
`;

const CardContent = styled.div`
  flex: 1;
`;

const TagRow = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 6px;
  color: #f7b500;
  font-weight: 600;
`;

const Tag = styled.span`
  display: inline-block;
`;

const SubInfo = styled.div`
  font-size: 14px;
  color: #777;
  margin-bottom: 6px;
`;

const HashTags = styled.div`
  display: flex;
  gap: 6px;
  margin: 8px 0;
`;

const HashTag = styled.span`
  background: #f1f3f5;
  color: #333;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
`;

const ConsultBox = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
`;

const ConsultRow = styled.div`
  display: flex;
  flex-direction: column;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const ConsultLabel = styled.div`
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
`;

const ConsultPrice = styled.div`
  font-size: 14px;
`;

const ActionButtonsWrapper = styled.div`
  margin-top: -8px;
`;

export default NotaryServicePage;
