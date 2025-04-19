/**
 * API 키와 같은 민감한 데이터를 암호화하기 위한 유틸리티 함수
 * 
 * 참고: 이는 단순 클라이언트 사이드 보호용이며, 프로덕션 환경에서는 
 * 더 강력한 암호화 방식을 사용하는 것이 권장됩니다.
 */

// 암호화 키 생성 및 저장
const getEncryptionKey = (): string => {
  const storedKey = localStorage.getItem('codexgui-encryption-seed');
  
  if (storedKey) {
    return storedKey;
  }
  
  // 랜덤 키 생성 (32 바이트)
  const randomKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  localStorage.setItem('codexgui-encryption-seed', randomKey);
  return randomKey;
};

// 암호화 키 (처음 실행 시 랜덤 생성되며 로컬 스토리지에 저장)
const ENCRYPTION_KEY = getEncryptionKey();

/**
 * 문자열 데이터를 암호화합니다.
 * 
 * @param data 암호화할 문자열
 * @returns 암호화된 문자열
 */
export const encryptData = (data: string): string => {
  if (!data) return '';
  
  try {
    // 1. 데이터와 키 값을 합치기 (소금 추가)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 2. 키와 소금을 혼합하여 더 강한 암호화 키 생성
    const mixedKey = ENCRYPTION_KEY + saltHex;
    
    // 3. XOR 암호화 + Base64 인코딩 방식 사용
    const encrypted = Array.from(data)
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ mixedKey.charCodeAt(i % mixedKey.length))
      )
      .join('');
    
    // 4. 소금과 함께 저장 (소금 + '.' + 암호화된 데이터)
    return `${saltHex}.${btoa(encrypted)}`;
  } catch (e) {
    console.error('Encryption error:', e);
    // 오류 발생 시 데이터 받기를 방지하기 위해 간단한 암호화 방식 사용
    const fallbackEncrypted = Array.from(data)
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      )
      .join('');
    
    return btoa(fallbackEncrypted);
  }
};

/**
 * 암호화된 문자열을 복호화합니다.
 * 
 * @param encryptedData 암호화된 문자열
 * @returns 복호화된 원본 문자열
 */
export const decryptData = (encryptedData: string): string => {
  if (!encryptedData) return '';
  
  try {
    // 소금 + 암호화된 문자열 구분 확인
    if (encryptedData.includes('.')) {
      // 1. 소금과 암호화된 데이터 분리
      const [saltHex, encryptedPart] = encryptedData.split('.');
      
      // 2. 소금과 키를 합쳐서 동일한 키 생성
      const mixedKey = ENCRYPTION_KEY + saltHex;
      
      // 3. 복호화 작업
      const decoded = atob(encryptedPart);
      
      return Array.from(decoded)
        .map((char, i) => 
          String.fromCharCode(char.charCodeAt(0) ^ mixedKey.charCodeAt(i % mixedKey.length))
        )
        .join('');
    } else {
      // 이전 방식으로 암호화된 데이터 호환성 지원
      const decoded = atob(encryptedData);
      
      return Array.from(decoded)
        .map((char, i) => 
          String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
        )
        .join('');
    }
  } catch (e) {
    console.error('Decryption error:', e);
    return '';
  }
};
