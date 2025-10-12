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

  // ----------------------
  // Private helper: logEvent -> calls managerAppId (inner ApplicationCall)
  // ----------------------
  private logEvent(eventType: string, agentIndex: uint64, amount: uint64 = 0 as uint64): void {
    // if MANAGER_APP_ID is 0 we call the current application ID (use txn.applicationId)
    const manager =
      this.MANAGER_APP_ID.value === (0 as uint64) ? (Txn.applicationId as unknown as uint64) : this.MANAGER_APP_ID.value;

    // appArgs must be bytes; convert numbers to 8-byte big-endian with itob if available.
    // Use Bytes for string args.
    // itob is available in algorand-typescript op namespace; if your installed package doesn't expose it,
    // replace with a small helper that serializes uint64 to 8 bytes.
    // Here we attempt to use it directly:
    let amountBytes: bytes;
    let idxBytes: bytes;
    
      // safe fallback: encode as decimal string bytes
      idxBytes = Bytes(String(agentIndex));
      amountBytes = Bytes(String(amount));
    
    // Build and submit an inner application call to the manager app for logging
    itxn
      .applicationCall({
        appId: manager,
        appArgs: [Bytes("log_event"), Bytes(eventType), idxBytes, amountBytes],
        fee: 0 as uint64,
      })
      .submit();
  }

  // ----------------------
  // pay(amount)
  // ----------------------
  @abimethod()
  pay(amount: uint64): void {
    assert(amount > (0 as uint64), "amount must be > 0");
    const tId = Global.latestTimestamp;
    const t = {
      id: tId,
      success: true,
      timestamp: tId,
      details: "payment",
      amount: amount,
      executor: Txn.sender,
    };
    const idx = this.taskCount.value;
    // simple encoding: join small JSON-like bytes (for readability; for production pack binary)
    const encoded = Bytes(JSON.stringify(t));
this.taskBox(idx).value = encoded;
    this.taskCount.value = (idx as number) + 1 as uint64;
    this.logEvent("pay", 0 as uint64, amount);
  }

  // ----------------------
  // recordTask(...): only owner
  // ----------------------
  @abimethod()
  recordTask(success: boolean, detailsStr: string, amount: uint64): void {
    // ensure only owner can record
    assert(Txn.sender  == this.ownerAddress.value, "only owner");

    const tId = Global.latestTimestamp;
    const t = {
      id: tId,
      success: success,
      timestamp: tId,
      details: detailsStr,
      amount: amount,
      executor: Txn.sender,
    };
    const idx = this.taskCount.value;
    const encoded = Bytes(JSON.stringify(t));
    this.taskBox(idx).value = encoded;
    this.taskCount.value = (idx as number) + 1 as uint64;
    this.logEvent(success ? "task_success" : "task_fail", 0 as uint64, amount);
  }

  // ----------------------
  // payOther(target, amount) — owner only
  // ----------------------
  @abimethod()
  payOther(target: Address, amount: uint64): void {
    assert(Txn.sender === this.ownerAddress.value, "only owner");

    // inner payment
    itxn
      .payment({
        receiver: Account(target.toString()),
        amount: amount,
        fee: 0 as uint64,
      })
      .submit();

    this.logEvent("pay_other", 0 as uint64, amount);

    const tId = Global.latestTimestamp;
    const t = {
      id: tId,
      success: true,
      timestamp: tId,
      details: `paid ${target}`,
      amount: amount,
      executor: Txn.sender,
    };
    const idx = this.taskCount.value;
    const encoded = Bytes(JSON.stringify(t));
    this.taskBox(idx).value = encoded;
    this.taskCount.value = (idx as number) + 1 as uint64;
  }

  // ----------------------
  // withdraw(to, amount)
  // ----------------------
  @abimethod()
  withdraw(to: Address, amount: uint64): void {
    this.payOther(to, amount);
  }

  // ----------------------
  // transferOwnership(newOwner)
  // ----------------------
  @abimethod()
  transferOwnership(newOwner: Account): void {
    assert(Txn.sender  === this.ownerAddress.value, "only owner");
    this.ownerAddress.value = newOwner;
  }

  // ----------------------
  // Simple getters (ABI-style helpers)
  // ----------------------
  @abimethod()
  getName(): string {
    return this.name.value;
  }
  @abimethod()
  getDetails(): string {
    return this.details.value;
  }
  @abimethod()
  getPricing(): uint64 {
    return this.fixedPricing.value;
  }
  @abimethod()
  getCreatedAt(): uint64 {
    return this.createdAt.value;
  }
  @abimethod()
  getOwner(): Account {
    return this.ownerAddress.value;
  }
  @abimethod()
  getTaskCount(): uint64 {
    return this.taskCount.value;
  }
}
