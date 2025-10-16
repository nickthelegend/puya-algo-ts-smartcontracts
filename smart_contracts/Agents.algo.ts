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
    gtxn,
  Account
} from "@algorandfoundation/algorand-typescript";
import { arc4 } from '@algorandfoundation/algorand-typescript';
import { compile } from '@algorandfoundation/algorand-typescript'

// Address and ARC4 types live under the arc4 submodule
import { Address, Str } from "@algorandfoundation/algorand-typescript/arc4";
import { PaymentTxn } from "@algorandfoundation/algorand-typescript/gtnx";
class Agent extends arc4.Struct<{ name: arc4.Str, details: arc4.Str, fixedPricing: arc4.UintN64, createdAt: arc4.UintN64, assetID: arc4.UintN64 ,creatorName: arc4.Str}> {}

export class AgentsContract extends Contract {
  
    maintainerAddress =  GlobalState<Account>();
    number = GlobalState<uint64>();
    
    agentMap = BoxMap<uint64, Agent>({keyPrefix : ""})



  // ----------------------
  // createApplication (initialize single agent)
  // ----------------------
  @abimethod()
  createApplication(maintainerAddress: Account): void {
    // store the creator as the owner
    this.maintainerAddress.value = maintainerAddress;
        this.number.value = 0;
  }

createAgent(agentName: Str, agentIPFS: Str, pricing: arc4.UintN64, agentImage: Str): void{

        
                const itxnResult = itxn
      .assetConfig({
        total: 100_000_000_000,
        decimals: 2,
        unitName: 'RP',
        assetName: 'Royalty Points',
      })
      .submit()

    const assetID =  itxnResult.createdAsset.id
              this.agentMap(this.number.value).value = new Agent({
                name: agentName,
                details: agentIPFS,
                fixedPricing: pricing,
                createdAt: new arc4.UintN64(Global.latestTimestamp),
                 assetID: new arc4.UintN64(assetID) ,creatorName: agentImage
              });
              this.number.value +=1;
            //   this.assetID.value = itxnResult.id;


            
        
            }

deleteAgent(agentId: uint64): void {
assert(Txn.sender === Txn.applicationId.creator, 'Only the maintainer can delete agents');
    assert(this.agentMap(agentId).exists, 'Agent does not exist');


    
    // Remove from BoxMap
    this.agentMap(agentId).delete();
    this.number.value -= 1;
  }





  
}
