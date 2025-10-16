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
  Application,
  gtxn,
  log
} from "@algorandfoundation/algorand-typescript";
import { arc4 } from '@algorandfoundation/algorand-typescript';

// Address and ARC4 types live under the arc4 submodule
import { Address } from "@algorandfoundation/algorand-typescript/arc4";


class Task extends arc4.Struct<{ id: arc4.UintN64, success: arc4.Bool, timestamp: arc4.UintN64, details: arc4.Str, amount: arc4.UintN64 ,executor: Account}> {}

export class LoggingContract extends Contract {
  // Agent metadata (global)
  
    MANAGER_ADDRESS = GlobalState<Account>();

  // ----------------------
  // createApplication (initialize single agent)
  // ----------------------
  @abimethod()
  createApplication(ownerAddress: Account): void {
    // store the creator as the owner

    this.MANAGER_ADDRESS.value = ownerAddress;
  }



emit_log(eventName: string, agentID: Application, status: string): void {
    log("event:", eventName, "agentID:", agentID.id, "status:", status);
}

  
}
