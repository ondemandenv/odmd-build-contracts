import {ContractsBuild, SRC_Rev_REF} from "../../odmd-model/contracts-build";
import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {Construct} from "constructs";
import {OndemandContracts} from "../../OndemandContracts";
import {ContractsCrossRefConsumer, ContractsCrossRefProducer} from "../../odmd-model/contracts-cross-refs";
import {CoffeeShopFoundationEnver} from "./coffee-shop-foundation-cdk";

export class CoffeeShopOrderProcessorEnver extends ContractsEnverCdk {
    constructor(owner: ContractsBuild<ContractsEnverCdk>, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);


        const foundationCdk = OndemandContracts.inst.coffeeShopFoundationCdk.theOne;
        this.eventBus = new ContractsCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
        this.eventSrc = new ContractsCrossRefConsumer(this, 'eventSrc', foundationCdk.eventBusSrc.source);
        this.configTableName = new ContractsCrossRefConsumer(this, 'configTableName', foundationCdk.configTableName);
        this.countTableName = new ContractsCrossRefConsumer(this, 'countTableName', foundationCdk.countTableName);
    }

    readonly eventBus: ContractsCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly eventSrc: ContractsCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly configTableName: ContractsCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;
    readonly countTableName: ContractsCrossRefConsumer<CoffeeShopOrderProcessorEnver, CoffeeShopFoundationEnver>;

}

export class CoffeeShopOrderProcessorCdk extends ContractsBuild<ContractsEnverCdk> {

    public readonly WORKFLOW_STARTED = 'OrderProcessor.WorkflowStarted'

    public readonly envers: Array<CoffeeShopOrderProcessorEnver>


    gitHubRepo = OndemandContracts.inst.githubRepos.CoffeeShopOrderProcessorCdk
    ownerEmail?: string | undefined;

    constructor(scope: Construct) {
        super(scope, 'coffeeShopOrderProcessor');
        const coffeeF = OndemandContracts.inst.coffeeShopFoundationCdk.theOne
        this.envers = [new CoffeeShopOrderProcessorEnver(this, coffeeF.targetAWSAccountID, coffeeF.targetAWSRegion,
            new SRC_Rev_REF('b', 'master'))]
    }

}