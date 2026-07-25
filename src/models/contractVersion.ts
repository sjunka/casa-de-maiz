export type ContractVersion = { major: number; minor: number };

export const parseContractVersion = (value: string): ContractVersion => {
  const [major, minor] = value.split('.').map(Number);
  return { major: major ?? NaN, minor: minor ?? 0 };
};

export const isContractVersionCompatible = (
  actual: string,
  supported: ContractVersion,
): boolean => {
  const parsed = parseContractVersion(actual);
  return parsed.major === supported.major && parsed.minor >= supported.minor;
};
