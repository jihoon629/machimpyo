import React from 'react';
import { Container } from './Style/Global';
import { useNavigate } from 'react-router-dom';
import {
  HeroSection,
  HeroText,
  HeroTitle,
  HeroDesc,
  ButtonGroup,
  PrimaryButton,
  SecondaryButton,
  HeroCard,
  CardHeader,
  CardTitle,
  CardBox,
  CardFooter
} from './Style/HeroSection';

import {
  StepContainer,
  StepTitle,
  StepDesc,
  StepTimeline,
  StepItem,
  IconCircle,
  StepLabel,
  StepText,
  Connector
} from './Style/StepTimeline';

import {
  WhySection,
  FeatureGrid,
  FeatureCard,
  FeatureIcon
} from './Style/WhySection';

import {
  WillPreviewSection,
  PreviewHeader,
  PreviewTitle,
  PreviewSub,
  PreviewContent,
  PreviewLeft,
  PreviewRight,
  PreviewCard,
  PreviewCardHeader,
  StatusTag,
  PreviewDate,
  PreviewCardTitle,
  PreviewCardBody,
  PreviewCardFooter,
  PreviewTag,
  TagLabel,
  TagValue,
  PreviewInfoBlock
} from './Style/WillPreviewSection';

import {
  TestimonialSection,
  TestimonialHeader,
  TestimonialTitle,
  TestimonialSub,
  TestimonialGrid,
  TestimonialCard,
  UserInfo,
  UserAvatar,
  UserMeta,
  UserName,
  UserJob,
  UserQuote
} from './Style/TestimonialsSection';

