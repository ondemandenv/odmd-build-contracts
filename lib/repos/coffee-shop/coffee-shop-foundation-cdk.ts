import {ContractsBuild, SRC_Rev_REF} from "../../odmd-model/contracts-build";
import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {Construct} from "constructs";
import {OndemandContracts} from "../../OndemandContracts";
import {ContractsCrossRefProducer} from "../../odmd-model/contracts-cross-refs";

export class EvBusSrcRefProducer extends ContractsCrossRefProducer<CoffeeShopFoundationEnver> {

    constructor(owner: CoffeeShopFoundationEnver, id: string) {
        super(owner, id, {
            children: [{pathPart: 'ev-src'}]
        });
    }

    public get source() {
        return this.children![0]!
    }
}

export class CoffeeShopFoundationEnver extends ContractsEnverCdk {
    constructor(owner: ContractsBuild<ContractsEnverCdk>, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.eventBusSrc = new EvBusSrcRefProducer(this, 'bus-src')
        this.configTableName = new EvBusSrcRefProducer(this, 'config-table')
        this.countTableName = new EvBusSrcRefProducer(this, 'count-table')

        this.preCdkCmds.push('npm --prefix lib/initDynamo install')
    }

    readonly eventBusSrc: EvBusSrcRefProducer;
    readonly configTableName: ContractsCrossRefProducer<CoffeeShopFoundationEnver>;
    readonly countTableName: ContractsCrossRefProducer<CoffeeShopFoundationEnver>;

}

export class CoffeeShopFoundationCdk extends ContractsBuild<ContractsEnverCdk> {

    readonly envers: Array<CoffeeShopFoundationEnver>

    readonly theOne

    gitHubRepo = OndemandContracts.inst.githubRepos.CoffeeShopFoundationCdk
    ownerEmail?: string | undefined;

    constructor(scope: Construct) {
        super(scope, 'coffee-shop-foundation');
        this.theOne = new CoffeeShopFoundationEnver(this, OndemandContracts.inst.accounts.workplace2, 'us-west-1',
            new SRC_Rev_REF('b', 'master'));
        this.envers = [this.theOne]
    }

}