import {ContractsBuild, SRC_Rev_REF} from "../../odmd-model/contracts-build";
import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {Construct} from "constructs";
import {OndemandContracts} from "../../OndemandContracts";
import {ContractsCrossRefConsumer} from "../../odmd-model/contracts-cross-refs";
import {CoffeeShopFoundationEnver} from "./coffee-shop-foundation-cdk";

export class CoffeeShopOrderManagerEnver extends ContractsEnverCdk {
    constructor(owner: ContractsBuild<ContractsEnverCdk>, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);


        const foundationCdk = OndemandContracts.inst.coffeeShopFoundationCdk.theOne;
        this.eventBus = new ContractsCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
        this.eventSrc = new ContractsCrossRefConsumer(this, 'eventSrc', foundationCdk.eventBusSrc.source);
        this.configTableName = new ContractsCrossRefConsumer(this, 'configTableName', foundationCdk.configTableName);
        this.countTableName = new ContractsCrossRefConsumer(this, 'countTableName', foundationCdk.countTableName);

        this.preCdkCmds.push('npm --prefix lib/onWorkflowStarted install')
    }

    readonly eventBus: ContractsCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly eventSrc: ContractsCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly configTableName: ContractsCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly countTableName: ContractsCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;

}

export class CoffeeShopOrderManagerCdk extends ContractsBuild<ContractsEnverCdk> {

    readonly envers: Array<CoffeeShopOrderManagerEnver>


    gitHubRepo = OndemandContracts.inst.githubRepos.CoffeeShopOrderManagerCdk
    ownerEmail?: string | undefined;

    constructor(scope: Construct) {
        super(scope, 'coffeeShopOrderManager');
        const coffeeF = OndemandContracts.inst.coffeeShopFoundationCdk.theOne
        this.envers = [new CoffeeShopOrderManagerEnver(this, coffeeF.targetAWSAccountID, coffeeF.targetAWSRegion,
            new SRC_Rev_REF('b', 'master'))]
    }

}