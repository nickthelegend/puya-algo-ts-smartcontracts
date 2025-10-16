// Agent.algo.ts
import {
  Contract,
  GlobalState,
  BoxMap,
  Bytes,
  itxn,
  uint64,
  Global,
  assert,
  abimethod,
  Txn,
  Uint64,
  bytes,
  Account,
  gtxn
} from "@algorandfoundation/algorand-typescript";
import { arc4 } from '@algorandfoundation/algorand-typescript';

// Address and ARC4 types live under the arc4 submodule
import { Address, Str } from "@algorandfoundation/algorand-typescript/arc4";
import { PaymentTxn } from "@algorandfoundation/algorand-typescript/gtnx";
class VerifierStruct extends arc4.Struct<{ name: arc4.Str, isVerified: arc4.Bool, proofHash: arc4.Str }> {}
const allowedAddress = Account('LEGENDMQQJJWSQVHRFK36EP7GTM3MTI3VD3GN25YMKJ6MEBR35J4SBNVD4');

export class UserAccountContract extends Contract {
  // Agent metadata (global)
  
  ownerAddress = GlobalState<Account>();
  limit = GlobalState<uint64>();
    piggyBank = GlobalState<uint64>();
  // Task bookkeeping in boxes (index -> Task struct)
//   users_number = GlobalState<uint64>();
  // BoxMap typed storage for tasks (we store bytes; encode/decode as needed)
public verifiers = BoxMap<Account, VerifierStruct>({ keyPrefix: '' });


  // ----------------------
  // createApplication (initialize single agent)
  // ----------------------
  @abimethod()
  createApplication(ownerAddress : Account): void {
    // store the creator as the owner
    this.ownerAddress.value = ownerAddress;
    this.limit.value = 10;
    
  }


  
    @abimethod()
 verify(providerName : Str, proofHash: Str, account: Account){
assert(Txn.sender === allowedAddress, 'Only the allowed address can access this method');

this.verifiers(account).value = new VerifierStruct({
  name: providerName,
  isVerified: new arc4.Bool(true),
  proofHash: proofHash
});


 }


  
}
