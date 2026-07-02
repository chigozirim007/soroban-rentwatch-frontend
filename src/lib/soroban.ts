import { Address, Keypair, StrKey, xdr } from "@stellar/stellar-sdk";
import { randomUUID } from "node:crypto";

export type StorageKind = "INSTANCE" | "PERSISTENT" | "CONTRACT_CODE";

export function isValidPublicKey(publicKey: string): boolean {
  return StrKey.isValidEd25519PublicKey(publicKey);
}

export function isValidSecretKey(secretKey: string): boolean {
  return StrKey.isValidEd25519SecretSeed(secretKey);
}

export function isValidContractId(contractId: string): boolean {
  return StrKey.isValidContract(contractId);
}

export function generateDepositMemo(): string {
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

export function generateInstanceKeyXdr(contractId: string): string {
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    }),
  );

  return ledgerKey.toXDR("base64");
}

export function generatePersistentDataKeyXdr(contractId: string, symbolName: string): string {
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key: xdr.ScVal.scvSymbol(symbolName),
      durability: xdr.ContractDataDurability.persistent(),
    }),
  );

  return ledgerKey.toXDR("base64");
}

export function validateLedgerKeyXdr(targetKeyXdr: string): boolean {
  try {
    xdr.LedgerKey.fromXDR(targetKeyXdr, "base64");
    return true;
  } catch {
    return false;
  }
}

export function validateMaybePublicKey(publicKey: unknown): publicKey is string {
  return typeof publicKey === "string" && isValidPublicKey(publicKey);
}

export function getPublicKeyFromSecret(secretKey: string): string | null {
  try {
    return Keypair.fromSecret(secretKey).publicKey();
  } catch {
    return null;
  }
}
