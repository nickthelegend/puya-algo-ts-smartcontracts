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
  gtxn,
  Application
} from "@algorandfoundation/algorand-typescript";
import { arc4 } from '@algorandfoundation/algorand-typescript';
import { compile } from '@algorandfoundation/algorand-typescript'

// Address and ARC4 types live under the arc4 submodule
import { Address } from "@algorandfoundation/algorand-typescript/arc4";
import { PaymentTxn } from "@algorandfoundation/algorand-typescript/gtnx";
import { UserAccountContract } from "./UserAccount.algo";
import { encodeArc4, methodSelector } from '@algorandfoundation/algorand-typescript/arc4'

export class MainSmartContract extends Contract {
  // Agent metadata (global)
  
  maintainerAddress = GlobalState<Account>();

  // Task bookkeeping in boxes (index -> Task struct)
  users_number = GlobalState<uint64>();
  // BoxMap typed storage for tasks (we store bytes; encode/decode as needed)
  users = BoxMap<Account, Application>({keyPrefix: ""});


  // ----------------------
  // createApplication (initialize single agent)
  // ----------------------
  @abimethod()
  createApplication(): void {
    // store the creator as the owner
    this.maintainerAddress.value = Txn.sender;
    this.users_number.value = 0;
    
  }

  
  register(payTxn : gtxn.PaymentTxn){

    assert(payTxn.receiver === Global.currentApplicationAddress, 'Payment must be to the contract')
    assert(payTxn.amount === Uint64(5000), 'Incorrect payment amount')
    // Additional registration logic here



const compiled = compile(UserAccountContract)


const helloApp = itxn
  .applicationCall({
    appArgs: [methodSelector(UserAccountContract.prototype.createApplication), Txn.sender],
    approvalProgram: compiled.approvalProgram,
    clearStateProgram: compiled.clearStateProgram,
    globalNumBytes: compiled.globalBytes,
          accounts: [ Txn.sender ],

  })
  .submit().createdApp

    this.users(Txn.sender).value =helloApp



  }












  
}
