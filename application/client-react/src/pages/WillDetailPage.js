import React from "react";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaDownload,
  FaPen,
  FaTrashAlt,
  FaUserFriends,
  FaLock,
  FaShieldAlt,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";

const WillDetailPage = () => {
  // Simulated backend data (to be replaced with actual props or state in future)
  const viewerCount = 3;
  const isBlockchainSecured = true;
  const isEncrypted = true;

  return (
    <Container>
      <SummaryCard>
        <SummaryTop>
          <div>
            <SummaryTitle>가족에게 남기는 마지막 이야기</SummaryTitle>
            <SummaryBadge>
              <FaCheckCircle style={{ marginRight: "6px" }} />
              공증 완료
            </SummaryBadge>
          </div>
          <ButtonGroup>
            <EditButton>
              <FaPen style={{ marginRight: "6px" }} />
              수정하기
            </EditButton>
            <DeleteButton>
              <FaTrashAlt style={{ marginRight: "6px" }} />
              삭제하기
            </DeleteButton>
          </ButtonGroup>
        </SummaryTop>
        <SummaryInfoRow>
          <SummaryText>작성일: 2023년 10월 15일</SummaryText>
          <Dot>·</Dot>
          <SummaryText>최종 수정일: 2023년 11월 20일</SummaryText>
        </SummaryInfoRow>
        <SummaryMetaRow>
          <MetaBadge>
            <FaUserFriends style={{ marginRight: "6px" }} />
            열람자 {viewerCount}명
          </MetaBadge>
          <MetaBadge>
            <FaShieldAlt style={{ marginRight: "6px" }} />
            {isBlockchainSecured ? "블록체인 보호됨" : "블록체인 미적용"}
          </MetaBadge>
          <MetaBadge>
            <FaLock style={{ marginRight: "6px" }} />
            {isEncrypted ? "암호화 저장됨" : "암호화되지 않음"}
          </MetaBadge>
        </SummaryMetaRow>
      </SummaryCard>

      <TwoColumn>
        <LeftColumn>
          <Card>
            <SectionTitle>유언장 내용</SectionTitle>
            <Paragraph>사랑하는 가족들에게,</Paragraph>
            <SubTitle>1. 재산 분배에 관하여</SubTitle>
            <List>
              <li>서울시 강남구 소재 아파트는 아내 김미란에게 상속</li>
              <li>회사 지분 및 주식은 자녀들에게 균등 분배</li>
            </List>
            <SubTitle>2. 기타 유언 사항</SubTitle>
            <List>
              <li>가족 간 우애를 지키며 살아가기를 바랍니다</li>
              <li>서로를 이해하고 배려하는 마음을 잊지 않기를 바랍니다</li>
            </List>
          </Card>

          <Card>
            <SectionTitle>첨부 문서</SectionTitle>
            <DocList>
              <DocItem>
                <DocInfo>
                  <FaFileAlt size={16} style={{ marginRight: "8px" }} />
                  <span>부동산등기부등본.pdf</span>
                </DocInfo>
                <DocMeta>
                  <span>2.3MB</span>
                  <a href="/files/부동산등기부등본.pdf" download>
                    <FaDownload color="#6366f1" style={{ marginLeft: "8px" }} />
                  </a>
                </DocMeta>
              </DocItem>
              <DocItem>
                <DocInfo>
                  <FaFileAlt size={16} style={{ marginRight: "8px" }} />
                  <span>주식분유언장.pdf</span>
                </DocInfo>
                <DocMeta>
                  <span>1.1MB</span>
                  <a href="/files/주식분유언장.pdf" download>
                    <FaDownload color="#6366f1" style={{ marginLeft: "8px" }} />
                  </a>
                </DocMeta>
              </DocItem>
            </DocList>
          </Card>

          <Card>
            <SectionTitle>변경 이력</SectionTitle>
            <HistoryList>
              <HistoryItem>
                <FaClock style={{ marginRight: "8px", color: "#6b7280" }} />
                <span>2023.11.20 - 공증 완료</span>
              </HistoryItem>
              <HistoryItem>
                <FaClock style={{ marginRight: "8px", color: "#6b7280" }} />
                <span>2023.11.15 - 공증 신청</span>
              </HistoryItem>
              <HistoryItem>
                <FaClock style={{ marginRight: "8px", color: "#6b7280" }} />
                <span>2023.10.20 - 내용 수정</span>
              </HistoryItem>
              <HistoryItem>
                <FaClock style={{ marginRight: "8px", color: "#6b7280" }} />
                <span>2023.10.15 - 최초 작성</span>
              </HistoryItem>
            </HistoryList>
          </Card>
        </LeftColumn>

        <RightColumn>
          <Card>
            <FlexHeader>
              <SectionTitle>지정 열람자</SectionTitle>
              <ManageLink>관리하기</ManageLink>
            </FlexHeader>
            <ViewerBox approved>
              <div>
                <strong>김미란</strong> <SubLabel>배우자</SubLabel>
              </div>
              <Status approved>승인됨</Status>
            </ViewerBox>
            <ViewerBox approved>
              <div>
                <strong>김지훈</strong> <SubLabel>자녀</SubLabel>
              </div>
              <Status approved>승인됨</Status>
            </ViewerBox>
            <ViewerBox>
              <div>
                <strong>김서연</strong> <SubLabel>자녀</SubLabel>
              </div>
              <Status>대기중</Status>
            </ViewerBox>
          </Card>

          <Card>
            <SectionTitle>공증 상태</SectionTitle>
            <NotarizeStatus>
              <FaCheckCircle style={{ color: "#10b981", marginRight: "6px" }} />
              <span>공증 완료</span>
            </NotarizeStatus>
            <MetaLine>공증번호: #23-1120-789</MetaLine>
            <MetaLine>공증일시: 2023년 11월 20일</MetaLine>
            <DownloadButton>공증서 다운로드</DownloadButton>
          </Card>

          <Card>
            <SectionTitle>보안 정보</SectionTitle>
            <SecureInfo>
              <InfoRow>
                <span>블록체인 해시</span>
                <span>baf3...e92f</span>
              </InfoRow>
              <InfoRow>
                <span>암호화 방식</span>
                <span>AES-256</span>
              </InfoRow>
              <InfoRow>
                <span>최종 백업</span>
                <span>5분 전</span>
              </InfoRow>
            </SecureInfo>
          </Card>
        </RightColumn>
      </TwoColumn>
    </Container>
  );
};