import {
  GetStartSection,
  GetStartTitle,
  GetStartSub,
  GetStartGrid,
  GuideBlock,
  FaqBlock,
  GuideTitle,
  GuideItem,
  GuideIcon,
  GuideText,
  GuideTextTitle,
  GuideTextSub,
  CtaBox,
  CtaButton,
  FaqTitle,
  FaqQuestion,
  FaqQuestionTitle,
  FaqQuestionText,
  SectionDivider,
  InquiryBox,
  InquiryText,
  InquiryTitle,
  InquirySub,
  InquiryButton,
  LegalFooterNote
} from './Style/GetStartSection';

  const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    { title: "블록체인으로 위변조 방지", desc: "기록된 유언장은 변경이 불가해 위변조 걱정이 없습니다.", image: "/images/B1.PNG" },
    { title: "법적 효력 연동", desc: "공증 및 인증 기관과 연동하여 법적 효력을 인정받습니다.", image: "/images/B2.PNG" },
    { title: "가족 간 분쟁 예방", desc: "명확하고 안전하게 전달되어 분쟁을 예방합니다.", image: "/images/B3.PNG" },
    { title: "암호화된 보안", desc: "블록체인 기반 저장과 암호화 열람으로 보안이 강화됩니다.", image: "/images/B4.PNG" },
    { title: "분산 저장 시스템", desc: "유언장을 안전하게 여러 네트워크에 분산 저장합니다.", image: "/images/B5.PNG" },
    { title: "유언장 접근 제한", desc: "열람 권한이 있는 사용자만 접근 가능하게 설정됩니다.", image: "/images/B6.PNG" },
  ];

  return (
    <Container id="service">
      <HeroSection>
        <HeroText>
          <HeroTitle>
            당신의 마지막 뜻,<br />
            <span>안전하게 남기는</span> 가장 현대적인 방법.
          </HeroTitle>
          <HeroDesc>
            마침표는 블록체인 기반 유언장 공증 플랫폼입니다. <br />
            지정한 사람만 열람 가능한, 위조 걱정 없는 유언장을 남겨보세요.
          </HeroDesc>
          <ButtonGroup>
            <PrimaryButton onClick={() => navigate('/write')}>유언장 작성 시작하기</PrimaryButton>
            <SecondaryButton>서비스 소개 보기</SecondaryButton>
          </ButtonGroup>
        </HeroText>
        <HeroCard>
          <CardHeader>임시화면</CardHeader>
          <CardTitle>나의 마지막 유언장</CardTitle>
          <CardBox>블록체인으로 안전하게 보호됨</CardBox>
          <CardFooter>
            <div>지정 열람자: 3명</div>
            <div>공증 상태: 완료</div>
          </CardFooter>
        </HeroCard>
      </HeroSection>

      {/* 이후 섹션: StepTimeline, Why, Preview, Testimonial, GetStart 계속 이어짐 (다음 메시지에 이어서) */}
      <StepContainer id="features">
        <StepTitle>서비스 작동 원리</StepTitle>
        <StepDesc>
          마침표는 최신 블록체인 기술을 활용하여 당신의 소중한 유언을 안전하게 보호하고 전달합니다.
        </StepDesc>

        <StepTimeline>
          <StepItem>
            <IconCircle>📄</IconCircle>
            <StepLabel>유언장 작성</StepLabel>
            <StepText>간단한 인터페이스를 통해 디지털 유언장을 작성합니다.</StepText>
            <Connector>→</Connector>
          </StepItem>
          <StepItem>
            <IconCircle>🖋️</IconCircle>
            <StepLabel>공증 연동</StepLabel>
            <StepText>블록체인 기술로 유언장의 진위와 법적 효력을 부여합니다.</StepText>
            <Connector>→</Connector>
          </StepItem>
          <StepItem>
            <IconCircle>👥</IconCircle>
            <StepLabel>열람자 지정</StepLabel>
            <StepText>귀하의 유언장을 열람할 수 있는 사람을 직접 지정합니다.</StepText>
            <Connector>→</Connector>
          </StepItem>
          <StepItem>
            <IconCircle>🔐</IconCircle>
            <StepLabel>사망 시 자동 열람</StepLabel>
            <StepText>사전 설정된 조건에 따라 지정된 사람에게만 유언장이 공개됩니다.</StepText>
          </StepItem>
        </StepTimeline>
      </StepContainer>

      <WhySection>
        <StepTitle>왜 마침표인가요?</StepTitle>
        <StepDesc>
          신뢰할 수 있는 기술과 절차를 통해 삶의 마지막을 위한 최적의 유언 솔루션을 제공합니다.
        </StepDesc>
        <FeatureGrid>
          {features.map((item, i) => (
            <FeatureCard key={i}>
              <FeatureIcon src={item.image} alt={item.title} />
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </WhySection>

      <WillPreviewSection>
        <PreviewHeader>
          <PreviewTitle>유언장 미리보기</PreviewTitle>
          <PreviewSub>
            마침표의 디지털 유언장은 직관적인 인터페이스로 중요한 정보를<br />
            한눈에 확인할 수 있습니다.
          </PreviewSub>
        </PreviewHeader>

        <PreviewContent>
          <PreviewLeft>
            <PreviewCard>
              <PreviewCardHeader>
                <StatusTag>
                  <img src="/images/C1.PNG" alt="암호화됨" />
                  암호화됨
                </StatusTag>
                <PreviewDate>
                  <img src="/images/C2.PNG" alt="날짜" />
                  2023년 10월 15일
                </PreviewDate>
              </PreviewCardHeader>

              <PreviewCardTitle>가족에게 남기는 마지막 이야기</PreviewCardTitle>
              <PreviewCardBody>
                <img src="/images/C3.PNG" alt="문서 아이콘" width="32" height="32" />
                <span>암호화된 유언장 내용</span>
              </PreviewCardBody>

              <PreviewCardFooter>
                <PreviewTag>
                  <TagLabel>
                    <img src="/images/C4.PNG" alt="열람자" />
                    지정 열람자
                  </TagLabel>
                  <TagValue>3명</TagValue>
                </PreviewTag>
                <PreviewTag>
                  <TagLabel>
                    <img src="/images/C5.PNG" alt="공증 상태" />
                    공증 상태
                  </TagLabel>
                  <TagValue verified>완료</TagValue>
                </PreviewTag>
              </PreviewCardFooter>
            </PreviewCard>
          </PreviewLeft>

          <PreviewRight>
            <PreviewInfoBlock>
              <h4>맞춤형 유언장 카드</h4>
              <p>
                마침표의 유언장 카드는 중요한 정보를 한눈에 볼 수 있도록 설계되었습니다. <br />
                지정 열람자 수, 유언장 제목, 작성 날짜, 보안 상태 등 필수 정보를 직관적으로 확인할 수 있습니다.
              </p>
            </PreviewInfoBlock>
            <PreviewInfoBlock>
              <h4>안전한 보관</h4>
              <p>
                블록체인 기술을 활용한 분산 저장 방식으로 데이터 손실 걱정 없이 영구적으로 보관됩니다. <br />
                암호화 기술로 보호되어 지정된 조건이 충족될 때만 열람이 가능합니다.
              </p>
            </PreviewInfoBlock>
            <PreviewInfoBlock>
              <h4>쉬운 관리</h4>
              <p>
                언제든지 내용을 수정하거나 열람자를 변경할 수 있으며, 변경 이력은 모두 안전하게 기록됩니다. <br />
                유언장 작성과 관리가 이보다 더 쉬울 수 없습니다.
              </p>
            </PreviewInfoBlock>
          </PreviewRight>
        </PreviewContent>
      </WillPreviewSection>
      <TestimonialSection id="review">
        <TestimonialHeader>
          <TestimonialTitle>사용자 이야기</TestimonialTitle>
          <TestimonialSub>
            마침표를 통해 소중한 가족의 미래를 준비한 사용자들의 실제 경험을 들어보세요.
          </TestimonialSub>
        </TestimonialHeader>

        <TestimonialGrid>
          {[
            {
              name: "김민수",
              job: "40대 회사원",
              image: "/images/kim.PNG",
              quote:
                "아버지가 남기신 말 한 마디, 우리 가족 모두가 함께 들을 수 있었어요. 마침표 덕분에 아버지의 마지막 뜻을 명확히 알 수 있었습니다.",
            },
            {
              name: "이지현",
              job: "50대 자영업자",
              image: "/images/ei.PNG",
              quote:
                "복잡한 상속 문제로 가족 간 갈등이 있었는데, 마침표를 통해 작성한 유언장 덕분에 모든 것이 명확해졌어요. 이제 마음의 평화를 찾았습니다.",
            },
            {
              name: "박준호",
              job: "30대 IT 전문가",
              image: "/images/back.PNG",
              quote:
                "기술에 익숙하지 않은 부모님을 위해 마침표를 소개해드렸어요. 너무 쉬운 인터페이스에 부모님도 직접 사용하실 수 있었고, 이제 가족 모두 안심하고 있습니다.",
            },
          ].map((user, index) => (
            <TestimonialCard key={index}>
              <UserInfo>
                <UserAvatar src={user.image} alt={user.name} />
                <UserMeta>
                  <UserName>{user.name}</UserName>
                  <UserJob>{user.job}</UserJob>
                </UserMeta>
              </UserInfo>
              <UserQuote>"{user.quote}"</UserQuote>
            </TestimonialCard>
          ))}
        </TestimonialGrid>
      </TestimonialSection>

      <GetStartSection id="faq">
        <GetStartTitle>시작하기</GetStartTitle>
        <GetStartSub>마침표와 함께 소중한 유언을 안전하게 남기는 방법을 알아보세요.</GetStartSub>
        <GetStartGrid>
          {/* 왼쪽: 가이드 */}
          <GuideBlock>
            <GuideTitle>간단한 시작 가이드</GuideTitle>

            <GuideItem>
              <GuideIcon src="/images/A1.PNG" alt="지갑 등록" />
              <GuideText>
                <GuideTextTitle>지갑 등록</GuideTextTitle>
                <GuideTextSub>블록체인 지갑을 연결하여 신원을 안전하게 인증합니다.</GuideTextSub>
              </GuideText>
            </GuideItem>

            <GuideItem>
              <GuideIcon src="/images/A2.PNG" alt="유언장 생성" />
              <GuideText>
                <GuideTextTitle>테스트 유언장 생성</GuideTextTitle>
                <GuideTextSub>무료로 테스트 유언장을 작성해보세요.</GuideTextSub>
              </GuideText>
            </GuideItem>

            <GuideItem>
              <GuideIcon src="/images/A3.PNG" alt="공증 요청" />
              <GuideText>
                <GuideTextTitle>공증 요청</GuideTextTitle>
                <GuideTextSub>작성한 유언장에 법적 효력을 부여하세요.</GuideTextSub>
              </GuideText>
            </GuideItem>

            <CtaBox>
              <h4>마침표와 함께 시작하세요</h4>
              <p>지금 바로 무료 테스트 유언장을 작성해보세요.</p>
              <CtaButton>무료로 시작하기</CtaButton>
            </CtaBox>
          </GuideBlock>

          {/* 오른쪽: FAQ + 문의 */}
          <FaqBlock>
            <FaqTitle>
              <img src="/images/D1.PNG" alt="자주 묻는 질문" />
              자주 묻는 질문
            </FaqTitle>

            <FaqQuestion>
              <FaqQuestionTitle>마침표의 유언장은 법적 효력이 있나요?</FaqQuestionTitle>
              <FaqQuestionText>네, 공증 시스템과 연동되어 법적 효력을 갖습니다.</FaqQuestionText>
            </FaqQuestion>
            <SectionDivider />

            <FaqQuestion>
              <FaqQuestionTitle>유언장 내용을 나중에 수정할 수 있나요?</FaqQuestionTitle>
              <FaqQuestionText>네, 수정 시마다 변경 이력이 안전하게 기록됩니다.</FaqQuestionText>
            </FaqQuestion>
            <SectionDivider />

            <FaqQuestion>
              <FaqQuestionTitle>지정 열람자는 어떻게 설정하나요?</FaqQuestionTitle>
              <FaqQuestionText>작성 과정에서 이메일 주소를 입력해 설정할 수 있습니다.</FaqQuestionText>
            </FaqQuestion>

            <InquiryBox>
              <InquiryText>
                <InquiryTitle>더 궁금한 점이 있으신가요?</InquiryTitle>
                <InquirySub>언제든지 문의해주세요.</InquirySub>
              </InquiryText>
              <InquiryButton>문의하기</InquiryButton>
            </InquiryBox>
          </FaqBlock>
        </GetStartGrid>

        <LegalFooterNote>
          마침표는 공신력 있는 기관들과 협력하여 서비스의 신뢰성과 안전성을 보장합니다.
        </LegalFooterNote>
      </GetStartSection>
    </Container>
  );
};

export default HomePage;
