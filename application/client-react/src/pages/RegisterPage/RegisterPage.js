import React, { useState } from 'react';
import {
  PageWrapper, Content, Title, Subtitle,
  SectionWrapper, SectionHeader, SectionContent,
  Row, Label, Input, Select, Button, SubmitButton,
  AddressRow, PhoneRow, MobileRow
} from './style/RegisterPageStyle';

const RegisterPage = () => {
  const [memberType, setMemberType] = useState('personal');
  const [gender, setGender] = useState('male');

  return (
    <PageWrapper>
      <Content>
        <Title>가입을 시작합니다.</Title>
        <Subtitle>마침표에 오신것을 환영합니다.</Subtitle>

        {/* 회원인증 */}
        <SectionWrapper>
          <SectionHeader>
            <span>회원인증</span>
          </SectionHeader>
          <SectionContent>
            <Row>
              <Label as="span">회원 유형</Label>
              <label>
                <input
                  type="radio"
                  name="memberType"
                  value="personal"
                  checked={memberType === 'personal'}
                  onChange={() => setMemberType('personal')}
                /> 개인회원
              </label>
            </Row>
          </SectionContent>
        </SectionWrapper>

        {/* 기본정보 */}
        <SectionWrapper>
          <SectionHeader>
            <span>기본정보</span>
            <span style={{ color: '#e74c3c', fontSize: '12px' }}>필수</span>
          </SectionHeader>
          <SectionContent>
            {[
              { label: '아이디', type: 'text', placeholder: '아이디 입력', required: true },
              { label: '비밀번호', type: 'password', placeholder: '비밀번호 입력', required: true },
              { label: '비밀번호 확인', type: 'password', placeholder: '비밀번호 재입력', required: true },
              { label: '이름', type: 'text', placeholder: '이름 입력', required: true },
            ].map((field, idx) => (
              <Row key={idx}>
                <Label className={field.required ? 'required' : ''}>{field.label}</Label>
                <Input type={field.type} placeholder={field.placeholder} />
              </Row>
            ))}

            <AddressRow>
              <Label>주소</Label>
              <Input type="text" placeholder="우편번호" />
              <Button type="button">주소검색</Button>
            </AddressRow>
            <Row>
              <Label />
              <Input type="text" placeholder="기본주소" />
            </Row>
            <Row>
              <Label />
              <Input type="text" placeholder="나머지 주소(선택 입력 가능)" />
            </Row>

            <PhoneRow>
              <Label>일반전화</Label>
              <Select><option>02</option><option>031</option><option>010</option></Select>
              <Input type="text" />
              <Input type="text" />
            </PhoneRow>

            <MobileRow>
              <Label className="required">휴대전화</Label>
              <Select><option>010</option><option>011</option></Select>
              <Input type="text" />
              <Input type="text" />
            </MobileRow>

            <Row>
              <Label>이메일</Label>
              <Input type="email" placeholder="example@domain.com" />
            </Row>
          </SectionContent>
        </SectionWrapper>

        {/* 추가정보 */}
        <SectionWrapper>
          <SectionHeader>
            <span>추가정보</span>
          </SectionHeader>
          <SectionContent>
            <Row style={{ flexWrap: 'nowrap' }}>
              <Label className="required">성별</Label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label><input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} /> 남자</label>
                <label><input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} /> 여자</label>
              </div>
            </Row>
            <Row>
              <Label className="required">생년월일</Label>
              <Input type="text" placeholder="년" style={{ maxWidth: '80px' }} />
              <Input type="text" placeholder="월" style={{ maxWidth: '50px' }} />
              <Input type="text" placeholder="일" style={{ maxWidth: '50px' }} />
            </Row>
          </SectionContent>
        </SectionWrapper>

        <SubmitButton>가입하기</SubmitButton>
      </Content>
    </PageWrapper>
  );
};

export default RegisterPage;
