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

// Address and ARC4 types live under the arc4 submodule
import { Address } from "@algorandfoundation/algorand-typescript/arc4";
// const allowedAddress = Application('LEGENDMQQJJWSQVHRFK36EP7GTM3MTI3VD3GN25YMKJ6MEBR35J4SBNVD4');


class Task extends arc4.Struct<{ id: arc4.UintN64, success: arc4.Bool, timestamp: arc4.UintN64, details: arc4.Str,executor: Account}> {}

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
  taskBox = BoxMap<uint64, Task>({ keyPrefix: '' });

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



  
pay(payTxn: gtxn.PaymentTxn,): void {
const expectedAmount: uint64 = Uint64(this.fixedPricing.value * 1_000_000);
  assert(payTxn.receiver === Global.currentApplicationAddress, 'payment must be to app');
    assert(payTxn.amount === expectedAmount, 'Incorrect payment amount')

  const payer: Account = payTxn.sender;
  const amount: uint64 = payTxn.amount;

  const tId = Global.latestTimestamp;
  
  const idx = this.taskCount.value;
  const task = new Task({
    id: new arc4.UintN64(this.taskCount.value++), success: new arc4.Bool(false), timestamp: new arc4.UintN64(Global.latestTimestamp),details : new arc4.Str("Payment Done!!, Task Created"), executor: payTxn.sender
  })
  this.taskBox(idx).value = task
  this.taskCount.value += 1;
}

updateTask(
  idx: uint64,
  updateSuccess: arc4.Bool,
  updateDetails: arc4.Bool,
  updateExecutor: arc4.Bool,
  success: arc4.Bool,
  details: arc4.Str,
  executor: Account
): void {
  const currentTask = this.taskBox(idx).value;
  const updatedTask = new Task({id: new arc4.UintN64(idx), timestamp: new arc4.UintN64(Global.latestTimestamp),
    success: updateSuccess ? success : currentTask.success,
    details: updateDetails ? details : currentTask.details,
    executor: updateExecutor ? executor : currentTask.executor,
  });
  this.taskBox(idx).value = updatedTask;
}

 withdraw(to: Address, amount: uint64): void {
    assert(Txn.sender === this.ownerAddress.value, 'only owner');

    itxn
      .payment({
        amount: amount,
        receiver: Txn.sender,
        fee: 0,
      })
      .submit()

    // const callTxn = itxn
    //   .applicationCall({
    //     appId: appId.id,
    //     appArgs: [arc4.methodSelector('sayHello(string,string)string'), new arc4.Str('John'), new arc4.Str('Doe')],
    //   })
    //   .submit()

    // // Extract result from the log
    // return arc4.decodeArc4<string>(callTxn.lastLog, 'log')

  }
  
}
