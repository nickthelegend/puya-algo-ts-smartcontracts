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
  Account
} from "@algorandfoundation/algorand-typescript";

// Address and ARC4 types live under the arc4 submodule
import { Address } from "@algorandfoundation/algorand-typescript/arc4";

export class SingleAgentContract extends Contract {
  // Agent metadata (global)
  name = GlobalState<string>();
  details = GlobalState<string>();
  fixedPricing = GlobalState<uint64>();
  createdAt = GlobalState<uint64>();
  ownerAddress = GlobalState<Account>();

  // Task bookkeeping in boxes (index -> Task struct)
  taskCount = GlobalState<uint64>();
  // BoxMap typed storage for tasks (we store bytes; encode/decode as needed)
  taskBox = BoxMap<uint64, bytes>({ keyPrefix: 'taskBox' });

  // Manager app id (0 = fallback to current app caller)
  MANAGER_APP_ID = GlobalState<uint64>();

  // ----------------------
  // createApplication (initialize single agent)
  // ----------------------
  @abimethod()
  createApplication(agentName: string, agentDetails: string, pricing: uint64, managerAppId: uint64 = 0 as uint64): void {
    // store the creator as the owner
    this.ownerAddress.value = Txn.sender;
    this.name.value = agentName;
    this.details.value = agentDetails;
    this.fixedPricing.value = pricing;
    this.createdAt.value = Global.latestTimestamp;
    this.taskCount.value = 0 as uint64;
    this.MANAGER_APP_ID.value = managerAppId;
  }

  
}
