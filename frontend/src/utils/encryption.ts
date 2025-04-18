/**
 * API 키와 같은 민감한 데이터를 암호화하기 위한 유틸리티 함수
 * 
 * 참고: 이는 단순 클라이언트 사이드 보호용이며, 프로덕션 환경에서는 
 * 더 강력한 암호화 방식을 사용하는 것이 권장됩니다.
 */

// 암호화 키 (실제 프로덕션에서는 환경 변수로 설정)
const ENCRYPTION_KEY = 'codexgui-encryption-key-2025';

/**
 * 문자열 데이터를 암호화합니다.
 * 
 * @param data 암호화할 문자열
 * @returns 암호화된 문자열
 */
export const encryptData = (data: string): string => {
  if (!data) return '';
  
  // XOR 암호화 + Base64 인코딩 방식 사용
  const encrypted = Array.from(data)
    .map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    )
    .join('');
  
  return btoa(encrypted);
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
    const decoded = atob(encryptedData);
    
    return Array.from(decoded)
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      )
      .join('');
  } catch (e) {
    console.error('Decryption error:', e);
    return '';
  }
};