export default WillDetailPage;

// ----------------- STYLE -----------------

const Container = styled.div`
  padding: 32px;
  font-family: "Noto Sans KR", sans-serif;
  background-color: #f9fafb;
  max-width: 1024px;
  margin: 0 auto;
`;

/* Removed old HeaderContainer, HeaderBox, HeaderTopRow, StatusBadge, HeaderInfoRow */

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const EditButton = styled.button`
  background-color: transparent;
  color: #3b82f6;
  padding: 8px 12px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s;
  &:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }
`;

const DeleteButton = styled.button`
  background-color: transparent;
  color: #ef4444;
  padding: 8px 12px;
  border: 1px solid #ef4444;
  border-radius: 6px;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s;
  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }
`;

const TwoColumn = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RightColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const SubTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin-top: 16px;
`;

const Paragraph = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
`;

const List = styled.ul`
  font-size: 14px;
  padding-left: 20px;
  line-height: 1.6;
  color: #374151;
`;

const DocList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DocInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
`;

const DocMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #6b7280;
`;

const DocItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
`;

const ViewerItem = styled.div`
  font-size: 14px;
  padding: 8px;
  background-color: ${({ approved }) => (approved ? "#ecfdf5" : "#fef2f2")};
  border: 1px solid ${({ approved }) => (approved ? "#10b981" : "#fca5a5")};
  color: ${({ approved }) => (approved ? "#065f46" : "#991b1b")};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const DownloadButton = styled.button`
  background-color: #10b981;
  color: white;
  padding: 8px 12px;
  margin-top: 12px;
  border: none;
  border-radius: 6px;
`;

const MetaIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Badge style for meta info row
const MetaBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #f3f4f6;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const Dot = styled.span`
  font-size: 12px;
  color: #d1d5db;
`;

// New styled components for SummaryCard

const SummaryCard = styled.div`
  background-color: #fff;
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const SummaryTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const SummaryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #ecfdf5;
  color: #059669;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
`;

const SummaryInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #6b7280;
`;

const SummaryMetaRow = styled.div`
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #6b7280;
`;

const SummaryText = styled.span``;

// --------- New Styled Components for RightColumn ---------

const FlexHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ManageLink = styled.span`
  font-size: 14px;
  color: #6366f1;
  font-weight: 500;
  cursor: pointer;
`;

const ViewerBox = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: ${({ approved }) => (approved ? "#f0fdf4" : "#fff7ed")};
  border: 1px solid ${({ approved }) => (approved ? "#34d399" : "#fbbf24")};
  color: ${({ approved }) => (approved ? "#065f46" : "#92400e")};
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  margin-bottom: 8px;
`;

const SubLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  margin-left: 8px;
`;

const Status = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ approved }) => (approved ? "#10b981" : "#f97316")};
`;

const NotarizeStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #ecfdf5;
  color: #059669;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
`;

const MetaLine = styled.p`
  font-size: 14px;
  color: #4b5563;
  margin: 4px 0;
`;

const SecureInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #fdfefe;
  border: 1px solid #f0f1f3;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
`;
