import React from "react";
import {
  Container,
  ProfileSection,
  ProfileImage,
  ProfileInfo,
  CreateButton,
  DocumentList,
  DocumentItem,
  LeftSection,
  CenterSection,
  RightSection,
  DocumentTitle,
  InfoRow,
  HashText,
  CopyIcon,
  Label,
  DocumentInfo,
  ActionButtons,
  EditButton,
  DeleteButton,
  ButtonIcon,
} from "./style/WillListPageStyle";

const WillListPage = () => {
  // 유언장 예시 데이터
  const exampleWills = [
    {
      id: 1,
      title: "김용현의 유언장",
      hash: "0x123456789abcdef",
      blockchainRegistered: true,
      notarized: true,
      viewers: "공영선, 류금태, 나수석",
    },
    {
      id: 2,
      title: "테스트 유언장",
      hash: "0xabcdef123456789",
      blockchainRegistered: true,
      notarized: false,
      viewers: "김용현, 김경기",
    },
    {
      id: 3,
      title: "예비 유언장",
      hash: "0x987654321fedcba",
      blockchainRegistered: false,
      notarized: false,
      viewers: "김현섭",
    },
    {
      id: 4,
      title: "샘플 유언장",
      hash: "0xdeadbeefcafebabe",
      blockchainRegistered: true,
      notarized: true,
      viewers: "이수진, 박지윤, 김민수",
    },
  ];

  return (
    <Container>
      {/* 프로필 섹션 */}
      <ProfileSection>
        <ProfileImage src="/images/back.PNG" alt="프로필" />
        <ProfileInfo>
          <h2>김용현</h2>
          <p>가입일: 2023년 8월</p>
          <p>kim.yh@example.com</p>
        </ProfileInfo>
        {/* 유언장 작성 버튼 */}
        <CreateButton>유언장 작성 시작하기</CreateButton>
      </ProfileSection>

      {/* 유언장 목록 */}
      <DocumentList>
        {exampleWills.map((will) => (
          <DocumentItem key={will.id}>
            {/* 좌측 아이콘 */}
            <LeftSection>📄</LeftSection>

            {/* 중앙 영역: 제목, 해시+복사+상태, 열람자 */}
            <CenterSection>
              <DocumentTitle>{will.title}</DocumentTitle>

              {/* 한줄: 해시 + 복사버튼(이미지) + 상태 태그 */}
              <InfoRow>
                <HashText>{will.hash}</HashText>
                <CopyIcon src="/images/E10.PNG" alt="복사" />
                {will.blockchainRegistered && (
                  <Label $blockchain>블록체인 등록됨</Label>
                )}
                {will.notarized && <Label $notarized>공증 완료</Label>}
              </InfoRow>

              {/* 열람자 정보 */}
              <DocumentInfo>열람자: {will.viewers}</DocumentInfo>
            </CenterSection>

            {/* 우측 수정/삭제 버튼 */}
            <RightSection>
              <ActionButtons>
                {/* 수정 버튼 (이미지 아이콘) */}
                <EditButton>
                  <ButtonIcon src="/images/D2.PNG" alt="수정" />
                  수정하기
                </EditButton>
                {/* 삭제 버튼 (이미지 아이콘) */}
                <DeleteButton>
                  <ButtonIcon src="/images/D3.PNG" alt="삭제" />
                  삭제하기
                </DeleteButton>
              </ActionButtons>
            </RightSection>
          </DocumentItem>
        ))}
      </DocumentList>
    </Container>
  );
};

export default WillListPage;
